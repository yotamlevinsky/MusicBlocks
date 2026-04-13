"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import BeatBlock from "@/components/Blocks/BeatBlock";
import { useSequenceStore } from "@/lib/stores/useSequenceStore";
import { getBeatDefinition, TICK_WIDTH } from "@/lib/blockLibrary";
import { getTotalTicks, getBlockStartTick } from "@/lib/audio/audioEngine";

export default function BeatTimeline() {
  const { beatSequence, currentTick, isPlaying, removeBeatBlock } = useSequenceStore();

  const { setNodeRef, isOver } = useDroppable({
    id: "beat-timeline",
  });

  const totalTicks = getTotalTicks(beatSequence, "beat");
  const minWidth = Math.max(totalTicks * TICK_WIDTH, 400);

  return (
    <div className="flex-1">
      <h2 className="text-slate-400 text-sm font-medium mb-3">Beat Timeline</h2>
      <div
        ref={setNodeRef}
        className={`
          timeline-dropzone p-4 overflow-x-auto
          ${isOver ? "drag-over" : ""}
        `}
        style={{ minWidth: "100%" }}
      >
        <div className="relative" style={{ minWidth: `${minWidth}px`, minHeight: "60px" }}>
          {/* Tick grid background */}
          <div
            className="absolute inset-0 tick-grid opacity-50"
            style={{ width: `${minWidth}px` }}
          />

          {/* Blocks */}
          <SortableContext
            items={beatSequence.map((b) => b.instanceId)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="relative flex items-center gap-1 min-h-[48px]">
              <AnimatePresence>
                {beatSequence.map((seqBlock) => {
                  const definition = getBeatDefinition(seqBlock.blockId);
                  if (!definition) return null;

                  const blockStartTick = getBlockStartTick(beatSequence, seqBlock.instanceId, "beat");
                  const blockEndTick = blockStartTick + definition.ticks;
                  const isActive =
                    isPlaying &&
                    currentTick >= blockStartTick &&
                    currentTick < blockEndTick;

                  return (
                    <BeatBlock
                      key={seqBlock.instanceId}
                      instanceId={seqBlock.instanceId}
                      definition={definition}
                      isActive={isActive}
                      onRemove={() => removeBeatBlock(seqBlock.instanceId)}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </SortableContext>

          {/* Empty state */}
          {beatSequence.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
              Drag beat blocks here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
