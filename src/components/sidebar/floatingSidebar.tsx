import React, { useState, useEffect, useRef } from "react";
import {
  LayoutGrid,
  Search,
  Pencil,
  Bookmark,
  Trophy,
  Menu,
  Puzzle,
  Info,
  CircleQuestionMark,
  Settings,
  LogOut,
  X,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { SidebarItem } from "./sidebarItem";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence, easeOut, easeIn } from "framer-motion";

const FloatingSidebar = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: easeOut,
        staggerChildren: 0.06,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -10,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
  };

  const backdropVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: easeOut,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: easeIn,
      },
    },
  };

  return (
    <div className="md:hidden">
      {/* Floating Button */}
      <motion.button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(open ? false : true);
        }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="fixed top-6 left-6 z-50 w-14 h-14 rounded-full bg-accent text-background flex items-center justify-center "
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute"
            >
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute"
            >
              <Menu size={24} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Expandable Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              ref={menuRef}
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-15 left-3 flex flex-col justify-between py-8 px-3 rounded-[22px] w-fit z-40 "
            >
              {[
                {
                  href: "/dashboard",
                  label: "Dashboard",
                  icon: LayoutGrid,
                },
                {
                  href: "/explore-interviews",
                  label: "Explore Interviews",
                  icon: Search,
                },
                {
                  href: "/create-interviews",
                  label: "Create Interviews",
                  icon: Pencil,
                },
                {
                  href: "/saved-interviews",
                  label: "Saved Interviews",
                  icon: Bookmark,
                },
                {
                  href: "/leaderboard",
                  label: "Leaderboard",
                  icon: Trophy,
                },
                {
                  href: "/challenges",
                  label: "Challenges",
                  icon: Puzzle,
                },
                {
                  href: "/resume-interview",
                  label: "Resume Interview",
                  icon: FileText,
                },
                ...(isAdmin
                  ? [{ href: "/admin", label: "Admin Panel", icon: ShieldCheck }]
                  : []),
                {
                  href: "/about-us",
                  label: "About Us",
                  icon: Info,
                },
                {
                  href: "/help-center",
                  label: "Help Center",
                  icon: CircleQuestionMark,
                },
                {
                  href: "/settings",
                  label: "Settings",
                  icon: Settings,
                },
              ].map(({ href, label, icon: Icon }) => (
                <motion.div
                  key={href}
                  variants={itemVariants}
                  onClick={() => setOpen(false)}
                >
                  <SidebarItem
                    href={href}
                    label={label}
                    icon={
                      <Icon
                        size={22}
                        className={
                          pathname === href ? "text-foreground" : "text-primary"
                        }
                      />
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingSidebar;
