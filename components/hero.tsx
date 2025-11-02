// components/hero.tsx
"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// --- Data ---
type Player = { name: string; team: string }
type Team = { abbr: string; name: string }

const TEAMS: Team[] = [
  { abbr: "ATL", name: "Atlanta Hawks" }, { abbr: "BOS", name: "Boston Celtics" },
  { abbr: "BKN", name: "Brooklyn Nets" }, { abbr: "CHA", name: "Charlotte Hornets" },
  { abbr: "CHI", name: "Chicago Bulls" }, { abbr: "CLE", name: "Cleveland Cavaliers" },
  { abbr: "DAL", name: "Dallas Mavericks" }, { abbr: "DEN", name: "Denver Nuggets" },
  { abbr: "DET", name: "Detroit Pistons" }, { abbr: "GSW", name: "Golden State Warriors" },
  { abbr: "HOU", name: "Houston Rockets" }, { abbr: "IND", name: "Indiana Pacers" },
  { abbr: "LAC", name: "Los Angeles Clippers" }, { abbr: "LAL", name: "Los Angeles Lakers" },
  { abbr: "MEM", name: "Memphis Grizzlies" }, { abbr: "MIA", name: "Miami Heat" },
  { abbr: "MIL", name: "Milwaukee Bucks" }, { abbr: "MIN", name: "Minnesota Timberwolves" },
  { abbr: "NOP", name: "New Orleans Pelicans" }, { abbr: "NYK", name: "New York Knicks" },
  { abbr: "OKC", name: "Oklahoma City Thunder" }, { abbr: "ORL", name: "Orlando Magic" },
  { abbr: "PHI", name: "Philadelphia 76ers" }, { abbr: "PHX", name: "Phoenix Suns" },
  { abbr: "POR", name: "Portland Trail Blazers" }, { abbr: "SAC", name: "Sacramento Kings" },
  { abbr: "SAS", name: "San Antonio Spurs" }, { abbr: "TOR", name: "Toronto Raptors" },
  { abbr: "UTA", name: "Utah Jazz" }, { abbr: "WAS", name: "Washington Wizards" },
]

const PLAYERS: Player[] = [
  { name: "LeBron James", team: "Los Angeles Lakers" },
  { name: "Stephen Curry", team: "Golden State Warriors" },
  { name: "Kevin Durant", team: "Phoenix Suns" },
  { name: "Giannis Antetokounmpo", team: "Milwaukee Bucks" },
  { name: "Nikola Jokic", team: "Denver Nuggets" },
  { name: "Luka Doncic", team: "Dallas Mavericks" },
  { name: "Jayson Tatum", team: "Boston Celtics" },
  { name: "Joel Embiid", team: "Philadelphia 76ers" },
  { name: "Shai Gilgeous-Alexander", team: "Oklahoma City Thunder" },
  { name: "Damian Lillard", team: "Milwaukee Bucks" },
  { name: "Anthony Davis", team: "Los Angeles Lakers" },
  { name: "Devin Booker", team: "Phoenix Suns" },
  { name: "Jimmy Butler", team: "Miami Heat" },
  { name: "Anthony Edwards", team: "Minnesota Timberwolves" },
  { name: "Kawhi Leonard", team: "Los Angeles Clippers" },
  { name: "Paul George", team: "Philadelphia 76ers" }, // 2024-25 move
  { name: "Kyrie Irving", team: "Dallas Mavericks" },
  { name: "Donovan Mitchell", team: "Cleveland Cavaliers" },
  { name: "Trae Young", team: "Atlanta Hawks" },
  { name: "Ja Morant", team: "Memphis Grizzlies" },
]

// --- Helpers ---
function clampWindow(n: number) {
  if (Number.isNaN(n)) return 10
  return Math.max(1, Math.min(10, Math.floor(n)))
}

