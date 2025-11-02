import { Header } from "@/components/layout/header"
import { EmptyState } from "@/components/empty-state"

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Analysis</h1>
          <EmptyState />
        </div>
      </main>
    </div>
  )
}
