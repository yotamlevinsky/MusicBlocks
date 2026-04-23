"use client";

import { useCallback, useState, useId, useMemo, useEffect } from "react";
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
import BlockEditorModal from "./BlockEditor/BlockEditorModal";
import BlockLibraryModal from "./BlockEditor/BlockLibraryModal";
import { useSequenceStore } from "@/lib/stores/useSequenceStore";
import { useCustomBlockStore } from "@/lib/stores/useCustomBlockStore";
import { useAppModeStore } from "@/lib/stores/useAppModeStore";
import { useWorkspaceStore } from "@/lib/stores/useWorkspaceStore";
import { getBlockDefinition, getBeatDefinition, getHarmonyDefinition, TICK_WIDTH } from "@/lib/blockLibrary";
import { renderPixelArtToDataURL } from "@/lib/pixelArt";
import { motion } from "framer-motion";
import { BlockDefinition, CustomBlock } from "@/lib/types";

export default function Playground() {
  const {
    addBlock, reorderBlocks,
    addBeatBlock, reorderBeatBlocks,
    addHarmonyBlock, reorderHarmonyBlocks
  } = useSequenceStore();

  const customBlocks = useCustomBlockStore((state) => state.customBlocks);
  const { mode, toggleMode } = useAppModeStore();
  const { initializeWorkspace } = useWorkspaceStore();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<"melody" | "beat" | "harmony" | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<CustomBlock | undefined>(undefined);

  // Collapsible sections state
  const [isMelodyCollapsed, setIsMelodyCollapsed] = useState(false);
  const [isHarmonyCollapsed, setIsHarmonyCollapsed] = useState(false);
  const [isBeatCollapsed, setIsBeatCollapsed] = useState(false);

  // Track if component is mounted (to prevent hydration errors)
  const [isMounted, setIsMounted] = useState(false);

  const dndContextId = useId();

  // Initialize workspace on mount
  useEffect(() => {
    initializeWorkspace();
    setIsMounted(true);
  }, [initializeWorkspace]);

  const handleEditBlock = (block: CustomBlock) => {
    setEditingBlock(block);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingBlock(undefined);
  };

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

    // Check custom blocks first, then preset blocks
    const customBlock = customBlocks.find((b) => b.blockId === activeBlockId);
    return customBlock || getBlockDefinition(activeBlockId);
  };

  const draggedDefinition = getDraggedDefinition();

  // Generate pixel art for drag overlay if needed
  const dragOverlayPixelArt = useMemo(() => {
    const def = draggedDefinition as CustomBlock | BlockDefinition | null;
    if (def && 'pixelArt' in def && def.pixelArt) {
      const pixels = typeof def.pixelArt.pixels === 'string'
        ? JSON.parse(def.pixelArt.pixels)
        : def.pixelArt.pixels;
      return renderPixelArtToDataURL(pixels, def.pixelArt.size);
    }
    return null;
  }, [draggedDefinition]);

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
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
              <span className="text-xs text-slate-400 font-medium">Mode:</span>
              <button
                onClick={toggleMode}
                className={`
                  px-4 py-1.5 rounded-md text-sm font-semibold transition-all
                  ${mode === "edit"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"}
                `}
              >
                {mode === "edit" ? "✏️ Edit" : "👤 Usage"}
              </button>
            </div>
            <ScanButton />
            <TransportControls />
          </div>
        </header>

        {/* Melody Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMelodyCollapsed(!isMelodyCollapsed)}
                className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-lg transition-all"
                title={isMelodyCollapsed ? "Expand Melody" : "Collapse Melody"}
                suppressHydrationWarning
              >
                {isMounted ? (isMelodyCollapsed ? "+" : "−") : "−"}
              </button>
              <h2 className="text-lg font-semibold text-slate-300">🎵 Melody</h2>
            </div>
            {mode === "edit" && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  📚 Manage Library
                </button>
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all hover:scale-105"
                >
                  + Create Custom Block
                </button>
              </div>
            )}
          </div>
          {!isMelodyCollapsed && (
            <div className="flex gap-4">
              <BlockPalette />
              <Timeline />
            </div>
          )}
        </div>

        {/* Harmony Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setIsHarmonyCollapsed(!isHarmonyCollapsed)}
              className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-lg transition-all"
              title={isHarmonyCollapsed ? "Expand Harmony" : "Collapse Harmony"}
              suppressHydrationWarning
            >
              {isMounted ? (isHarmonyCollapsed ? "+" : "−") : "−"}
            </button>
            <h2 className="text-lg font-semibold text-slate-300">🎹 Harmony</h2>
          </div>
          {!isHarmonyCollapsed && (
            <div className="flex gap-4">
              <HarmonyPalette />
              <HarmonyTimeline />
            </div>
          )}
        </div>

        {/* Beat Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setIsBeatCollapsed(!isBeatCollapsed)}
              className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-lg transition-all"
              title={isBeatCollapsed ? "Expand Beats" : "Collapse Beats"}
              suppressHydrationWarning
            >
              {isMounted ? (isBeatCollapsed ? "+" : "−") : "−"}
            </button>
            <h2 className="text-lg font-semibold text-slate-300">🥁 Beats</h2>
          </div>
          {!isBeatCollapsed && (
            <div className="flex gap-4">
              <BeatPalette />
              <BeatTimeline />
            </div>
          )}
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
              ...(dragOverlayPixelArt && {
                backgroundImage: `url(${dragOverlayPixelArt})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
              }),
            }}
            className={`rounded-lg flex items-center justify-center
              font-semibold shadow-2xl opacity-90
              ${dragType === "melody" ? "h-14 text-slate-900 text-sm" : "h-12 text-white text-xs"}`}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.05 }}
          >
            {!((draggedDefinition as CustomBlock).hideLabel) && (
              <span
                style={{
                  textShadow: dragOverlayPixelArt ? '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)' : undefined,
                }}
              >
                {draggedDefinition.name}
              </span>
            )}
          </motion.div>
        )}
      </DragOverlay>

      {/* Block Editor Modal */}
      <BlockEditorModal
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        editingBlock={editingBlock}
      />

      {/* Block Library Modal */}
      <BlockLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onEditBlock={handleEditBlock}
      />
    </DndContext>
  );
}
