// app/how-it-works/page.tsx
export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-3xl font-bold mb-6">How It Works</h1>

      <ol className="space-y-6">
        <li className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Step 1</p>
          <h2 className="text-lg font-semibold mt-1">Find a pick on PrizePicks</h2>
          <p className="mt-2 text-sm">Note the player, opponent, stat type (PTS/REB/AST) and the line.</p>
        </li>

        <li className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Step 2</p>
          <h2 className="text-lg font-semibold mt-1">Enter it in Clutch Calc</h2>
          <p className="mt-2 text-sm">Choose player and opponent, select stat type, set the line and a 1–10 game window.</p>
        </li>

        <li className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Step 3</p>
          <h2 className="text-lg font-semibold mt-1">We fetch real game logs</h2>
          <p className="mt-2 text-sm">We pull official NBA box score data and never use fake stats.</p>
        </li>

        <li className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Step 4</p>
          <h2 className="text-lg font-semibold mt-1">See probability & charts</h2>
          <p className="mt-2 text-sm">We compute hit rate vs the line and show bar/line charts for context.</p>
        </li>
      </ol>

      <p className="mt-8 text-xs text-muted-foreground">
        Created by Mahdi Alsalami — No template or fake numbers are included.
      </p>
    </main>
  )
}
