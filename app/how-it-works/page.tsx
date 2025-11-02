// app/how-it-works/page.tsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Find a pick on PrizePicks",
      body:
        "Start on PrizePicks and note the player, the opponent, the stat type (PTS/REB/AST), and the betting line.",
    },
    {
      title: "Enter it here",
      body:
        "On the home page, choose the player and opponent team, select PTS/REB/AST, set the line, and pick the last 1–10 games window.",
    },
    {
      title: "We fetch real game logs",
      body:
        "We pull official NBA box scores from the balldontlie API for the last N games versus that opponent—no fake stats.",
    },
    {
      title: "See the probability",
      body:
        "We compute the hit rate (how many games cleared the line / total) and show charts (bar, trend, and percent).",
    },
    {
      title: "Decide with context",
      body:
        "Use the visual trends to understand consistency and volatility before you lock a pick.",
    },
  ]

  return (
    <main className="min-h-screen bg-background flex flex-col items-center px-6 py-24">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">How It Works</h1>

        <ol className="space-y-6">
          {steps.map((step, i) => (
            <li key={i} className="rounded-xl border p-5 bg-card">
              <p className="text-sm text-muted-foreground">Step {i + 1}</p>
              <h2 className="text-lg font-semibold mt-1">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>

        {/* Back to home button */}
        <div className="mt-12 flex justify-center">
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          GO LAKERS BTW LOL.
        </p>
      </div>
    </main>
  )
}
