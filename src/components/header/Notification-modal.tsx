"use client";

import { PackageOpen, X } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationModalProps {
  onFinish: () => void;
}

export default function NotificationModal({
  onFinish,
}: NotificationModalProps) {
  const [notifications, setNotifications] = useState(false);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        onClick={onFinish}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-28 md:top-23 right-5 md:right-30 bg-foreground border border-border w-xs md:w-md h-[40vh] rounded-[22px] p-5 shadow-lg"
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 22,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3>Notifications</h3>
            <button onClick={onFinish}>
              <X
                size={20}
                className="text-tertiary hover:text-secondary cursor-pointer absolute top-4 right-4"
              />
            </button>
          </div>

          <hr className="mt-3" />

          {/* Empty state */}
          {notifications ? (
            <div></div>
          ) : (
            <div className="flex items-center justify-center h-full text-secondary">
              <PackageOpen className="mr-3" />
              <p className="sub-text">No notifications at the moment</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
