"use client";

import { useMemo } from "react";
import { getAllBlocks } from "@/lib/blockLibrary";
import { useCustomBlockStore } from "@/lib/stores/useCustomBlockStore";
import { useWorkspaceStore } from "@/lib/stores/useWorkspaceStore";
import { BlockDefinition, CustomBlock } from "@/lib/types";
import { renderPixelArtToDataURL } from "@/lib/pixelArt";
import { TICK_WIDTH } from "@/lib/blockLibrary";

interface BlockLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditBlock?: (block: CustomBlock) => void;
}

export default function BlockLibraryModal({
  isOpen,
  onClose,
  onEditBlock,
}: BlockLibraryModalProps) {
  const customBlocks = useCustomBlockStore((state) => state.customBlocks);
  const deleteCustomBlock = useCustomBlockStore((state) => state.deleteCustomBlock);
  const { activeBlockIds, addToWorkspace, removeFromWorkspace, isInWorkspace } = useWorkspaceStore();

  // Combine preset and custom blocks
  const allBlocks = useMemo(() => {
    const preset = getAllBlocks();
    return [...preset, ...customBlocks];
  }, [customBlocks]);

  const handleDelete = (blockId: string) => {
    if (confirm("Permanently delete this custom block? This cannot be undone.")) {
      deleteCustomBlock(blockId);
      removeFromWorkspace(blockId); // Also remove from workspace
    }
  };

  const handleEdit = (block: CustomBlock) => {
    onEditBlock?.(block);
    onClose();
  };

  const isCustomBlock = (block: BlockDefinition | CustomBlock): block is CustomBlock => {
    return 'pixelArt' in block;
  };

  const getPixelArtURL = (block: BlockDefinition | CustomBlock) => {
    if (isCustomBlock(block) && block.pixelArt) {
      const pixels = typeof block.pixelArt.pixels === 'string'
        ? JSON.parse(block.pixelArt.pixels)
        : block.pixelArt.pixels;
      return renderPixelArtToDataURL(pixels, block.pixelArt.size);
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Block Library</h2>
            <p className="text-sm text-blue-100 mt-1">
              Manage which blocks appear in your workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4">
            {allBlocks.map((block) => {
              const inWorkspace = isInWorkspace(block.blockId);
              const pixelArtURL = getPixelArtURL(block);
              const isCustom = isCustomBlock(block);

              return (
                <div
                  key={block.blockId}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all"
                >
                  {/* Block Preview */}
                  <div
                    className="flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-semibold"
                    style={{
                      width: `${block.ticks * TICK_WIDTH}px`,
                      height: "56px",
                      backgroundColor: block.color,
                      backgroundImage: pixelArtURL ? `url(${pixelArtURL})` : undefined,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      imageRendering: 'pixelated',
                    }}
                  >
                    {!(isCustom && block.hideLabel) && (
                      <span
                        className="px-2 truncate"
                        style={{
                          textShadow: pixelArtURL ? '0 1px 3px rgba(0,0,0,0.5)' : undefined,
                        }}
                      >
                        {block.name}
                      </span>
                    )}
                  </div>

                  {/* Block Info */}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{block.name}</div>
                    <div className="text-sm text-gray-600">
                      {block.ticks} ticks • {isCustom ? "Custom" : "Preset"}
                      {isCustom && block.hideLabel && " • Hidden Label"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isCustom && (
                      <>
                        <button
                          onClick={() => handleEdit(block)}
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm font-medium transition"
                          title="Edit Block"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(block.blockId)}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition"
                          title="Delete Block"
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}

                    {inWorkspace ? (
                      <button
                        onClick={() => removeFromWorkspace(block.blockId)}
                        className="px-4 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md text-sm font-semibold transition"
                      >
                        ➖ Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => addToWorkspace(block.blockId)}
                        className="px-4 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm font-semibold transition"
                      >
                        ➕ Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {allBlocks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No blocks available. Create your first custom block!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <div className="text-sm text-gray-600">
            <strong>{activeBlockIds.length}</strong> blocks in workspace •
            <strong className="ml-2">{allBlocks.length}</strong> total blocks
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
