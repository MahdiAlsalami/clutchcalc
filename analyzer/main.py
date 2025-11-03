# analyzer/main.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal, List, Dict, Any
from nba_api.stats.static import players as players_static, teams as teams_static
from nba_api.stats.endpoints import playergamelog
import pandas as pd

Stat = Literal["pts", "reb", "ast"]

app = FastAPI(title="ClutchCalc Analyzer", version="1.0.0")

# Allow calls from your Next.js dev server
VERCEL = "https://clutchcalc-<your-subdomain>.vercel.app"  # no trailing slash

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
        VERCEL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}


def clamp_window(n: int) -> int:
    try:
        n = int(n)
    except Exception:
        n = 10
    return max(1, min(10, n))

def season_labels(start: int, end: int) -> List[str]:
    """
    Build season strings like '2024-25', '2023-24', ... down to end.
    start: first season start year (e.g., 2024)
    end: last season start year (e.g., 2015)
    """
    out = []
    for y in range(start, end - 1, -1):
        out.append(f"{y}-{str((y+1) % 100).zfill(2)}")
    return out

def resolve_player_id(name: str) -> int:
    candidates = players_static.find_players_by_full_name(name)
    if not candidates:
        raise HTTPException(status_code=404, detail=f"Player not found: {name}")
    # pick first candidate (simple heuristic)
    return int(candidates[0]["id"])

def resolve_team_abbr(query: str) -> str:
    teams = teams_static.get_teams()
    q = query.lower()
    for t in teams:
        if (q in t["full_name"].lower()
            or q in t["abbreviation"].lower()
            or q in t["nickname"].lower()
            or q in t["city"].lower()
            or q == t["abbreviation"].lower()):
            return t["abbreviation"]
    raise HTTPException(status_code=404, detail=f"Team not found: {query}")

def fetch_recent_vs_opponent(player_id: int, opp_abbr: str, window: int) -> pd.DataFrame:
    """
    Pulls most recent logs across seasons until we collect `window` games vs opponent.
    nba_api PlayerGameLog works per-season; we filter on MATCHUP containing opp_abbr.
    """
    seasons = season_labels(start=2024, end=2015)
    acc: List[pd.DataFrame] = []

    for season in seasons:
        try:
            gl = playergamelog.PlayerGameLog(player_id=player_id, season=season)
            df = gl.get_data_frames()[0]
        except Exception:
            continue

        # Safely handle missing columns
        cols_needed = ["GAME_DATE", "MATCHUP", "PTS", "REB", "AST"]
        for col in cols_needed:
            if col not in df.columns:
                df[col] = None

        m = df["MATCHUP"].astype(str)
        mask = m.str.contains(opp_abbr, case=False, na=False)

        sub = df.loc[mask, cols_needed].copy()
        sub["TEAM_ABBREVIATION"] = (
            df["TEAM_ABBREVIATION"].iloc[0]
            if "TEAM_ABBREVIATION" in df.columns and not df["TEAM_ABBREVIATION"].empty
            else "N/A"
        )

        # Ensure numeric stats
        for stat in ["PTS", "REB", "AST"]:
            sub[stat] = pd.to_numeric(sub[stat], errors="coerce").fillna(0).astype(float)

        acc.append(sub)

        if acc:
            cat = pd.concat(acc, ignore_index=True)
            if len(cat) >= window:
                return cat.iloc[:window].reset_index(drop=True)

    if acc:
        cat = pd.concat(acc, ignore_index=True)
        return cat.iloc[:window].reset_index(drop=True)

    return pd.DataFrame(columns=["GAME_DATE", "PTS", "REB", "AST", "TEAM_ABBREVIATION"])


@app.get("/analyze")
def analyze(
    player: str,
    opponent: str,
    stat: Stat,
    line: float,
    window: int = Query(10),
) -> Dict[str, Any]:
    """
    Returns hit rate and chart-ready rows for last N (1..10) games vs opponent.
    """
    window = clamp_window(window)
    if stat not in ("pts", "reb", "ast"):
        raise HTTPException(400, "Invalid stat; allowed: pts, reb, ast.")
    if line < 0:
        raise HTTPException(400, "Line must be >= 0.")

    player_id = resolve_player_id(player)
    opp_abbr = resolve_team_abbr(opponent)
    df = fetch_recent_vs_opponent(player_id, opp_abbr, window)

    # rows newest-first → we will flip for display
    records = df.to_dict(orient="records")
    rows = []
    for r in records:
        rows.append({
            "date": r.get("GAME_DATE"),
            "pts": float(r.get("PTS", 0) or 0),
            "reb": float(r.get("REB", 0) or 0),
            "ast": float(r.get("AST", 0) or 0),
            "team": r.get("TEAM_ABBREVIATION"),
        })

    total = len(rows)
    hits = sum(1 for r in rows if r[stat] >= line)
    pct = int(round((hits / total) * 100)) if total else 0

    chart = list(reversed([
        {"label": r["date"], "value": r[stat], "line": line} for r in rows
    ]))

    return {
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
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
