"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { getAllHarmonies, TICK_WIDTH } from "@/lib/blockLibrary";
import { HarmonyDefinition } from "@/lib/types";

interface DraggableHarmonyBlockProps {
  definition: HarmonyDefinition;
}

function DraggableHarmonyBlock({ definition }: DraggableHarmonyBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `harmony-palette-${definition.blockId}`,
    data: {
      type: "harmony-palette",
      blockId: definition.blockId,
    },
  });

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        width: `${definition.ticks * TICK_WIDTH}px`,
        backgroundColor: definition.color,
      }}
      className={`
        relative h-12 rounded-lg cursor-grab active:cursor-grabbing
        flex items-center justify-center
        text-white font-semibold text-xs
        select-none touch-none
        ${isDragging ? "opacity-50" : ""}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="truncate px-2">{definition.name}</span>
    </motion.div>
  );
}

export default function HarmonyPalette() {
  const harmonies = getAllHarmonies();

  return (
    <div className="bg-slate-800 rounded-xl p-4 w-fit">
      <h2 className="text-slate-400 text-sm font-medium mb-3">Harmony Palette</h2>
      <div className="flex flex-col gap-2">
        {harmonies.map((harmony) => (
          <DraggableHarmonyBlock key={harmony.blockId} definition={harmony} />
        ))}
      </div>
    </div>
  );
}
