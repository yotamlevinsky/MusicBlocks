import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CustomBlock } from "../types";

interface CustomBlockStore {
  customBlocks: CustomBlock[];
  addCustomBlock: (block: CustomBlock) => void;
  deleteCustomBlock: (blockId: string) => void;
  updateCustomBlock: (block: CustomBlock) => void;
}

export const useCustomBlockStore = create<CustomBlockStore>()(
  persist(
    (set) => ({
      customBlocks: [],

      addCustomBlock: (block: CustomBlock) => {
        set((state) => ({
          customBlocks: [...state.customBlocks, block],
        }));
      },

      deleteCustomBlock: (blockId: string) => {
        set((state) => ({
          customBlocks: state.customBlocks.filter((block) => block.blockId !== blockId),
        }));
      },

      updateCustomBlock: (block: CustomBlock) => {
        set((state) => ({
          customBlocks: state.customBlocks.map((b) =>
            b.blockId === block.blockId ? block : b
          ),
        }));
      },
    }),
    {
      name: "custom-blocks-storage", // localStorage key
    }
  )
);

// Selector helpers
export const selectCustomBlocks = (state: CustomBlockStore) => state.customBlocks;
export const selectCustomBlockById = (blockId: string) => (state: CustomBlockStore) =>
  state.customBlocks.find((block) => block.blockId === blockId);