export function Hero() {
  const router = useRouter()

  // Start blank instead of pre-filled
  const [player, setPlayer] = useState("")       // value is player's full name
  const [opponent, setOpponent] = useState("")   // value is team's full name
  const [stat, setStat] = useState("pts")
  const [line, setLine] = useState("")
  const [window, setWindow] = useState("10")

  // Derive selected player's team, filter it out from opponent list
  const playersTeam = useMemo(() => {
    const p = PLAYERS.find((x) => x.name === player)
    return p?.team ?? null
  }, [player])

  const filteredTeams = useMemo(() => {
    if (!playersTeam) return TEAMS
    return TEAMS.filter((t) => t.name !== playersTeam)
  }, [playersTeam])

  const handleAnalysis = (e: React.FormEvent) => {
    e.preventDefault()

    if (!player || !opponent || line === "") {
      alert("Please pick a player, choose an opponent, and enter a line.")
      return
    }
    // no self-matchups
    if (playersTeam && opponent === playersTeam) {
      alert("A player cannot face their own team. Pick a different opponent.")
      return
    }

    // clamp window between 1–10 and validate line
    const windowVal = clampWindow(Number(window) || 10)
    const nLine = Number(line)
    if (Number.isNaN(nLine) || nLine < 0) {
      alert("Line must be a non-negative number.")
      return
    }

    const params = new URLSearchParams({
      player,
      opponent,
      stat,
      line: String(nLine),
      window: String(windowVal),
    })
    router.push(`/analysis?${params.toString()}`)
  }

  return (
    <div className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Court background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5 dark:opacity-10"
        viewBox="0 0 940 500"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect x="50" y="50" width="840" height="400" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="250" x2="890" y2="250" stroke="currentColor" strokeWidth="2" />
        <circle cx="470" cy="250" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="470" cy="250" r="6" fill="currentColor" />
        <path d="M 50 90 L 130 90 Q 130 170 90 210 L 90 290 Q 130 330 130 410 L 50 410" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M 890 90 L 810 90 Q 810 170 850 210 L 850 290 Q 810 330 810 410 L 890 410" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>

      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full opacity-10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Analyze Your{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Player Props
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Find bets on{" "}
              <a
                href="https://www.prizepicks.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                PrizePicks
              </a>
              , then analyze them here with Clutch Calc. Get instant insights on NBA player props with precision and style.
            </p>
          </div>

          {/* Form */}
          <div className="backdrop-blur-xl bg-card/40 border border-border rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleAnalysis} className="space-y-6">
              {/* Player (dropdown) */}
              <div className="space-y-2">
                <Label htmlFor="player" className="text-sm font-medium">Player</Label>
                <Select
                  value={player}
                  onValueChange={(val) => {
                    setPlayer(val)
                    // if opponent equals player's team, reset it
                    const t = PLAYERS.find((p) => p.name === val)?.team
                    if (t && opponent === t) setOpponent("")
                  }}
                >
                  <SelectTrigger id="player" className="bg-background/50 border-border">
                    <SelectValue placeholder="Choose a player" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAYERS.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name} ({p.team})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Opponent (dropdown, auto-hides player's team) */}
              <div className="space-y-2">
                <Label htmlFor="opponent" className="text-sm font-medium">Opponent</Label>
                <Select value={opponent} onValueChange={setOpponent}>
                  <SelectTrigger id="opponent" className="bg-background/50 border-border">
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTeams.map((t) => (
                      <SelectItem key={t.abbr} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {playersTeam && player && (
                  <p className="text-xs text-muted-foreground">
                    {player} plays for {playersTeam}. That team is hidden from the list.
                  </p>
                )}
              </div>

              {/* Stat type */}
              <div className="space-y-2">
                <Label htmlFor="stat" className="text-sm font-medium">Stat Type</Label>
                <Select value={stat} onValueChange={setStat}>
                  <SelectTrigger id="stat" className="bg-background/50 border-border">
                    <SelectValue placeholder="Select stat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pts">Points (PTS)</SelectItem>
                    <SelectItem value="reb">Rebounds (REB)</SelectItem>
                    <SelectItem value="ast">Assists (AST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Line + Window */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="line" className="text-sm font-medium">Line</Label>
                  <Input
                    id="line"
                    type="number"
                    min={0}
                    step="0.5"
                    placeholder="e.g. 25"
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    className="bg-background/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="window" className="text-sm font-medium">Window (games)</Label>
                  <Input
                    id="window"
                    type="number"
                    min={1}
                    max={10}
                    step="1"
                    placeholder="10"
                    value={window}
                    onChange={(e) => setWindow(e.target.value)}
                    className="bg-background/50 border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">We cap between 1 and 10.</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-6"
              >
                Start Analysis
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
