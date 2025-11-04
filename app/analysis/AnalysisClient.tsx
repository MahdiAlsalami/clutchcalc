"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ChartData = { label: string; value: number; line: number };
type AnalysisResult = {
  player: string;
  opponent: string;
  stat: string;
  line: number;
  window: number;
  total: number;
  hits: number;
  pct: number;
  chart: ChartData[];
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

export default function AnalysisClient() {
  const params = useSearchParams();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const player = params.get("player") ?? "";
    const opponent = params.get("opponent") ?? "";
    const stat = params.get("stat") ?? "";
    const line = params.get("line") ?? "";
    const window = params.get("window") ?? "";

    if (!player || !opponent || !stat || !line || !window) {
      setError("Missing query parameters.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const base =
          process.env.NEXT_PUBLIC_ANALYZER_URL ;
        const url = `${base}/analyze?player=${encodeURIComponent(
          player
        )}&opponent=${encodeURIComponent(opponent)}&stat=${encodeURIComponent(
          stat
        )}&line=${encodeURIComponent(line)}&window=${encodeURIComponent(
          window
        )}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch analysis");
        const json = (await res.json()) as AnalysisResult;
        setData(json);
      } catch (e: any) {
        setError(e.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-indigo-400">
        Analyzing your pick...
      </div>
    );

  if (error || !data)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-center text-white">
        <p className="text-red-400 font-semibold">
          Error: {error || "No data found"}
        </p>
        <Link href="/">
          <Button className="bg-indigo-500 hover:bg-indigo-600">Go Back</Button>
        </Link>
      </div>
    );

  const blurb =
    data.pct >= 60
      ? `🔥 ${data.player} has been hot lately against ${data.opponent}!`
      : `❄️ ${data.player} has struggled to hit this line recently.`;

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
              {data.window} recent games • Tracking {data.stat.toUpperCase()} vs
              Line {data.line}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Hit rate */}
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

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full h-96"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.chart}
                  barSize={38}
                  margin={{ top: 12, right: 8, left: 8, bottom: 24 }}
                >
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(255,255,255,.70)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,.15)" }}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,.70)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,.15)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,.06)" }}
                    contentStyle={{
                      background: "rgba(17,24,39,.92)",
                      border: "1px solid rgba(255,255,255,.12)",
                      borderRadius: 12,
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "rgba(255,255,255,.85)" }}
                  />
                  <ReferenceLine
                    y={data.line}
                    stroke="rgba(250, 204, 21, .95)"
                    strokeDasharray="5 5"
                    ifOverflow="extendDomain"
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {data.chart.map((e, i) => (
                      <Cell
                        // @ts-ignore
                        key={i}
                        fill={
                          e.value >= data.line
                            ? "url(#hitGradient)"
                            : "url(#missGradient)"
                        }
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(v: number) => Math.round(v)}
                      fill="#e5e7eb"
                      style={{ textShadow: "0 2px 6px rgba(0,0,0,.8)" }}
                      className="text-xs"
                    />
                  </Bar>
                  <defs>
                    <linearGradient id="hitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient
                      id="missGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Player card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#2a1040] to-[#190b2a] p-6 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 grid place-items-center ring-1 ring-white/10">
                  <span className="text-white/95 text-xl font-semibold tracking-wide">
                    {initialsOf(data.player)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-white/90 text-lg font-semibold leading-tight">
                    {data.player}
                  </div>
                  <div className="text-sm text-white/60">
                    Matchup: {data.opponent}
                  </div>
                  <div
                    className={`mt-1 text-sm ${
                      data.pct >= 60 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {blurb}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
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
  );
}
