"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { getAllBeats, TICK_WIDTH } from "@/lib/blockLibrary";
import { BeatDefinition } from "@/lib/types";

interface DraggableBeatBlockProps {
  definition: BeatDefinition;
}

function DraggableBeatBlock({ definition }: DraggableBeatBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `beat-palette-${definition.blockId}`,
    data: {
      type: "beat-palette",
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
      {/* Drum icons */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
        <span className="text-[8px] opacity-70">🥁</span>
      </div>
    </motion.div>
  );
}

export default function BeatPalette() {
  const beats = getAllBeats();

  return (
    <div className="bg-slate-800 rounded-xl p-4 w-fit">
      <h2 className="text-slate-400 text-sm font-medium mb-3">Beat Palette</h2>
      <div className="flex flex-col gap-2">
        {beats.map((beat) => (
          <DraggableBeatBlock key={beat.blockId} definition={beat} />
        ))}
      </div>
    </div>
  );
}
