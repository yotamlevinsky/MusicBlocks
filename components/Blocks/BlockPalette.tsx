"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { getAllBlocks, TICK_WIDTH } from "@/lib/blockLibrary";
import { BlockDefinition, CustomBlock } from "@/lib/types";
import { useCustomBlockStore } from "@/lib/stores/useCustomBlockStore";
import { useWorkspaceStore } from "@/lib/stores/useWorkspaceStore";
import { useAppModeStore } from "@/lib/stores/useAppModeStore";
import { renderPixelArtToDataURL } from "@/lib/pixelArt";
import { useMemo } from "react";

interface DraggablePaletteBlockProps {
  definition: BlockDefinition | CustomBlock;
}

function DraggablePaletteBlock({ definition }: DraggablePaletteBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.blockId}`,
    data: {
      type: "palette",
      blockId: definition.blockId,
    },
  });

  // Check if this is a custom block with pixel art
  const isCustomBlock = (def: BlockDefinition | CustomBlock): def is CustomBlock => {
    return 'pixelArt' in def;
  };

  // Generate pixel art DataURL (memoized)
  const pixelArtDataURL = useMemo(() => {
    if (isCustomBlock(definition) && definition.pixelArt) {
      const pixels = typeof definition.pixelArt.pixels === 'string'
        ? JSON.parse(definition.pixelArt.pixels)
        : definition.pixelArt.pixels;
      return renderPixelArtToDataURL(pixels, definition.pixelArt.size);
    }
    return null;
  }, [definition]);

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        width: `${definition.ticks * TICK_WIDTH}px`,
        backgroundColor: definition.color,
        ...(pixelArtDataURL && {
          backgroundImage: `url(${pixelArtDataURL})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }),
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
      {!(isCustomBlock(definition) && definition.hideLabel) && (
        <span
          className="truncate px-2"
          style={{
            textShadow: pixelArtDataURL ? '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)' : undefined,
          }}
        >
          {definition.name}
        </span>
      )}
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
  const customBlocks = useCustomBlockStore((state) => state.customBlocks);
  const { activeBlockIds, isInWorkspace } = useWorkspaceStore();

  // Combine preset blocks and custom blocks
  const allBlocks = [...blocks, ...customBlocks];

  // Filter to only show blocks in workspace
  const workspaceBlocks = allBlocks.filter((block) => isInWorkspace(block.blockId));

  return (
    <div className="bg-slate-800 rounded-xl p-4 w-fit">
      <h2 className="text-slate-400 text-sm font-medium mb-3">Block Palette</h2>
      <div className="flex flex-col gap-3">
        {workspaceBlocks.map((block) => (
          <DraggablePaletteBlock key={block.blockId} definition={block} />
        ))}
      </div>
      {workspaceBlocks.length === 0 && (
        <div className="text-xs text-slate-500 py-4 text-center">
          No blocks in workspace.<br />
          Use "Manage Library" to add blocks.
        </div>
      )}
      {customBlocks.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-500">
          {customBlocks.filter(b => isInWorkspace(b.blockId)).length} custom block{customBlocks.filter(b => isInWorkspace(b.blockId)).length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
