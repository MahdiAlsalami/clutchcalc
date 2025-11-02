// components/hero.tsx
"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function Hero() {
  const router = useRouter()

  // Start blank instead of pre-filled
  const [player, setPlayer] = useState("")
  const [opponent, setOpponent] = useState("")
  const [stat, setStat] = useState("pts")
  const [line, setLine] = useState("")
  const [window, setWindow] = useState("10")

  const handleAnalysis = (e: React.FormEvent) => {
    e.preventDefault()

    if (!player.trim() || !opponent.trim() || line === "") {
      alert("Please fill out player, opponent, and line before analyzing.")
      return
    }

    // clamp window between 1–10
    const windowVal = Math.max(1, Math.min(10, Number(window) || 10))

    const params = new URLSearchParams({
      player: player.trim(),
      opponent: opponent.trim(),
      stat,
      line,
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
        <path
          d="M 50 90 L 130 90 Q 130 170 90 210 L 90 290 Q 130 330 130 410 L 50 410"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M 890 90 L 810 90 Q 810 170 850 210 L 850 290 Q 810 330 810 410 L 890 410"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
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
              , then analyze them here with Clutch Calc. Get instant insights on NBA player props with precision and
              style.
            </p>
          </div>

          {/* Form */}
          <div className="backdrop-blur-xl bg-card/40 border border-border rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleAnalysis} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="player" className="text-sm font-medium">
                  Player Name
                </Label>
                <Input
                  id="player"
                  placeholder="Choose a player"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opponent" className="text-sm font-medium">
                  Opponent
                </Label>
                <Input
                  id="opponent"
                  placeholder="Choose a team"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stat" className="text-sm font-medium">
                  Stat Type
                </Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="line" className="text-sm font-medium">
                    Line
                  </Label>
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
                  <Label htmlFor="window" className="text-sm font-medium">
                    Window (games)
                  </Label>
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
