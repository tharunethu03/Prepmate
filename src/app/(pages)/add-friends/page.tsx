"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, UserPlus, Clock, X, Users } from "lucide-react";
import { toast } from "sonner";

type UserResult = {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  level: number;
  role: string;
  field: string | null;
  isFriend: boolean;
  requestSent: boolean;
  requestReceived: boolean;
  friendRequestId: string | null;
};

type Friend = {
  id: string;
  name: string | null;
  avatar: string | null;
  level: number;
  friendshipId: string;
};

type PendingRequest = {
  id: string;
  sender: { id: string; name: string | null; avatar: string | null };
};

export default function AddFriendsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<PendingRequest[]>([]);
  // Set<string> lets me track multiple concurrent loading states (e.g. two buttons
  // clicked quickly) without one overwriting the other
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  // useRef for the debounce timer so updating it doesn't trigger a re-render
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load friends and pending requests on mount
  useEffect(() => {
    fetch("/api/friends")
      .then((r) => r.json())
      .then((data) => {
        setFriends(data.friends ?? []);
        setPendingReceived(data.pendingReceived ?? []);
      });
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.users ?? []);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [query]);

  const setLoading = (id: string, on: boolean) =>
    setLoadingIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  const sendRequest = async (userId: string) => {
    setLoading(userId, true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      if (res.ok) {
        setResults((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, requestSent: true } : u))
        );
        toast.success("Friend request sent!");
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Failed to send request");
      }
    } finally {
      setLoading(userId, false);
    }
  };

  const acceptRequest = async (requestId: string, senderId: string, senderName: string | null) => {
    setLoading(requestId, true);
    try {
      const res = await fetch(`/api/friends/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      if (res.ok) {
        setPendingReceived((prev) => prev.filter((r) => r.id !== requestId));
        toast.success(`You and ${senderName ?? "them"} are now friends!`);
        // Refresh friends list
        fetch("/api/friends").then((r) => r.json()).then((d) => setFriends(d.friends ?? []));
        // Update search results if visible
        setResults((prev) =>
          prev.map((u) => (u.id === senderId ? { ...u, isFriend: true, requestReceived: false } : u))
        );
      }
    } finally {
      setLoading(requestId, false);
    }
  };

  const declineRequest = async (requestId: string) => {
    setLoading(requestId, true);
    try {
      await fetch(`/api/friends/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      });
      setPendingReceived((prev) => prev.filter((r) => r.id !== requestId));
    } finally {
      setLoading(requestId, false);
    }
  };

  const unfriend = async (friendshipId: string, friendId: string) => {
    setLoading(friendshipId, true);
    try {
      await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
      setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      setResults((prev) =>
        prev.map((u) => (u.id === friendId ? { ...u, isFriend: false } : u))
      );
      toast.success("Unfriended");
    } finally {
      setLoading(friendshipId, false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Add Friends</h1>
        <p className="text-secondary text-sm mt-1">
          Search by name or email to connect with students and creators.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary w-4 h-4" />
        <Input
          className="pl-9"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Search Results */}
      {(results.length > 0 || searching) && (
        <section className="space-y-2">
          {searching && (
            <p className="text-secondary text-sm">Searching...</p>
          )}
          {results.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              loading={loadingIds.has(u.id) || (u.friendRequestId ? loadingIds.has(u.friendRequestId) : false)}
              onSend={() => sendRequest(u.id)}
              onAccept={u.friendRequestId ? () => acceptRequest(u.friendRequestId!, u.id, u.name) : undefined}
              onDecline={u.friendRequestId ? () => declineRequest(u.friendRequestId!) : undefined}
              onUnfriend={u.isFriend ? () => {
                const f = friends.find((fr) => fr.id === u.id);
                if (f) unfriend(f.friendshipId, u.id);
              } : undefined}
            />
          ))}
          {!searching && results.length === 0 && query.length >= 2 && (
            <p className="text-secondary text-sm">No users found for &quot;{query}&quot;.</p>
          )}
        </section>
      )}

      {/* Pending Requests */}
      {pendingReceived.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-primary mb-3">
            Friend Requests ({pendingReceived.length})
          </h2>
          <div className="space-y-2">
            {pendingReceived.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 bg-foreground border border-border rounded-[16px] px-4 py-3 card-shadow"
              >
                <Image
                  src={req.sender.avatar ?? "/profile-setup/avatar1.png"}
                  width={40}
                  height={40}
                  alt="avatar"
                  className="rounded-full shrink-0"
                />
                <p className="text-primary font-medium flex-1 text-sm truncate">
                  {req.sender.name ?? "Unknown"}
                </p>
                <Button
                  size="sm"
                  disabled={loadingIds.has(req.id)}
                  onClick={() => acceptRequest(req.id, req.sender.id, req.sender.name)}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingIds.has(req.id)}
                  onClick={() => declineRequest(req.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Friends List */}
      <section>
        <h2 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Your Friends ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <p className="text-secondary text-sm">
            You haven&apos;t added any friends yet. Search above to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div
                key={f.friendshipId}
                className="flex items-center gap-3 bg-foreground border border-border rounded-[16px] px-4 py-3 card-shadow"
              >
                <Image
                  src={f.avatar ?? "/profile-setup/avatar1.png"}
                  width={40}
                  height={40}
                  alt="avatar"
                  className="rounded-full shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-primary font-medium text-sm truncate">
                    {f.name ?? "Unknown"}
                  </p>
                  <p className="text-tertiary text-xs">Level {f.level}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-error border-error/30 hover:bg-error/10 text-xs"
                  disabled={loadingIds.has(f.friendshipId)}
                  onClick={() => unfriend(f.friendshipId, f.id)}
                >
                  Unfriend
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function UserRow({
  user,
  loading,
  onSend,
  onAccept,
  onDecline,
  onUnfriend,
}: {
  user: UserResult;
  loading: boolean;
  onSend: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onUnfriend?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-foreground border border-border rounded-[16px] px-4 py-3 card-shadow">
      <Image
        src={user.avatar ?? "/profile-setup/avatar1.png"}
        width={40}
        height={40}
        alt="avatar"
        className="rounded-full shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-primary font-medium text-sm truncate">
          {user.name ?? user.email}
        </p>
        <p className="text-tertiary text-xs capitalize">
          {user.role.toLowerCase()} {user.field ? `· ${user.field}` : ""}
        </p>
      </div>

      {user.isFriend ? (
        <Button size="sm" variant="outline" disabled={loading} onClick={onUnfriend}
          className="text-error border-error/30 hover:bg-error/10 text-xs">
          Unfriend
        </Button>
      ) : user.requestReceived && onAccept ? (
        <div className="flex gap-2">
          <Button size="sm" disabled={loading} onClick={onAccept}>Accept</Button>
          <Button size="sm" variant="outline" disabled={loading} onClick={onDecline}><X className="w-3 h-3" /></Button>
        </div>
      ) : user.requestSent ? (
        <div className="flex items-center gap-1 text-tertiary text-xs">
          <Clock className="w-3 h-3" /> Sent
        </div>
      ) : (
        <Button size="sm" disabled={loading} onClick={onSend}>
          <UserPlus className="w-4 h-4 mr-1" /> Add
        </Button>
      )}
    </div>
  );
}
