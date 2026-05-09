"use client";
import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  BarChart3,
  BadgeCheck,
  TrendingUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

type Stats = {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  totalInterviews: number;
  publicInterviews: number;
  totalAttempts: number;
  attemptsToday: number;
  pendingCreatorRequests: number;
  totalCreators: number;
  avgScore: number;
  signupsByDay: { date: string; count: number }[];
};

const chartConfig = {
  count: {
    label: "Signups",
    color: "hsl(var(--accent))",
  },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      sub: `+${stats.newUsersToday} today · +${stats.newUsersWeek} this week`,
      icon: Users,
      href: "/admin/users",
      highlight: false,
    },
    {
      label: "Interviews",
      value: stats.totalInterviews.toLocaleString(),
      sub: `${stats.publicInterviews} public`,
      icon: FileText,
      href: "/admin/interviews",
      highlight: false,
    },
    {
      label: "Attempts",
      value: stats.totalAttempts.toLocaleString(),
      sub: `${stats.attemptsToday} today`,
      icon: Activity,
      href: undefined,
      highlight: false,
    },
    {
      label: "Avg Score",
      value: `${stats.avgScore}%`,
      sub: "across all submissions",
      icon: BarChart3,
      href: undefined,
      highlight: false,
    },
    {
      label: "Pending Requests",
      value: stats.pendingCreatorRequests,
      sub: `${stats.totalCreators} total creators`,
      icon: BadgeCheck,
      href: "/admin/creator-requests",
      highlight: stats.pendingCreatorRequests > 0,
    },
    {
      label: "New This Month",
      value: stats.newUsersMonth,
      sub: "user signups",
      icon: TrendingUp,
      href: undefined,
      highlight: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-accent">Dashboard</h1>
        <p className="text-secondary text-sm">Platform overview and key metrics</p>
      </motion.div>

      {/* Pending requests alert banner */}
      {stats.pendingCreatorRequests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Link href="/admin/creator-requests">
            <Card className="border-accent/40 bg-foreground hover:border-accent transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle size={18} className="text-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">
                    {stats.pendingCreatorRequests} pending creator request
                    {stats.pendingCreatorRequests !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">Review and approve or decline</p>
                </div>
                <span className="text-xs text-accent font-medium shrink-0">Review →</span>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {cards.map((c) => {
          const CardWrapper = c.href ? Link : "div";
          return (
            <CardWrapper key={c.label} href={c.href as string} className={c.href ? "block" : undefined}>
              <Card
                className={cn(
                  "transition-colors",
                  c.href && "hover:border-accent cursor-pointer",
                  c.highlight && "border-destructive/40"
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-secondary">
                    {c.label}
                  </CardTitle>
                  <c.icon
                    size={16}
                    className={c.highlight ? "text-destructive" : "text-secondary"}
                  />
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-accent">{c.value}</p>
                    {c.highlight && Number(c.value) > 0 && (
                      <Badge variant="destructive" className="mb-1 text-[10px]">
                        Action needed
                      </Badge>
                    )}
                  </div>
                  {c.sub && (
                    <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
                  )}
                </CardContent>
              </Card>
            </CardWrapper>
          );
        })}
      </motion.div>

      {/* Signups bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New signups</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.signupsByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--secondary))" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--secondary))" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="var(--accent)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
