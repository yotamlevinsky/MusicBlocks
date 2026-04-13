"use client";

import { motion } from "framer-motion";
import { TICK_WIDTH } from "@/lib/blockLibrary";

interface PlayheadProps {
  currentTick: number;
  isPlaying: boolean;
}

export default function Playhead({ currentTick, isPlaying }: PlayheadProps) {
  const position = currentTick * TICK_WIDTH;

  return (
    <motion.div
      className={`absolute top-0 bottom-0 w-0.5 bg-white z-10 ${isPlaying ? "playhead" : ""}`}
      initial={{ left: 0 }}
      animate={{ left: position }}
      transition={{ type: "tween", duration: 0.05, ease: "linear" }}
    >
      {/* Playhead triangle */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "8px solid white",
        }}
      />
    </motion.div>
  );
}
