"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutGrid,
  Users,
  FileText,
  BadgeCheck,
  BarChart3,
  ShieldCheck,
  ArrowLeft,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
  {
    href: "/admin/creator-requests",
    label: "Creator Requests",
    icon: BadgeCheck,
  },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/interviews", label: "Interviews", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  const [logout, setLogout] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Logo + brand */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <Image
          src="/logo.png"
          alt="Prepmate"
          width={130}
          height={32}
          className="object-contain"
          style={{ imageRendering: "pixelated" }}
          priority
        />
        <Badge
          variant="default"
          className="ml-auto text-[10px] px-1.5 py-1 flex items-center gap-1 bg-accent text-foreground"
        >
          <ShieldCheck size={10} />
          Admin
        </Badge>
      </div>
      {/* <Separator /> */}

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-2 py-4 flex-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-all",
                active
                  ? "bg-accent text-foreground"
                  : "text-secondary hover:text-accent hover:bg-accent/30 hover:scale-105",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* <Separator /> */}
      {/* Back to app */}
      <div className="flex flex-col w-full gap-3 py-5 px-3">
        <Button variant={"outline"} className="px-2 py-4 ">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-secondary hover:text-accent transition-colors"
          >
            <ChevronLeft size={16} />
            Back to App
          </Link>
        </Button>
        <Button onClick={() => setLogout(true)}>Log Out</Button>
      </div>
      {logout && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-100">
          <div className="bg-foreground border border-accent  rounded-[22px] shadow-lg px-10 py-5">
            <div className="flex flex-col items-center justify-center">
              <h3 className="mb-3">Log out from Admin Panel?</h3>
              <p className="sub-text mb-5 max-w-xs text-center">
                You’re about to sign out of the admin panel.
              </p>
              <div className="flex items-center justify-between w-full px-10 gap-3 md:gap-0">
                <Button
                  variant={"outline"}
                  className="cursor-pointer px-6"
                  onClick={() => setLogout(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant={"default"}
                  className="bg-error hover:bg-error/90 px-6 text-white"
                  onClick={() => signOut()}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPageName(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/creator-requests")) return "Creator Requests";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/interviews")) return "Interviews";
  if (pathname.startsWith("/admin/analytics")) return "Analytics";
  return "Admin";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (status === "loading" || session?.user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pageName = getPageName(pathname);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r bg-background h-full">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-56 bg-background border-r z-10">
            <div className="flex items-center justify-end px-3 py-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header bar */}
        <header className="h-14 border-b flex items-center px-4 gap-3 shrink-0 bg-background">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-2 text-sm text-secondary">
            <ShieldCheck size={14} className="text-accent" />
            <span>{session.user.name ?? session.user.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="px-6 py-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
