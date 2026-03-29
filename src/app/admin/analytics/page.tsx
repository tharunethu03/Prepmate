"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

type Analytics = {
  attemptsByDay: { date: string; count: number }[];
  topInterviews: {
    id: string;
    title: string;
    difficulty: string;
    creatorField: string | null;
    creator: { name: string | null };
    _count: { attempts: number; likes: number };
  }[];
  industryBreakdown: { industry: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
};

const difficultyVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  easy: "secondary",
  medium: "outline",
  hard: "destructive",
};

const difficultyClass: Record<string, string> = {
  easy: "text-green-600 dark:text-green-400 border-green-500/40",
  medium: "text-yellow-600 dark:text-yellow-400 border-yellow-500/40",
  hard: "",
};

const attemptsChartConfig = {
  count: {
    label: "Attempts",
    color: "hsl(var(--accent))",
  },
};

const scoreChartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
};

const industryChartConfig = {
  count: {
    label: "Interviews",
    color: "hsl(var(--accent))",
  },
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return null;

  const maxScore = Math.max(...data.scoreDistribution.map((s) => s.count), 1);
  const maxIndustry = Math.max(
    ...data.industryBreakdown.map((i) => i.count),
    1,
  );

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-accent">Analytics</h1>
        <p className="text-secondary text-sm">
          Platform performance overview
        </p>
      </motion.div>

      {/* Attempts area chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview Attempts</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={attemptsChartConfig}
              className="h-52 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.attemptsByDay}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="attemptsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-count)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-count)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="var(--accent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2-column grid: score dist + industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Score distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score Distribution</CardTitle>
              <CardDescription className="text-secondary">
                Number of attempts per score range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={scoreChartConfig} className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.scoreDistribution}
                    layout="vertical"
                    margin={{ top: 0, right: 4, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-accent"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "hsl(var(--border))" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="range"
                      tick={{ fontSize: 10, fill: "hsl(var(--border))" }}
                      tickLine={false}
                      axisLine={false}
                      width={52}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="var(--accent)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Industry breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Industry Breakdown</CardTitle>
              <CardDescription className="text-secondary">
                Interviews by industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {data.industryBreakdown.map(({ industry, count }) => (
                  <div key={industry} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground truncate w-28 shrink-0">
                      {industry}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${(count / maxIndustry) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                ))}
                {data.industryBreakdown.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No data yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top interviews table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Most Attempted Public Interviews
            </CardTitle>
            <CardDescription className="text-secondary">
              Top performing interviews by attempt count
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Interview</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Difficulty
                  </TableHead>
                  <TableHead className="text-right">Attempts</TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    Likes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topInterviews.map((iv, idx) => (
                  <TableRow key={iv.id}>
                    <TableCell className="font-bold text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-accent truncate max-w-[200px]">
                        {iv.title}
                      </p>
                      <p className="text-xs text-secondary">
                        {iv.creator.name} · {iv.creatorField ?? "General"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={difficultyVariant[iv.difficulty] ?? "outline"}
                        className={cn(
                          "text-xs capitalize text-secondary",
                          difficultyClass[iv.difficulty],
                        )}
                      >
                        {iv.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm text-secondary">
                      {iv._count.attempts}
                    </TableCell>
                    <TableCell className="text-right text-sm text-secondary hidden md:table-cell">
                      {iv._count.likes}
                    </TableCell>
                  </TableRow>
                ))}
                {data.topInterviews.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-secondary"
                    >
                      No public interviews yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
