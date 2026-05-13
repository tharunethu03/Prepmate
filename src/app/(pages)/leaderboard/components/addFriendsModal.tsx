"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2, UserCheck, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type SearchUser = {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  level: number;
  xp: number;
  role: string;
  field: string | null;
  isFriend: boolean;
  requestSent: boolean;
  requestReceived: boolean;
  friendRequestId: string | null;
};

interface AddFriendsModalProps {
  onFinish: () => void;
}

export default function AddFriendsModal({ onFinish }: AddFriendsModalProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // userId being actioned

  // Immediate search — called by the Search button and Enter key press
  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      // search failed — show empty results
    } finally {
      setSearching(false);
    }
  };

  // Debounced search — fires 400ms after the user stops typing without clicking Search
  useEffect(() => {
    if (query.trim().length < 2) {
      setUsers([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        setUsers(data.users ?? []);
      } catch {
        // search failed — show empty results
      } finally {
        setSearching(false);
      }
    }, 400); // 400ms debounce — waits for user to stop typing

    return () => clearTimeout(timeout); // cleanup on each keystroke
  }, [query]);

  const handleSendRequest = async (receiverId: string) => {
    setActionLoading(receiverId);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === receiverId ? { ...u, requestSent: true } : u,
          ),
        );
      }
    } catch {
      // request failed — leave UI unchanged
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (requestId: string, senderId: string) => {
    setActionLoading(senderId);
    try {
      const res = await fetch(`/api/friends/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === senderId
              ? { ...u, isFriend: true, requestReceived: false }
              : u,
          ),
        );
      }
    } catch {
      // accept failed — leave UI unchanged
    } finally {
      setActionLoading(null);
    }
  };

  const getActionButton = (user: SearchUser) => {
    const loading = actionLoading === user.id;

    if (user.isFriend)
      return (
        <div className="flex items-center gap-1 text-xs text-accent font-semibold px-3 py-1.5 border border-accent rounded-[11px]">
          <UserCheck size={14} /> Friends
        </div>
      );

    if (user.requestSent)
      return (
        <div className="flex items-center gap-1 text-xs text-secondary px-3 py-1.5 border border-border rounded-[11px]">
          <Check size={14} /> Request Sent
        </div>
      );

    if (user.requestReceived && user.friendRequestId)
      return (
        <Button
          className="h-8 text-xs px-4"
          onClick={() => handleAccept(user.friendRequestId!, user.id)}
          disabled={loading}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Accept"}
        </Button>
      );

    return (
      <Button
        className="h-8 text-xs px-4"
        onClick={() => handleSendRequest(user.id)}
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          "Add Friend"
        )}
      </Button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4">
      <div className="bg-foreground border-2 border-accent rounded-[22px] w-full sm:w-[90%] md:w-[80%] max-w-6xl h-[70vh] overflow-hidden relative flex flex-col">

        {/* ── Fixed header: title + search bar ── */}
        <div className="flex-shrink-0 px-5 md:px-10 pt-5 md:pt-10">
          <button className="absolute top-4 right-4" onClick={onFinish}>
            <X className="text-tertiary hover:text-secondary cursor-pointer" />
          </button>

          <h2 className="text-lg md:text-2xl font-semibold">Add Friends</h2>
          <p className="sub-text text-sm md:text-base mb-4">
            Find your crew. Compete. Grow together.
          </p>
          <hr className="border border-border my-5" />

          <div className="flex w-full gap-3 items-center pb-4">
            <Input
              searchIcon
              placeholder="Search by name or email"
              className="md:w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button className="px-10" onClick={handleSearch} disabled={searching}>
              {searching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </div>

        {/* ── Scrollable results ── */}
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto px-5 md:px-10 pb-5 md:pb-10 scrollbar-hide">
          {users.length === 0 ? (
            <div className="flex flex-col gap-3 h-full items-center justify-center">
              <p className="text-sm text-tertiary">
                People matching your search will appear here.
              </p>
              {theme === "light" ? (
                <Image
                  src="/placeholders/search-light.png"
                  alt="Search"
                  width={300}
                  height={300}
                />
              ) : (
                <Image
                  src="/placeholders/search-dark.png"
                  alt="Search"
                  width={300}
                  height={300}
                />
              )}
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border border-border rounded-[12px] px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={user.avatar || "/profile-setup/avatar1.png"}
                    alt="avatar"
                    width={45}
                    height={45}
                    className="rounded-full"
                    sizes="45px"
                  />
                  <div>
                    <p className="font-semibold text-sm">
                      {user.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-secondary">
                      {user.field ?? user.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-tertiary hidden sm:block">
                    Lvl {user.level}
                  </p>
                  {getActionButton(user)}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
