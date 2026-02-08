"use client";
import { Bell, LogOut, Moon, Sun, User, Users } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Title from "./Title";
import * as Tooltip from "@radix-ui/react-tooltip";
import { TooltipContent } from "../ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import FloatingSidebar from "../sidebar/floatingSidebar";
import { motion, AnimatePresence } from "framer-motion";
import NotificationModal from "./Notification-modal";
import Image from "next/image";
import { Button } from "../ui/button";

const Header = () => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isSm, setIsSm] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [logout, setLogout] = useState(false);

  const avatar = session?.user?.avatar;

  useEffect(() => {
    const handleResize = () => setIsSm(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <TooltipPrimitive.Provider delayDuration={800}>
      <div className="flex flex-col border-b border-border md:border-none pb-5 md:pb-0">
        <div className="flex flex-row md:border-b border-border px-5 md:px-0 md:pb-5 w-full items-center justify-between">
          {isSm ? <FloatingSidebar /> : <Title />}
          <div className="flex flex-row items-center gap-5">
            <div>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <motion.button
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="ring-2 ring-accent rounded-full p-1 cursor-pointer"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <AnimatePresence mode="wait">
                      {theme === "dark" ? (
                        <motion.span
                          key="sun"
                          initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                          animate={{ rotate: 0, opacity: 1, scale: 1 }}
                          exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 18,
                          }}
                          className="block"
                        >
                          <Sun className="text-accent w-6" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="moon"
                          initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                          animate={{ rotate: 0, opacity: 1, scale: 1 }}
                          exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 18,
                          }}
                          className="block"
                        >
                          <Moon className="text-accent w-6" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </Tooltip.Trigger>

                <TooltipContent
                  side="bottom"
                  align="center"
                  className="rounded-[12px] border border-border"
                >
                  <p className="text-sm text-secondary">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </p>
                </TooltipContent>
              </Tooltip.Root>
            </div>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <motion.button
                  onClick={() => setNotificationModal(true)}
                  className="ring-2 ring-accent rounded-full p-1 cursor-pointer"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Bell className="text-accent  w-6" />
                </motion.button>
              </Tooltip.Trigger>
              <TooltipContent
                side="bottom"
                align="center"
                className="rounded-[12px] border border-border"
              >
                <p className="text-sm text-secondary">Notifications</p>
              </TooltipContent>
            </Tooltip.Root>

            <motion.button
              onClick={() => setProfileModal(true)}
              className="ring-2 ring-accent rounded-full p-1 cursor-pointer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Image
                src={avatar || "/profile-setup/default.png"}
                width={80}
                height={80}
                alt="AVATAR"
                className="rounded-full "
              />
            </motion.button>
          </div>
        </div>
        {isSm ? <Title /> : ""}
      </div>
      {notificationModal && (
        <NotificationModal onFinish={() => setNotificationModal(false)} />
      )}
      {profileModal && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setProfileModal(false)}
        >
          <div className="absolute top-28 md:top-30 right-2 md:right-5 bg-foreground border border-border  rounded-[22px] shadow-lg ">
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-5 w-full cursor-pointer text-secondary hover:bg-accent hover:text-foreground px-5 py-3 rounded-[12px]"
            >
              <User size={20} />
              <p className="text-sm">Profile</p>
            </button>
            <button
              onClick={() => router.push("/add-friends")}
              className="flex items-center gap-5 w-full cursor-pointer text-secondary hover:bg-accent hover:text-foreground px-5 py-3 rounded-[12px]"
            >
              <Users size={20} />
              <p className="text-sm">Friends</p>
            </button>
            <button
              onClick={() => setLogout(true)}
              className="flex items-center gap-5 w-full cursor-pointer text-secondary hover:bg-accent hover:text-foreground px-5 py-3 rounded-[12px]"
            >
              <LogOut size={20} />
              <p className="text-sm">Logout</p>
            </button>
          </div>
        </div>
      )}
      {logout && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-100">
          <div className="bg-foreground border border-border  rounded-[22px] shadow-lg px-10 py-5">
            <div className="flex flex-col items-center justify-center">
              <h3 className="mb-3">Log out?</h3>
              <p className="sub-text mb-5 max-w-xs text-center">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex items-center justify-between w-full px-10">
                <Button
                  variant={"outline"}
                  className="cursor-pointer px-6"
                  onClick={() => setLogout(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant={"default"}
                  className="bg-error hover:bg-error/90 px-6"
                  onClick={() => signOut()}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TooltipPrimitive.Provider>
  );
};

export default Header;
