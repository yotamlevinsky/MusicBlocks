export interface NoteEvent {
  time: number; // Time offset in ticks (e.g., 0, 0.5, 1, 1.5)
  note: string; // Note name (e.g., "C4", "E4", "G4")
  duration: number; // Duration in ticks
  velocity?: number; // 0-1, defaults to 0.8
}

export type DrumType = "kick" | "snare" | "hihat";

export interface DrumEvent {
  time: number; // Time offset in ticks
  drum: DrumType; // Which drum to play
  velocity?: number; // 0-1, defaults to 0.8
}

export interface BeatDefinition {
  blockId: string;
  name: string;
  ticks: number;
  color: string;
  pattern: DrumEvent[];
}

export interface ChordEvent {
  time: number;
  notes: string[]; // Multiple notes for harmony
  duration: number;
  velocity?: number;
}

export interface HarmonyDefinition {
  blockId: string;
  name: string;
  ticks: number;
  color: string;
  pattern: ChordEvent[];
}

export interface BlockDefinition {
  blockId: string; // QR-mappable ID: "motif_01", "rhythm_02"
  name: string; // Display name: "Steady Pulse"
  ticks: number; // Duration in ticks (proportional width)
  color: string; // Hex color
  pattern: NoteEvent[]; // Audio pattern
}

// Pixel art representation for custom blocks
export interface PixelArtData {
  size: 8 | 16 | 24 | 32; // Canvas size in pixels
  pixels: string[][] | string; // 2D array of color strings or base64 encoded string
}

// Custom block created by teachers via Block Editor
export interface CustomBlock {
  blockId: string; // Unique custom block ID
  name: string; // Teacher-defined name
  category: "melody"; // MVP: melody only
  ticks: number; // Duration: 2-16 ticks (auto-calculated from pattern, max 4 measures)
  color: string; // Hex color for block background
  pattern: NoteEvent[]; // Musical pattern
  pixelArt: PixelArtData; // Visual representation
  hideLabel?: boolean; // Optional: hide text label, show only pixel art
}

export interface SequenceBlock {
  instanceId: string; // Unique instance ID (uuid)
  blockId: string; // Reference to BLOCK_LIBRARY or custom block ID
}

export interface SequenceStore {
  // Core melody sequence state
  sequence: SequenceBlock[];

  // Beat sequence state
  beatSequence: SequenceBlock[];

  // Harmony sequence state
  harmonySequence: SequenceBlock[];

  tempo: number;
  isLooping: boolean;

  // Playback state
  isPlaying: boolean;
  currentTick: number;

  // === THE BRIDGE: External Injection ===
  injectExternalSequence: (idArray: string[]) => void;
  injectExternalBeatSequence: (idArray: string[]) => void;
  injectExternalHarmonySequence: (idArray: string[]) => void;

  // Melody UI Actions
  addBlock: (blockId: string) => void;
  removeBlock: (instanceId: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  clearSequence: () => void;

  // Beat UI Actions
  addBeatBlock: (blockId: string) => void;
  removeBeatBlock: (instanceId: string) => void;
  reorderBeatBlocks: (activeId: string, overId: string) => void;
  clearBeatSequence: () => void;

  // Harmony UI Actions
  addHarmonyBlock: (blockId: string) => void;
  removeHarmonyBlock: (instanceId: string) => void;
  reorderHarmonyBlocks: (activeId: string, overId: string) => void;
  clearHarmonySequence: () => void;

  // Tempo & Loop
  setTempo: (tempo: number) => void;
  setLooping: (loop: boolean) => void;
  toggleLoop: () => void;

  // Playback
  play: () => void;
  stop: () => void;
  reset: () => void;
  setCurrentTick: (tick: number) => void;
}
