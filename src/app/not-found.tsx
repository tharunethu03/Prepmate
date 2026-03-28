"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Search } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      {/* Background blobs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 pointer-events-none"
        style={{ background: "var(--accent)" }}
      />

      {/* Floating grid dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Image
            src="/logo.png"
            alt="Prepmate"
            width={140}
            height={40}
            className="object-contain"
          />
        </motion.div>

        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-4"
        >
          <span
            className="text-[10rem] font-black leading-none select-none"
            style={{
              background: "var(--accent-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>

          {/* Floating badge on the 4 */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute -top-3 -right-4 text-2xl"
          >
            🔍
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl font-bold mb-3"
          style={{ color: "var(--primary)" }}
        >
          Oops — this page went off-script
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-base mb-10 leading-relaxed"
          style={{ color: "var(--secondary)" }}
        >
          The page you&apos;re looking for doesn&apos;t exist or was moved.
          <br />
          Let&apos;s get you back to practising.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "var(--accent-gradient)" }}
          >
            <Home size={18} />
            Go to Dashboard
          </button>

          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "var(--foreground)",
              color: "var(--primary)",
              border: "1px solid var(--border)",
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm"
          style={{ color: "var(--tertiary)" }}
        >
          {[
            { label: "Create Interview", href: "/create-interviews" },
            { label: "Leaderboard", href: "/leaderboard" },
            { label: "Settings", href: "/settings" },
          ].map(({ label, href }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex items-center gap-1 transition-colors duration-150 hover:underline"
              style={{ color: "var(--accent)" }}
            >
              <Search size={12} />
              {label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Bottom wave decoration */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 pointer-events-none"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scaleY: [1, 1.8, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
            className="w-1.5 rounded-full"
            style={{
              height: "24px",
              background: "var(--accent)",
              opacity: 0.35,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
