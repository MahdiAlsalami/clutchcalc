import { Card } from "@/components/ui/card"
import { Zap, Brain, TrendingUp } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Zap,
      title: "Fast Setup",
      description: "Enter your pick in seconds and get instant analysis",
    },
    {
      icon: Brain,
      title: "Smart Insights",
      description: "Analyze trends and patterns with AI-powered insights",
    },
    {
      icon: TrendingUp,
      title: "Accurate Data",
      description: "Real NBA stats power your choices with precision",
    },
  ]

  return (
    <section className="py-20 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="p-6 backdrop-blur-lg bg-card/50 border-border hover:border-primary/50 transition"
              >
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
