# analyzer/main.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal, List, Dict, Any
from functools import lru_cache
from cachetools import TTLCache
import asyncio, time, logging
import pandas as pd

from nba_api.stats.static import players as players_static, teams as teams_static
from nba_api.stats.endpoints import leaguegamefinder  # server-side filtering

Stat = Literal["pts", "reb", "ast"]

log = logging.getLogger("clutchcalc")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="ClutchCalc Analyzer", version="1.0.0")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://clutchcalc.vercel.app",
        "https://clutchcalc-analyzer.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COMMON_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://www.nba.com/",
    "Accept-Language": "en-US,en;q=0.9",
}

# 15-minute cache for analysis results
RESULT_CACHE = TTLCache(maxsize=500, ttl=15 * 60)

@app.get("/health")
def health():
    return {"ok": True}

def clamp_window(n: int) -> int:
    try:
        n = int(n)
    except Exception:
        n = 10
    return max(1, min(10, n))

@lru_cache(maxsize=2000)
def player_id_by_name(name: str) -> int:
    candidates = players_static.find_players_by_full_name(name)
    if not candidates:
        raise HTTPException(status_code=404, detail=f"Player not found: {name}")
    return int(candidates[0]["id"])

@lru_cache(maxsize=200)
def team_id_by_query(query: str) -> int:
    q = query.lower()
    for t in teams_static.get_teams():
        if (
            q in t["full_name"].lower()
            or q in t["abbreviation"].lower()
            or q in t["nickname"].lower()
            or q in t["city"].lower()
            or q == t["abbreviation"].lower()
        ):
            return int(t["id"])
    raise HTTPException(status_code=404, detail=f"Team not found: {query}")

def cache_key(player: str, opponent: str, stat: str, line: float, window: int) -> str:
    return f"{player}|{opponent}|{stat}|{line}|{window}"

def _fetch_games_filtered(player_id: int, opp_team_id: int, timeout: int = 12):
    """
    Use LeagueGameFinder to pull ONLY this player's games vs this opponent,
    across seasons, then slice locally.
    """
    return leaguegamefinder.LeagueGameFinder(
        player_or_team_abbreviation="P",
        person_id_nullable=player_id,
        vs_team_id_nullable=opp_team_id,
        season_type_nullable="Regular Season",
        headers=COMMON_HEADERS,
        timeout=timeout,
    )

async def fetch_recent_vs_opponent(player_id: int, opp_team_id: int, window: int) -> pd.DataFrame:
    # run the blocking nba_api call in a thread and guard with a hard timeout
    try:
        ep = await asyncio.wait_for(asyncio.to_thread(_fetch_games_filtered, player_id, opp_team_id), timeout=15)
        df = ep.get_data_frames()[0]
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="NBA Stats timed out")
    except Exception as e:
        log.exception("nba_api error")
        raise HTTPException(status_code=502, detail=f"NBA Stats failed: {e}")

    if df.empty:
        raise HTTPException(status_code=404, detail="No games found for this matchup")

    # Ensure expected columns and order by date (newest first)
    for col in ["GAME_DATE", "PTS", "REB", "AST", "TEAM_ABBREVIATION"]:
        if col not in df.columns:
            df[col] = None
    # GAME_DATE format is YYYY-MM-DD; sort descending
    df = df.sort_values("GAME_DATE", ascending=False).head(window).copy()

    # numeric stats
    for col in ["PTS", "REB", "AST"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(float)

    return df.reset_index(drop=True)

@app.get("/analyze")
async def analyze(
    player: str,
    opponent: str,
    stat: Stat,
    line: float,
    window: int = Query(10),
) -> Dict[str, Any]:
    t0 = time.perf_counter()

    window = clamp_window(window)
    if stat not in ("pts", "reb", "ast"):
        raise HTTPException(400, "Invalid stat; allowed: pts, reb, ast.")
    if line < 0:
        raise HTTPException(400, "Line must be >= 0.")

    k = cache_key(player, opponent, stat, line, window)
    if k in RESULT_CACHE:
        log.info("cache hit: %s", k)
        return RESULT_CACHE[k]

    player_id = player_id_by_name(player)
    opp_team_id = team_id_by_query(opponent)

    df = await fetch_recent_vs_opponent(player_id, opp_team_id, window)

    rows = [
        {
            "date": r.get("GAME_DATE"),
            "pts": float(r.get("PTS", 0) or 0),
            "reb": float(r.get("REB", 0) or 0),
            "ast": float(r.get("AST", 0) or 0),
            "team": r.get("TEAM_ABBREVIATION"),
        }
        for r in df.to_dict(orient="records")
    ]

    total = len(rows)
    hits = sum(1 for r in rows if r[stat] >= line)
    pct = int(round((hits / total) * 100)) if total else 0

    # newest first above; chart wants oldest->newest, so reverse
    chart = list(reversed([{"label": r["date"], "value": r[stat], "line": line} for r in rows]))

    result = {
        "player": player,
        "opponent": opponent,
        "stat": stat,
        "line": line,
        "window": window,
        "total": total,
        "hits": hits,
        "pct": pct,
        "rows": rows,
        "chart": chart,
        "source": "nba_api",
        "elapsed": round(time.perf_counter() - t0, 3),
    }
    RESULT_CACHE[k] = result
    log.info("analyze ok: %.2fs", result["elapsed"])
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
