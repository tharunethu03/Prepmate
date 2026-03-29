"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  Linkedin,
  Github,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Request = {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  field: string | null;
  roleTitle: string | null;
  portfolioLink: string | null;
  linkedinLink: string | null;
  githubLink: string | null;
  creatorRequestedAt: string | null;
  xp: number;
  level: number;
  _count: { attempts: number };
};

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

function DeclineModal({
  user,
  onConfirm,
  onClose,
}: {
  user: Request;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-border">
          <CardHeader className="pb-3">
            <h3 className="font-bold text-foreground text-base">Decline Request</h3>
            <p className="text-sm text-muted-foreground">
              Declining{" "}
              <span className="text-foreground font-medium">
                {user.name ?? user.email}
              </span>
              . Add an optional reason — it will be included in the email sent to the user.
            </p>
          </CardHeader>
          <CardContent>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Please add at least one social link to your profile before re-applying."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground"
            />
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => onConfirm(reason)}>
              Decline &amp; Notify
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function CreatorRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [declining, setDeclining] = useState<Request | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/creator-requests")
      .then((r) => r.json())
      .then((d) => { setRequests(d); setLoading(false); });
  }, []);

  const handle = async (userId: string, action: "approve" | "decline", reason?: string) => {
    setProcessing(userId);
    setDeclining(null);
    try {
      const res = await fetch(`/api/admin/creator-requests/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) throw new Error();
      toast.success(action === "approve" ? "Creator approved! Email sent." : "Request declined. Email sent.");
      setRequests((prev) => prev.filter((r) => r.id !== userId));
    } catch {
      toast.error("Something went wrong");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {declining && (
        <DeclineModal
          user={declining}
          onConfirm={(reason) => handle(declining.id, "decline", reason)}
          onClose={() => setDeclining(null)}
        />
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-accent">Creator Requests</h1>
          <Badge variant="outline" className="text-accent">{requests.length}</Badge>
        </div>
        <p className="text-secondary text-sm mt-1">
          {requests.length} Pending request{requests.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16">
              <CheckCircle size={36} className="text-accent" />
              <p className="font-semibold text-accent">All caught up!</p>
              <p className="text-sm text-secondary">No pending creator requests.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req, i) => {
            const hasSocialLinks = req.portfolioLink || req.linkedinLink || req.githubLink;
            const isProcessing = processing === req.id;

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={req.avatar ?? undefined} />
                          <AvatarFallback className="text-sm">
                            {getInitials(req.name, req.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">
                            {req.name ?? "—"}
                          </p>
                          <p className="text-sm text-muted-foreground">{req.email}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right shrink-0">
                        <p className="text-sm text-foreground font-medium">Lv. {req.level}</p>
                        <p className="text-xs text-muted-foreground">
                          {req.xp} XP · {req._count.attempts} attempts
                        </p>
                        {req.creatorRequestedAt && (
                          <div className="flex items-center gap-1 mt-1 justify-end text-muted-foreground">
                            <Clock size={11} />
                            <span className="text-xs">
                              {new Date(req.creatorRequestedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Field / role badges */}
                    {(req.field || req.roleTitle) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {req.field && (
                          <Badge variant="outline" className="text-xs">
                            {req.field}
                          </Badge>
                        )}
                        {req.roleTitle && (
                          <Badge variant="outline" className="text-xs">
                            {req.roleTitle}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <Separator />

                  <CardContent className="pt-4">
                    {/* Social links */}
                    <div className="flex flex-wrap gap-2">
                      {req.linkedinLink ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={req.linkedinLink} target="_blank" rel="noopener noreferrer">
                            <Linkedin size={13} className="mr-1.5" />
                            LinkedIn
                            <ExternalLink size={11} className="ml-1.5 opacity-50" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled className="opacity-40">
                          <Linkedin size={13} className="mr-1.5" />
                          No LinkedIn
                        </Button>
                      )}

                      {req.githubLink ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={req.githubLink} target="_blank" rel="noopener noreferrer">
                            <Github size={13} className="mr-1.5" />
                            GitHub
                            <ExternalLink size={11} className="ml-1.5 opacity-50" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled className="opacity-40">
                          <Github size={13} className="mr-1.5" />
                          No GitHub
                        </Button>
                      )}

                      {req.portfolioLink ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={req.portfolioLink} target="_blank" rel="noopener noreferrer">
                            <Globe size={13} className="mr-1.5" />
                            Portfolio
                            <ExternalLink size={11} className="ml-1.5 opacity-50" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled className="opacity-40">
                          <Globe size={13} className="mr-1.5" />
                          No Portfolio
                        </Button>
                      )}

                      {!hasSocialLinks && (
                        <Badge
                          variant="outline"
                          className="text-xs border-yellow-500/40 text-yellow-600 dark:text-yellow-400 flex items-center gap-1"
                        >
                          <AlertTriangle size={11} />
                          No social links
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button
                      onClick={() => handle(req.id, "approve")}
                      disabled={isProcessing}
                      size="sm"
                    >
                      <CheckCircle size={14} className="mr-1.5" />
                      {isProcessing ? "Processing…" : "Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setDeclining(req)}
                      disabled={isProcessing}
                      size="sm"
                    >
                      <XCircle size={14} className="mr-1.5" />
                      Decline
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
