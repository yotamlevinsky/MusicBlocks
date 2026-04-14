import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAllBlocks } from "../blockLibrary";

interface WorkspaceStore {
  activeBlockIds: string[]; // Block IDs currently visible in workspace
  addToWorkspace: (blockId: string) => void;
  removeFromWorkspace: (blockId: string) => void;
  isInWorkspace: (blockId: string) => boolean;
  initializeWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      activeBlockIds: [], // Start empty, will be initialized

      addToWorkspace: (blockId: string) => {
        set((state) => {
          if (state.activeBlockIds.includes(blockId)) {
            return state; // Already in workspace
          }
          return {
            activeBlockIds: [...state.activeBlockIds, blockId],
          };
        });
      },

      removeFromWorkspace: (blockId: string) => {
        set((state) => ({
          activeBlockIds: state.activeBlockIds.filter((id) => id !== blockId),
        }));
      },

      isInWorkspace: (blockId: string) => {
        return get().activeBlockIds.includes(blockId);
      },

      initializeWorkspace: () => {
        const state = get();
        // If workspace is empty, initialize with all preset blocks
        if (state.activeBlockIds.length === 0) {
          const presetBlocks = getAllBlocks();
          set({
            activeBlockIds: presetBlocks.map((block) => block.blockId),
          });
        }
      },
    }),
    {
      name: "workspace-storage",
    }
  )
);

// Selector helpers
export const selectActiveBlockIds = (state: WorkspaceStore) => state.activeBlockIds;
export const selectIsInWorkspace = (blockId: string) => (state: WorkspaceStore) =>
  state.isInWorkspace(blockId);
