"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
  field: string | null;
  roleTitle: string | null;
  xp: number;
  level: number;
  createdAt: string;
  _count: { attempts: number; interviews: number };
};

function roleBadgeVariant(
  role: string,
): "destructive" | "default" | "secondary" {
  if (role === "ADMIN") return "destructive";
  if (role === "CREATOR") return "default";
  return "secondary";
}

function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), search });
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users);
        setTotal(d.total);
        setPages(d.pages);
        setLoading(false);
      });
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const changeRole = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      toast.success("Role updated");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-accent">Users</h1>
          <Badge variant="outline" className="text-accent">
            {total.toLocaleString()}
          </Badge>
        </div>
        <p className="text-secondary text-sm ">
          Manage all platform users and their roles
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="max-w-sm"
      >
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-secondary">
                {users.length === 0
                  ? "No users found"
                  : `Showing ${users.length} of ${total.toLocaleString()} users`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-secondary">User</TableHead>
                    <TableHead className="text-secondary">Role</TableHead>
                    <TableHead className="hidden md:table-cell text-secondary">
                      Level / XP
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-secondary">
                      Attempts
                    </TableHead>
                    <TableHead className="hidden lg:table-cell text-secondary">
                      Joined
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b transition-all hover:border-accent/50 hover:scale-101"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatar ?? undefined} />
                            <AvatarFallback className="text-xs text-foreground bg-accent font-bold">
                              {getInitials(u.name, u.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-accent truncate">
                              {u.name ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={roleBadgeVariant(u.role)}
                          className={cn(
                            "text-xs text-secondary border border-border py-1 bg-transparent",
                            u.role === "ADMIN" &&
                              "flex items-center gap-1 w-fit text-foreground bg-accent",
                          )}
                        >
                          {u.role === "ADMIN" && <ShieldCheck size={10} />}
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-secondary">
                        Lvl {u.level} <br /> {u.xp} XP
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-secondary">
                        {u._count.attempts}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-secondary">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-accent/50 hover:text-foreground"
                            >
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-foreground rounded-lg">
                            <DropdownMenuLabel className="text-secondary">Change role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={u.role === "STUDENT"}
                              onClick={() => changeRole(u.id, "STUDENT")}
                            >
                              Student
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={u.role === "CREATOR"}
                              onClick={() => changeRole(u.id, "CREATOR")}
                            >
                              Creator
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={u.role === "ADMIN"}
                              onClick={() => changeRole(u.id, "ADMIN")}
                            >
                              Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
