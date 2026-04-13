import { BlockDefinition, BeatDefinition, HarmonyDefinition } from "./types";

export const BLOCK_LIBRARY: Record<string, BlockDefinition> = {
  motif_01: {
    blockId: "motif_01",
    name: "Steady Pulse",
    ticks: 4,
    color: "#FF6B6B",
    pattern: [
      { time: 0, note: "C4", duration: 0.9 },
      { time: 1, note: "C4", duration: 0.9 },
      { time: 2, note: "C4", duration: 0.9 },
      { time: 3, note: "C4", duration: 0.9 },
    ],
  },
  motif_02: {
    blockId: "motif_02",
    name: "Gallop",
    ticks: 3,
    color: "#4ECDC4",
    pattern: [
      { time: 0, note: "E4", duration: 0.4 },
      { time: 0.5, note: "E4", duration: 0.4 },
      { time: 1, note: "G4", duration: 1.8 },
    ],
  },
  motif_03: {
    blockId: "motif_03",
    name: "Syncopated",
    ticks: 6,
    color: "#FFE66D",
    pattern: [
      { time: 0, note: "D4", duration: 0.9 },
      { time: 1.5, note: "F4", duration: 0.9 },
      { time: 2.5, note: "D4", duration: 0.4 },
      { time: 3, note: "F4", duration: 0.9 },
      { time: 4.5, note: "A4", duration: 1.4 },
    ],
  },
  rhythm_01: {
    blockId: "rhythm_01",
    name: "Long Tone",
    ticks: 2,
    color: "#95E1D3",
    pattern: [{ time: 0, note: "G4", duration: 1.8 }],
  },
  rhythm_02: {
    blockId: "rhythm_02",
    name: "Playful Skip",
    ticks: 5,
    color: "#DDA0DD",
    pattern: [
      { time: 0, note: "C5", duration: 1.4 },
      { time: 1.5, note: "A4", duration: 0.4 },
      { time: 2, note: "G4", duration: 0.4 },
      { time: 2.5, note: "E4", duration: 0.4 },
      { time: 3, note: "C4", duration: 1.8 },
    ],
  },
};

export const TICK_WIDTH = 40; // Base unit: 40px per tick

export function getBlockDefinition(blockId: string): BlockDefinition | undefined {
  return BLOCK_LIBRARY[blockId];
}

export function getAllBlocks(): BlockDefinition[] {
  return Object.values(BLOCK_LIBRARY);
}

// Beat/Drum Block Library
export const BEAT_LIBRARY: Record<string, BeatDefinition> = {
  beat_01: {
    blockId: "beat_01",
    name: "Basic Rock",
    ticks: 4,
    color: "#E74C3C",
    pattern: [
      { time: 0, drum: "kick" },
      { time: 0, drum: "hihat" },
      { time: 0.5, drum: "hihat" },
      { time: 1, drum: "snare" },
      { time: 1, drum: "hihat" },
      { time: 1.5, drum: "hihat" },
      { time: 2, drum: "kick" },
      { time: 2, drum: "hihat" },
      { time: 2.5, drum: "hihat" },
      { time: 3, drum: "snare" },
      { time: 3, drum: "hihat" },
      { time: 3.5, drum: "hihat" },
    ],
  },
  beat_02: {
    blockId: "beat_02",
    name: "Four on Floor",
    ticks: 4,
    color: "#9B59B6",
    pattern: [
      { time: 0, drum: "kick" },
      { time: 0.5, drum: "hihat" },
      { time: 1, drum: "kick" },
      { time: 1, drum: "snare" },
      { time: 1.5, drum: "hihat" },
      { time: 2, drum: "kick" },
      { time: 2.5, drum: "hihat" },
      { time: 3, drum: "kick" },
      { time: 3, drum: "snare" },
      { time: 3.5, drum: "hihat" },
    ],
  },
  beat_03: {
    blockId: "beat_03",
    name: "Hip Hop",
    ticks: 4,
    color: "#3498DB",
    pattern: [
      { time: 0, drum: "kick" },
      { time: 0.75, drum: "hihat" },
      { time: 1, drum: "snare" },
      { time: 1.5, drum: "hihat" },
      { time: 2.25, drum: "kick" },
      { time: 2.5, drum: "hihat" },
      { time: 3, drum: "snare" },
      { time: 3.5, drum: "hihat" },
    ],
  },
  beat_04: {
    blockId: "beat_04",
    name: "Shuffle",
    ticks: 3,
    color: "#1ABC9C",
    pattern: [
      { time: 0, drum: "kick" },
      { time: 0.66, drum: "hihat" },
      { time: 1, drum: "snare" },
      { time: 1.66, drum: "hihat" },
      { time: 2, drum: "kick" },
      { time: 2.66, drum: "hihat" },
    ],
  },
  beat_05: {
    blockId: "beat_05",
    name: "Breakbeat",
    ticks: 4,
    color: "#F39C12",
    pattern: [
      { time: 0, drum: "kick" },
      { time: 0.5, drum: "hihat" },
      { time: 1, drum: "snare" },
      { time: 1.5, drum: "kick" },
      { time: 2, drum: "hihat" },
      { time: 2.5, drum: "snare" },
      { time: 3, drum: "kick" },
      { time: 3.5, drum: "hihat" },
    ],
  },
};

