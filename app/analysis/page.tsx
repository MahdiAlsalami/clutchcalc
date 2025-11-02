"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import Link from "next/link"
import { motion } from "framer-motion"

type ChartData = { label: string; value: number; line: number }
type AnalysisResult = {
  player: string
  opponent: string
  stat: string
  line: number
  window: number
  total: number
  hits: number
  pct: number
  chart: ChartData[]
}

export default function AnalysisPage() {
  const params = useSearchParams()
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const player = params.get("player") ?? ""
    const opponent = params.get("opponent") ?? ""
    const stat = params.get("stat") ?? ""
    const line = params.get("line") ?? ""
    const window = params.get("window") ?? ""

    if (!player || !opponent || !stat || !line || !window) {
      setError("Missing query parameters.")
      setLoading(false)
      return
    }

    async function fetchAnalysis() {
      try {
        setLoading(true)
        const url = `http://127.0.0.1:8000/analyze?player=${encodeURIComponent(
          player
        )}&opponent=${encodeURIComponent(opponent)}&stat=${encodeURIComponent(
          stat
        )}&line=${encodeURIComponent(line)}&window=${encodeURIComponent(window)}`
        const res = await fetch(url)
        if (!res.ok) throw new Error("Failed to fetch analysis")
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-indigo-400">
        Analyzing your pick...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-center text-white">
        <p className="text-red-400 font-semibold">Error: {error || "No data found"}</p>
        <Link href="/">
          <Button className="bg-indigo-500 hover:bg-indigo-600">Go Back</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-16 px-6 bg-gradient-to-b from-[#050505] to-[#111827] text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <Card className="w-full border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-gradient-to-br from-black/60 via-[#0a0a0a] to-[#111827]/80 backdrop-blur-xl rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {data.player} vs {data.opponent}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-2">
              {data.window} recent games • {data.stat.toUpperCase()} vs Line {data.line}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* HIT RATE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="text-lg">
                Hit Rate:{" "}
                <span
                  className={`font-bold ${
                    data.pct >= 60 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {data.pct}% ({data.hits}/{data.total})
                </span>
              </p>
            </motion.div>

            {/* BEAUTIFUL BAR CHART */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full h-96"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chart} barSize={40}>
                  <XAxis dataKey="label" stroke="#aaa" tick={{ fill: "#bbb" }} />
                  <YAxis stroke="#aaa" tick={{ fill: "#bbb" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111",
                      border: "1px solid #333",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                  />
                  <ReferenceLine
                    y={data.line}
                    label={`Line ${data.line}`}
                    stroke="#facc15"
                    strokeDasharray="3 3"
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {data.chart.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.value >= data.line
                            ? "url(#hitGradient)"
                            : "url(#missGradient)"
                        }
                      />
                    ))}
                  </Bar>

                  {/* Gradient fills */}
                  <defs>
                    <linearGradient id="hitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient id="missGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* PLAYER CARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-gradient-to-r from-purple-600/30 to-indigo-700/30 p-6 rounded-2xl text-center border border-purple-500/30 shadow-md"
            >
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <img
                  src={`https://nba-players-profile.vercel.app/players/${data.player
                    .toLowerCase()
                    .replace(" ", "_")}.png`}
                  alt={data.player}
                  className="w-24 h-24 rounded-full border-2 border-purple-400 object-cover shadow-lg"
                  onError={(e) => ((e.currentTarget.src = "/default-player.png"))}
                />
                <div>
                  <h2 className="text-2xl font-semibold text-white">{data.player}</h2>
                  <p className="text-gray-400">Matchup: {data.opponent}</p>
                  <p
                    className={`text-sm mt-2 ${
                      data.pct >= 60 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {data.pct >= 60
                      ? `🔥 ${data.player} has been hot lately against ${data.opponent}!`
                      : `❄️ ${data.player} has struggled to hit this line recently.`}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* BUTTON */}
            <div className="text-center mt-8">
              <Link href="/">
                <Button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full shadow-md">
                  Run Another Analysis
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
