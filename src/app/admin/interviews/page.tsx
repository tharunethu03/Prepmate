"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  MoreHorizontal,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InterviewRow = {
  id: string;
  title: string;
  visibility: string;
  difficulty: string;
  interviewType: string;
  creatorField: string | null;
  createdAt: string;
  creator: { id: string; name: string | null; email: string; role: string };
  _count: { attempts: number; likes: number };
};

const difficultyClass: Record<string, string> = {
  easy: "text-green-600 dark:text-green-400 border-green-500/40",
  medium: "text-yellow-600 dark:text-yellow-400 border-yellow-500/40",
  hard: "",
};

const difficultyVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  easy: "secondary",
  medium: "outline",
  hard: "destructive",
};

export default function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      search,
      visibility,
    });
    fetch(`/api/admin/interviews?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setInterviews(d.interviews);
        setTotal(d.total);
        setPages(d.pages);
        setLoading(false);
      });
  }, [page, search, visibility]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmAndDelete = (id: string, title: string) => {
    setConfirmDelete({ id, title });
  };

  const remove = async () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setDeleting(id);
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/admin/interviews/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Interview deleted");
      setInterviews((prev) => prev.filter((i) => i.id !== id));
      setTotal((t) => t - 1);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Interview?"
        description={`"${confirmDelete?.title}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={!!deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(null)}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-accent">Interviews</h1>
          <Badge variant="outline" className="text-accent">
            {total.toLocaleString()}
          </Badge>
        </div>
        <p className="text-secondary text-sm">
          Browse and manage all platform interviews
        </p>
      </motion.div>

      {/* Filters row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="relative w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search interviews…"
            className="pl-9"
          />
        </div>
        <Select
          value={visibility}
          onValueChange={(val) => {
            setVisibility(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 border border-border rounded-lg">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent className="bg-foreground">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-secondary">
                {interviews.length === 0
                  ? "No interviews found"
                  : `Showing ${interviews.length} of ${total.toLocaleString()} interviews`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title / Creator</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Visibility
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Difficulty
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell text-left">
                      Attempts / Likes
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((iv, i) => (
                    <motion.tr
                      key={iv.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b transition-all hover:border-accent/50"
                    >
                      <TableCell>
                        <p className="text-sm font-medium text-accent truncate max-w-[180px]">
                          {iv.title}
                        </p>
                        <p className="text-xs text-secondary truncate">
                          {iv.creator.name ?? iv.creator.email} ·{" "}
                          {iv.creatorField ?? iv.interviewType}
                        </p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs flex items-center gap-1 w-fit",
                            iv.visibility === "public"
                              ? "border-success text-green-600"
                              : "text-secondary",
                          )}
                        >
                          {iv.visibility === "public" ? (
                            <Globe size={10} />
                          ) : (
                            <Lock size={10} />
                          )}
                          {iv.visibility}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={
                            difficultyVariant[iv.difficulty] ?? "outline"
                          }
                          className={cn(
                            "text-xs text-secondary capitalize",
                            difficultyClass[iv.difficulty],
                          )}
                        >
                          {iv.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-secondary capitalize">
                        {iv.interviewType}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center">
                        <p className="text-sm text-secondary">
                          {iv._count.attempts} Attempts
                        </p>
                        <p className="text-xs text-secondary">
                          {iv._count.likes} Likes
                        </p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-secondary">
                        {new Date(iv.createdAt).toLocaleDateString()}
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
                          <DropdownMenuContent
                            align="end"
                            className="bg-foreground"
                          >
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-error focus:bg-error hover:text-foreground transition-colors"
                              disabled={deleting === iv.id}
                              onClick={() => confirmAndDelete(iv.id, iv.title)}
                            >
                              <Trash2 size={13} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {interviews.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-12 text-secondary"
                      >
                        No interviews found
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
          <p className="text-secondary">
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