export function getBeatDefinition(blockId: string): BeatDefinition | undefined {
  return BEAT_LIBRARY[blockId];
}

export function getAllBeats(): BeatDefinition[] {
  return Object.values(BEAT_LIBRARY);
}

// Harmony/Chord Block Library (using C4-C5 range for better audibility)
export const HARMONY_LIBRARY: Record<string, HarmonyDefinition> = {
  harmony_01: {
    blockId: "harmony_01",
    name: "C Major",
    ticks: 4,
    color: "#2ECC71",
    pattern: [
      { time: 0, notes: ["C4", "E4", "G4"], duration: 3.8, velocity: 0.7 },
    ],
  },
  harmony_02: {
    blockId: "harmony_02",
    name: "A Minor",
    ticks: 4,
    color: "#27AE60",
    pattern: [
      { time: 0, notes: ["A3", "C4", "E4"], duration: 3.8, velocity: 0.7 },
    ],
  },
  harmony_03: {
    blockId: "harmony_03",
    name: "F Major",
    ticks: 4,
    color: "#1E8449",
    pattern: [
      { time: 0, notes: ["F3", "A3", "C4"], duration: 3.8, velocity: 0.7 },
    ],
  },
  harmony_04: {
    blockId: "harmony_04",
    name: "G Major",
    ticks: 4,
    color: "#229954",
    pattern: [
      { time: 0, notes: ["G3", "B3", "D4"], duration: 3.8, velocity: 0.7 },
    ],
  },
  harmony_05: {
    blockId: "harmony_05",
    name: "D Minor",
    ticks: 4,
    color: "#196F3D",
    pattern: [
      { time: 0, notes: ["D4", "F4", "A4"], duration: 3.8, velocity: 0.7 },
    ],
  },
  harmony_06: {
    blockId: "harmony_06",
    name: "Arpeggio Up",
    ticks: 4,
    color: "#0E6251",
    pattern: [
      { time: 0, notes: ["C4"], duration: 0.9, velocity: 0.6 },
      { time: 1, notes: ["E4"], duration: 0.9, velocity: 0.6 },
      { time: 2, notes: ["G4"], duration: 0.9, velocity: 0.6 },
      { time: 3, notes: ["C5"], duration: 0.9, velocity: 0.6 },
    ],
  },
  harmony_07: {
    blockId: "harmony_07",
    name: "Power Chord",
    ticks: 2,
    color: "#117A65",
    pattern: [
      { time: 0, notes: ["E3", "B3", "E4"], duration: 1.8, velocity: 0.8 },
    ],
  },
};

export function getHarmonyDefinition(blockId: string): HarmonyDefinition | undefined {
  return HARMONY_LIBRARY[blockId];
}

export function getAllHarmonies(): HarmonyDefinition[] {
  return Object.values(HARMONY_LIBRARY);
}
