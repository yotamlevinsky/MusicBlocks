"use client";

import { useState, useEffect } from "react";
import { CustomBlock, NoteEvent, PixelArtData } from "@/lib/types";
import { createEmptyPixelGrid } from "@/lib/pixelArt";
import MelodyEditor from "./PatternEditor/MelodyEditor";
import PixelCanvas from "./PixelArtEditor/PixelCanvas";
import { useCustomBlockStore } from "@/lib/stores/useCustomBlockStore";
import { useWorkspaceStore } from "@/lib/stores/useWorkspaceStore";
import { v4 as uuidv4 } from "uuid";

interface BlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBlock?: CustomBlock; // Optional: for editing existing blocks
}

export default function BlockEditorModal({
  isOpen,
  onClose,
  editingBlock,
}: BlockEditorModalProps) {
  const { addCustomBlock, updateCustomBlock } = useCustomBlockStore();
  const { addToWorkspace } = useWorkspaceStore();

  // Form state
  const [name, setName] = useState(editingBlock?.name || "");
  const [color, setColor] = useState(editingBlock?.color || "#FF6B6B");
  const [ticks, setTicks] = useState(editingBlock?.ticks || 4);
  const [pattern, setPattern] = useState<NoteEvent[]>(editingBlock?.pattern || []);
  const [hideLabel, setHideLabel] = useState((editingBlock as any)?.hideLabel || false);
  const [pixelArt, setPixelArt] = useState<string[][]>(
    editingBlock?.pixelArt
      ? typeof editingBlock.pixelArt.pixels === "string"
        ? JSON.parse(editingBlock.pixelArt.pixels)
        : editingBlock.pixelArt.pixels
      : createEmptyPixelGrid(8)
  );

  // Load editing block data when modal opens
  useEffect(() => {
    if (editingBlock) {
      setName(editingBlock.name);
      setColor(editingBlock.color);
      setTicks(editingBlock.ticks);
      setPattern(editingBlock.pattern);
      setHideLabel(editingBlock.hideLabel || false);

      const pixels = editingBlock.pixelArt
        ? typeof editingBlock.pixelArt.pixels === "string"
          ? JSON.parse(editingBlock.pixelArt.pixels)
          : editingBlock.pixelArt.pixels
        : createEmptyPixelGrid(8);
      setPixelArt(pixels);
    } else {
      resetForm();
    }
  }, [editingBlock]);

  // Auto-calculate block duration based on pattern
  useEffect(() => {
    // Don't auto-calculate if we're editing an existing block on first load
    if (editingBlock && pattern === editingBlock.pattern) {
      return;
    }

    if (pattern.length === 0) {
      setTicks(2); // Minimum 2 ticks for empty pattern
      return;
    }

    // Find the furthest point in the pattern (time + duration)
    const maxEndTime = Math.max(
      ...pattern.map((note) => note.time + note.duration)
    );

    // Round up to nearest tick, with min 2 and max 16 (4 measures)
    const calculatedTicks = Math.min(16, Math.max(2, Math.ceil(maxEndTime)));
    setTicks(calculatedTicks);
  }, [pattern]);

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a block name");
      return;
    }

    if (pattern.length === 0) {
      alert("Please add at least one note to the pattern");
      return;
    }

    const pixelArtData: PixelArtData = {
      size: 8,
      pixels: pixelArt,
    };

    const block: CustomBlock = {
      blockId: editingBlock?.blockId || `custom_${uuidv4()}`,
      name: name.trim(),
      category: "melody",
      ticks,
      color,
      pattern,
      pixelArt: pixelArtData,
      hideLabel,
    };

    if (editingBlock) {
      updateCustomBlock(block);
    } else {
      addCustomBlock(block);
      // Automatically add new custom blocks to workspace
      addToWorkspace(block.blockId);
    }

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setColor("#FF6B6B");
    setTicks(2);
    setPattern([]);
    setHideLabel(false);
    setPixelArt(createEmptyPixelGrid(8));
  };

  const handleClose = () => {
    if (confirm("Close without saving?")) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {editingBlock ? "Edit Custom Block" : "Create Custom Block"}
          </h2>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel: Metadata */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Block Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Happy Melody"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-gray-900 placeholder-gray-400"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Block Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 font-mono text-gray-900 placeholder-gray-400"
                    placeholder="#FF6B6B"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (Auto-calculated)
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{ticks} ticks</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Automatically calculated from your melody pattern
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hideLabel"
                  checked={hideLabel}
                  onChange={(e) => setHideLabel(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="hideLabel" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Hide text label (show only pixel art)
                </label>
              </div>

              {/* Pixel Art Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pixel Art Icon
                </label>
                <PixelCanvas pixels={pixelArt} onChange={setPixelArt} />
              </div>
            </div>

            {/* Right Panel: Pattern Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Melody Pattern
              </label>
              <MelodyEditor
                ticks={ticks}
                pattern={pattern}
                onChange={setPattern}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            {editingBlock ? "Update Block" : "Create Block"}
          </button>
        </div>
      </div>
    </div>
  );
}
