"use client";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";

type BadgeAwardModalProps = {
  badge: {
    name: string;
    description: string;
    emoji: string;
    xpReward: number;
  } | null;
  onClose: () => void;
};

export default function BadgeAwardModal({
  badge,
  onClose,
}: BadgeAwardModalProps) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!badge || hasRun.current) return;
    hasRun.current = true;

    // Fire confetti burst
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#6366f1", "#8b5cf6", "#facc15", "#f472b6"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#6366f1", "#8b5cf6", "#facc15", "#f472b6"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [badge, onClose]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[200] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-foreground border-2 border-accent rounded-[22px] p-8 max-w-sm w-full flex flex-col items-center gap-4 relative"
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-tertiary hover:text-secondary"
            >
              <X size={18} />
            </button>

            <p className="text-xs text-accent font-semibold uppercase tracking-widest">
              Badge Unlocked!
            </p>

            {/* Badge emoji with pulse ring */}
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute w-24 h-24 rounded-full bg-accent/20"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute w-20 h-20 rounded-full bg-accent/10"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="text-6xl relative z-10"
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {badge.emoji}
              </motion.span>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">{badge.name}</h2>
              <p className="text-secondary text-sm mt-1">{badge.description}</p>
            </div>

            {badge.xpReward > 0 && (
              <motion.div
                className="flex items-center gap-2 bg-warning/10 text-warning px-4 py-2 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <span className="text-lg">✨</span>
                <span className="font-bold">+{badge.xpReward} XP</span>
              </motion.div>
            )}

            <Button className="w-full mt-2" onClick={onClose}>
              Awesome! 🎉
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
