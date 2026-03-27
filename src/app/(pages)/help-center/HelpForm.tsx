"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

const HelpForm = () => {
  const { data: session } = useSession();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (!res.ok) throw new Error("Failed to send");

      toast.success("Message sent! We'll get back to you soon.");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
      {/* User info — read only */}
      <div className="flex gap-5">
        <div className="flex-1">
          <Label>Email</Label>
          <p className="text-sm text-secondary mt-1 border border-border rounded-[12px] px-3 py-2">
            {session?.user?.email}
          </p>
        </div>
        <div className="flex-1">
          <Label>Name</Label>
          <p className="text-sm text-secondary mt-1 border border-border rounded-[12px] px-3 py-2">
            {session?.user?.name ?? "Guest"}
          </p>
        </div>
      </div>

      {/* Subject */}
      <div>
        <Label>
          Subject <span className="text-error">*</span>
        </Label>
        <Input
          className="mt-2 md:w-full"
          placeholder="What do you need help with?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      {/* Message */}
      <div>
        <Label>
          Message <span className="text-error">*</span>
        </Label>
        <Textarea
          className="mt-2 min-h-36 resize-none w-full"
          placeholder="Describe your issue in detail..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={sending || !subject.trim() || !message.trim()}
        className="w-full flex items-center gap-2"
      >
        {sending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send size={16} /> Send Message
          </>
        )}
      </Button>
    </form>
  );
};

export default HelpForm;
