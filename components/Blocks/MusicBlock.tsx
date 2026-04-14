"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { BlockDefinition, CustomBlock } from "@/lib/types";
import { TICK_WIDTH } from "@/lib/blockLibrary";
import { renderPixelArtToDataURL } from "@/lib/pixelArt";
import { useMemo } from "react";

interface MusicBlockProps {
  definition: BlockDefinition | CustomBlock;
  instanceId: string;
  isActive?: boolean;
  onRemove?: () => void;
}

export default function MusicBlock({
  definition,
  instanceId,
  isActive = false,
  onRemove,
}: MusicBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: instanceId,
  });

  // Check if this is a custom block with pixel art
  const isCustomBlock = (def: BlockDefinition | CustomBlock): def is CustomBlock => {
    return 'pixelArt' in def;
  };

  // Generate pixel art DataURL (memoized for performance)
  const pixelArtDataURL = useMemo(() => {
    if (isCustomBlock(definition) && definition.pixelArt) {
      const pixels = typeof definition.pixelArt.pixels === 'string'
        ? JSON.parse(definition.pixelArt.pixels)
        : definition.pixelArt.pixels;
      return renderPixelArtToDataURL(pixels, definition.pixelArt.size);
    }
    return null;
  }, [definition]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${definition.ticks * TICK_WIDTH}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <motion.div
        style={{
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
          group relative h-16 rounded-lg cursor-grab active:cursor-grabbing
          flex items-center justify-center
          text-slate-900 font-semibold text-sm
          select-none
          transition-shadow duration-200
          ${isDragging ? "opacity-50 z-50" : ""}
          ${isActive ? "block-active" : ""}
        `}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
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

        {/* Tick markers */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-1">
          {Array.from({ length: definition.ticks }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-slate-900/30"
            />
          ))}
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white
              flex items-center justify-center text-xs font-bold
              opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity"
          >
            ×
          </button>
        )}
      </motion.div>
    </div>
  );
}
