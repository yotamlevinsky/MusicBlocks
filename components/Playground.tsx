"use client";

import { useCallback, useState, useId } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import BlockPalette from "./Blocks/BlockPalette";
import BeatPalette from "./Blocks/BeatPalette";
import HarmonyPalette from "./Blocks/HarmonyPalette";
import Timeline from "./Canvas/Timeline";
import BeatTimeline from "./Canvas/BeatTimeline";
import HarmonyTimeline from "./Canvas/HarmonyTimeline";
import TransportControls from "./Controls/TransportControls";
import ScanButton from "./Controls/ScanButton";
import { useSequenceStore } from "@/lib/stores/useSequenceStore";
import { getBlockDefinition, getBeatDefinition, getHarmonyDefinition, TICK_WIDTH } from "@/lib/blockLibrary";
import { motion } from "framer-motion";

export default function Playground() {
  const {
    addBlock, reorderBlocks,
    addBeatBlock, reorderBeatBlocks,
    addHarmonyBlock, reorderHarmonyBlocks
  } = useSequenceStore();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<"melody" | "beat" | "harmony" | null>(null);

  const dndContextId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);

    if (active.data.current?.type === "palette") {
      setActiveBlockId(active.data.current.blockId);
      setDragType("melody");
    } else if (active.data.current?.type === "beat-palette") {
      setActiveBlockId(active.data.current.blockId);
      setDragType("beat");
    } else if (active.data.current?.type === "harmony-palette") {
      setActiveBlockId(active.data.current.blockId);
      setDragType("harmony");
    } else {
      const store = useSequenceStore.getState();
      const melodyBlock = store.sequence.find((b) => b.instanceId === active.id);
      if (melodyBlock) {
        setActiveBlockId(melodyBlock.blockId);
        setDragType("melody");
      } else {
        const beatBlock = store.beatSequence.find((b) => b.instanceId === active.id);
        if (beatBlock) {
          setActiveBlockId(beatBlock.blockId);
          setDragType("beat");
        } else {
          const harmonyBlock = store.harmonySequence.find((b) => b.instanceId === active.id);
          if (harmonyBlock) {
            setActiveBlockId(harmonyBlock.blockId);
            setDragType("harmony");
          }
        }
      }
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const currentDragType = dragType;

      setActiveDragId(null);
      setActiveBlockId(null);
      setDragType(null);

      if (!over) return;

      // Melody palette to melody timeline
      if (active.data.current?.type === "palette") {
        if (over.id === "timeline" || (over.data.current && currentDragType === "melody")) {
          addBlock(active.data.current.blockId);
        }
        return;
      }

      // Beat palette to beat timeline
      if (active.data.current?.type === "beat-palette") {
        if (over.id === "beat-timeline" || (over.data.current && currentDragType === "beat")) {
          addBeatBlock(active.data.current.blockId);
        }
        return;
      }

      // Harmony palette to harmony timeline
      if (active.data.current?.type === "harmony-palette") {
        if (over.id === "harmony-timeline" || (over.data.current && currentDragType === "harmony")) {
          addHarmonyBlock(active.data.current.blockId);
        }
        return;
      }

      // Reordering within timelines
      if (active.id !== over.id) {
        if (currentDragType === "melody" && over.id !== "timeline") {
          reorderBlocks(active.id as string, over.id as string);
        } else if (currentDragType === "beat" && over.id !== "beat-timeline") {
          reorderBeatBlocks(active.id as string, over.id as string);
        } else if (currentDragType === "harmony" && over.id !== "harmony-timeline") {
          reorderHarmonyBlocks(active.id as string, over.id as string);
        }
      }
    },
    [dragType, addBlock, reorderBlocks, addBeatBlock, reorderBeatBlocks, addHarmonyBlock, reorderHarmonyBlocks]
  );

  const getDraggedDefinition = () => {
    if (!activeBlockId) return null;
    if (dragType === "beat") return getBeatDefinition(activeBlockId);
    if (dragType === "harmony") return getHarmonyDefinition(activeBlockId);
    return getBlockDefinition(activeBlockId);
  };

  const draggedDefinition = getDraggedDefinition();

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">MusicBlocks</h1>
          <div className="flex items-center gap-4">
            <ScanButton />
            <TransportControls />
          </div>
        </header>

        {/* Melody Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-300 mb-3">🎵 Melody</h2>
          <div className="flex gap-4">
            <BlockPalette />
            <Timeline />
          </div>
        </div>

        {/* Harmony Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-300 mb-3">🎹 Harmony</h2>
          <div className="flex gap-4">
            <HarmonyPalette />
            <HarmonyTimeline />
          </div>
        </div>

        {/* Beat Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-300 mb-3">🥁 Beats</h2>
          <div className="flex gap-4">
            <BeatPalette />
            <BeatTimeline />
          </div>
        </div>

        {/* Instructions */}
        <footer className="mt-6 text-slate-500 text-sm">
          <p>
            Drag blocks to timelines. Press{" "}
            <kbd className="px-2 py-0.5 bg-slate-700 rounded">Space</kbd> to play/stop.
            Enable Loop to repeat continuously!
          </p>
        </footer>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDragId && draggedDefinition && (
          <motion.div
            style={{
              width: `${draggedDefinition.ticks * TICK_WIDTH}px`,
              backgroundColor: draggedDefinition.color,
            }}
            className={`rounded-lg flex items-center justify-center
              font-semibold shadow-2xl opacity-90
              ${dragType === "melody" ? "h-14 text-slate-900 text-sm" : "h-12 text-white text-xs"}`}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.05 }}
          >
            {draggedDefinition.name}
          </motion.div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
