"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { getAllBlocks, TICK_WIDTH } from "@/lib/blockLibrary";
import { BlockDefinition } from "@/lib/types";

interface DraggablePaletteBlockProps {
  definition: BlockDefinition;
}

function DraggablePaletteBlock({ definition }: DraggablePaletteBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.blockId}`,
    data: {
      type: "palette",
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
        relative h-14 rounded-lg cursor-grab active:cursor-grabbing
        flex items-center justify-center
        text-slate-900 font-semibold text-sm
        select-none touch-none
        ${isDragging ? "opacity-50" : ""}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="truncate px-2">{definition.name}</span>
      <div className="absolute bottom-1 left-0 right-0 flex justify-between px-1">
        {Array.from({ length: definition.ticks }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-slate-900/30"
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function BlockPalette() {
  const blocks = getAllBlocks();

  return (
    <div className="bg-slate-800 rounded-xl p-4 w-fit">
      <h2 className="text-slate-400 text-sm font-medium mb-3">Block Palette</h2>
      <div className="flex flex-col gap-3">
        {blocks.map((block) => (
          <DraggablePaletteBlock key={block.blockId} definition={block} />
        ))}
      </div>
    </div>
  );
}
