"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import MusicBlock from "@/components/Blocks/MusicBlock";
import Playhead from "./Playhead";
import { useSequenceStore } from "@/lib/stores/useSequenceStore";
import { useCustomBlockStore } from "@/lib/stores/useCustomBlockStore";
import { getBlockDefinition, TICK_WIDTH } from "@/lib/blockLibrary";
import { getBlockStartTick, getTotalTicks } from "@/lib/audio/audioEngine";

export default function Timeline() {
  const { sequence, currentTick, isPlaying, removeBlock } = useSequenceStore();
  const customBlocks = useCustomBlockStore((state) => state.customBlocks);

  const { setNodeRef, isOver } = useDroppable({
    id: "timeline",
  });

  const totalTicks = getTotalTicks(sequence, "melody", customBlocks);
  const minWidth = Math.max(totalTicks * TICK_WIDTH, 400);

  return (
    <div className="flex-1">
      <h2 className="text-slate-400 text-sm font-medium mb-3">Timeline</h2>
      <div
        ref={setNodeRef}
        className={`
          timeline-dropzone p-4 overflow-x-auto
          ${isOver ? "drag-over" : ""}
        `}
        style={{ minWidth: "100%" }}
      >
        <div className="relative" style={{ minWidth: `${minWidth}px`, minHeight: "80px" }}>
          {/* Tick grid background */}
          <div
            className="absolute inset-0 tick-grid opacity-50"
            style={{ width: `${minWidth}px` }}
          />

          {/* Blocks */}
          <SortableContext
            items={sequence.map((b) => b.instanceId)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="relative flex items-center gap-1 min-h-[64px]">
              <AnimatePresence>
                {sequence.map((seqBlock) => {
                  // Check custom blocks first, then preset blocks
                  const customBlock = customBlocks.find((b) => b.blockId === seqBlock.blockId);
                  const definition = customBlock || getBlockDefinition(seqBlock.blockId);
                  if (!definition) return null;

                  const blockStartTick = getBlockStartTick(sequence, seqBlock.instanceId, "melody", customBlocks);
                  const blockEndTick = blockStartTick + definition.ticks;
                  const isActive =
                    isPlaying &&
                    currentTick >= blockStartTick &&
                    currentTick < blockEndTick;

                  return (
                    <MusicBlock
                      key={seqBlock.instanceId}
                      instanceId={seqBlock.instanceId}
                      definition={definition}
                      isActive={isActive}
                      onRemove={() => removeBlock(seqBlock.instanceId)}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </SortableContext>

          {/* Playhead */}
          {sequence.length > 0 && (
            <Playhead currentTick={currentTick} isPlaying={isPlaying} />
          )}

          {/* Empty state */}
          {sequence.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              Drag blocks here to build your sequence
            </div>
          )}
        </div>
      </div>

      {/* Tick labels */}
      {totalTicks > 0 && (
        <div className="flex mt-2 text-xs text-slate-500" style={{ width: `${totalTicks * TICK_WIDTH}px` }}>
          {Array.from({ length: totalTicks + 1 }).map((_, i) => (
            <div
              key={i}
              className="text-center"
              style={{ width: i === totalTicks ? "auto" : `${TICK_WIDTH}px` }}
            >
              {i}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
