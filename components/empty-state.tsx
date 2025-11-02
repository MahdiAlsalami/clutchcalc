export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-lg bg-card/50 backdrop-blur-lg border border-border p-12 max-w-md">
        <h2 className="text-2xl font-bold mb-3">Analysis Ready</h2>
        <p className="text-muted-foreground mb-6">
          You can build this screen next. Return to the home page to submit your prop analysis.
        </p>
      </div>
    </div>
  )
}
