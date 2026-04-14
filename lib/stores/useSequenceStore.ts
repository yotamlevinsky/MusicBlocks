import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { SequenceBlock, SequenceStore } from "../types";
import { getBlockDefinition, getBeatDefinition, getHarmonyDefinition } from "../blockLibrary";

export const useSequenceStore = create<SequenceStore>((set) => ({
  sequence: [],
  beatSequence: [],
  harmonySequence: [],
  tempo: 120,
  isLooping: false,
  isPlaying: false,
  currentTick: 0,

  // === Melody Sequence Actions ===
  injectExternalSequence: (idArray: string[]) => {
    const validBlocks: SequenceBlock[] = idArray
      .filter((blockId) => getBlockDefinition(blockId) !== undefined)
      .map((blockId) => ({ instanceId: uuidv4(), blockId }));
    set({ sequence: validBlocks, isPlaying: false, currentTick: 0 });
  },

  addBlock: (blockId: string) => {
    // Allow both preset and custom blocks (validation happens in UI layer)
    set((state) => ({
      sequence: [...state.sequence, { instanceId: uuidv4(), blockId }],
    }));
  },

  removeBlock: (instanceId: string) => {
    set((state) => ({
      sequence: state.sequence.filter((block) => block.instanceId !== instanceId),
    }));
  },

  reorderBlocks: (activeId: string, overId: string) => {
    set((state) => {
      const oldIndex = state.sequence.findIndex((b) => b.instanceId === activeId);
      const newIndex = state.sequence.findIndex((b) => b.instanceId === overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const newSequence = [...state.sequence];
      const [removed] = newSequence.splice(oldIndex, 1);
      newSequence.splice(newIndex, 0, removed);
      return { sequence: newSequence };
    });
  },

  clearSequence: () => set({ sequence: [] }),

  // === Beat Sequence Actions ===
  injectExternalBeatSequence: (idArray: string[]) => {
    const validBlocks: SequenceBlock[] = idArray
      .filter((blockId) => getBeatDefinition(blockId) !== undefined)
      .map((blockId) => ({ instanceId: uuidv4(), blockId }));
    set({ beatSequence: validBlocks, isPlaying: false, currentTick: 0 });
  },

  addBeatBlock: (blockId: string) => {
    if (!getBeatDefinition(blockId)) return;
    set((state) => ({
      beatSequence: [...state.beatSequence, { instanceId: uuidv4(), blockId }],
    }));
  },

  removeBeatBlock: (instanceId: string) => {
    set((state) => ({
      beatSequence: state.beatSequence.filter((block) => block.instanceId !== instanceId),
    }));
  },

  reorderBeatBlocks: (activeId: string, overId: string) => {
    set((state) => {
      const oldIndex = state.beatSequence.findIndex((b) => b.instanceId === activeId);
      const newIndex = state.beatSequence.findIndex((b) => b.instanceId === overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const newSequence = [...state.beatSequence];
      const [removed] = newSequence.splice(oldIndex, 1);
      newSequence.splice(newIndex, 0, removed);
      return { beatSequence: newSequence };
    });
  },

  clearBeatSequence: () => set({ beatSequence: [] }),

  // === Harmony Sequence Actions ===
  injectExternalHarmonySequence: (idArray: string[]) => {
    const validBlocks: SequenceBlock[] = idArray
      .filter((blockId) => getHarmonyDefinition(blockId) !== undefined)
      .map((blockId) => ({ instanceId: uuidv4(), blockId }));
    set({ harmonySequence: validBlocks, isPlaying: false, currentTick: 0 });
  },

  addHarmonyBlock: (blockId: string) => {
    if (!getHarmonyDefinition(blockId)) return;
    set((state) => ({
      harmonySequence: [...state.harmonySequence, { instanceId: uuidv4(), blockId }],
    }));
  },

  removeHarmonyBlock: (instanceId: string) => {
    set((state) => ({
      harmonySequence: state.harmonySequence.filter((block) => block.instanceId !== instanceId),
    }));
  },

  reorderHarmonyBlocks: (activeId: string, overId: string) => {
    set((state) => {
      const oldIndex = state.harmonySequence.findIndex((b) => b.instanceId === activeId);
      const newIndex = state.harmonySequence.findIndex((b) => b.instanceId === overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const newSequence = [...state.harmonySequence];
      const [removed] = newSequence.splice(oldIndex, 1);
      newSequence.splice(newIndex, 0, removed);
      return { harmonySequence: newSequence };
    });
  },

  clearHarmonySequence: () => set({ harmonySequence: [] }),

  // === Common Actions ===
  setTempo: (tempo: number) => set({ tempo: Math.max(40, Math.min(240, tempo)) }),
  setLooping: (isLooping: boolean) => set({ isLooping }),
  toggleLoop: () => set((state) => ({ isLooping: !state.isLooping })),

  play: () => set({ isPlaying: true }),
  stop: () => set({ isPlaying: false }),
  reset: () => set({ isPlaying: false, currentTick: 0 }),
  setCurrentTick: (tick: number) => set({ currentTick: tick }),
}));

// Selector helpers
export const selectSequence = (state: SequenceStore) => state.sequence;
export const selectBeatSequence = (state: SequenceStore) => state.beatSequence;
export const selectHarmonySequence = (state: SequenceStore) => state.harmonySequence;
export const selectIsPlaying = (state: SequenceStore) => state.isPlaying;
export const selectCurrentTick = (state: SequenceStore) => state.currentTick;
export const selectTempo = (state: SequenceStore) => state.tempo;
export const selectIsLooping = (state: SequenceStore) => state.isLooping;
