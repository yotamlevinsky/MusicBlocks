# MusicBlocks Error Log & Analysis

## ✅ Current Status: FIXED - Using Web Audio API

### Solution Applied
Replaced Tone.js with native **Web Audio API** implementation. Tone.js dynamic imports return empty exports in Next.js due to bundler incompatibility.

---

## 🚨 Previous Status: AUDIO ENGINE BROKEN (Tone.js)

---

## 1. Root Cause Analysis

### The Error
```
TypeError: ToneStart is not a function
TypeError: e.start is not a function
TypeError: Tone.start is not a function
```

### Why This Happens
The issue stems from how **Webpack/Turbopack in Next.js** bundles the **Tone.js** module during dynamic imports. Tone.js is a heavy and complex library, and its export structure doesn't play nicely with ESM dynamic import destructuring.

When you write `const { start } = await import("tone")`, the bundler returns an object where the functions are sometimes "buried" under a `default` property, causing `start` to be evaluated as `undefined`.

### What We Tried (All Failed)
| Attempt | Code | Result |
|---------|------|--------|
| 1 | `import * as Tone from "tone"` | `Tone.start` is undefined |
| 2 | `const Tone = await import("tone")` | `Tone.start` is not a function |
| 3 | `const { start } = await import("tone")` | `start` is undefined |
| 4 | `require("tone")` | Same issue in production build |

### Version Inconsistency Found
- **ERROR_LOG mentions**: Tone.js v14.9.17
- **package.json pins**: `^14.7.77`
- **Actually installed**: v14.9.17

**Action needed**: Lock to one exact version and test only that version.

---

## 2. Suggested Fixes

### Fix A: Safe Module Import Pattern
```typescript
async function loadTone() {
  if (toneLoaded) return;

  try {
    // Import the entire module
    const ToneModule = await import("tone");

    // Safely extract the main object (handles both ESM and CommonJS)
    const Tone = ToneModule.default || ToneModule;

    // Debug: verify what we got
    console.log("Tone keys:", Object.keys(Tone));
    console.log("Has start?", typeof Tone.start);

    ToneStart = Tone.start;
    ToneTransport = Tone.Transport;
    TonePolySynth = Tone.PolySynth;
    ToneSynth = Tone.Synth;

    toneLoaded = true;
  } catch (error) {
    console.error("Failed to load Tone.js:", error);
    throw error;
  }
}
```

### Fix B: Alternative - Use Context Resume
```typescript
const ToneModule = await import("tone");
const Tone = ToneModule.default || ToneModule;

// Instead of Tone.start(), try:
await Tone.getContext().resume();
// OR
await Tone.context.resume();
```

### Fix C: Add Safety Checks
```typescript
export async function initAudio(): Promise<void> {
  await loadTone();

  // Verify ToneStart exists before calling
  if (typeof ToneStart !== "function") {
    throw new Error(`ToneStart is not a function. Got: ${typeof ToneStart}`);
  }

  await ToneStart();
  // ...rest of initialization
}
```

---

## 3. Architectural Issues Found

### Issue A: Global Variable Risks in audioEngine.ts

**Current State**: Using file-level `let` variables to store Tone instances.

**Problem**: In Next.js with Hot Module Replacement (HMR), the file might reload, causing loss of references to active synthesizers → memory leaks or duplicate audio nodes.

**Fix - Use Singleton Pattern**:
```typescript
const audioGlobal = globalThis as { synthInstance?: any };

export async function initAudio(): Promise<void> {
  await loadTone();
  await ToneStart();

  if (!audioGlobal.synthInstance) {
    audioGlobal.synthInstance = new TonePolySynth(ToneSynth, {
      // config
    }).toDestination();
  }

  synth = audioGlobal.synthInstance;
}
```

### Issue B: Performance Bottlenecks in TransportControls.tsx

**Current State**: Extracting entire Zustand state at once.
```typescript
const { sequence, tempo, isPlaying... } = useSequenceStore();
```

**Problem**: Any state change (like `currentTick` updating dozens of times/second during playback) forces TransportControls to re-render, even though it doesn't display the tick.

**Fix - Use Atomic Selectors**:
```typescript
const sequence = useSequenceStore(selectSequence);
const tempo = useSequenceStore(selectTempo);
const play = useSequenceStore((state) => state.play);
// Now component won't re-render when currentTick changes
```

### Issue C: Drag & Drop Re-renders in Playground.tsx

**Current State**: Holding `activeDragId` and `activeBlockId` in useState of main Playground.

**Problem**: Every drag event causes entire main component + all children to re-render.

**Fix**:
- Isolate DragOverlay into standalone component
- Wrap children (BlockPalette, Timeline) in `React.memo`

### Issue D: React Strict Mode Double Invocation

**Problem**: Next.js runs Strict Mode in dev, invoking lifecycle hooks twice. This can cause two synthesizers to initialize simultaneously.

**Fix**: Add initialization guard:
```typescript
let isInitializing = false;

export async function initAudio(): Promise<void> {
  if (audioInitialized || isInitializing) return;
  isInitializing = true;

  try {
    // ... initialization code
    audioInitialized = true;
  } finally {
    isInitializing = false;
  }
}
```

---

## 4. All Source Files

### File Structure
```
MusicBlocks/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Tailwind styles
├── components/
│   ├── Playground.tsx      # Main orchestrator with DndContext
│   ├── Blocks/
│   │   ├── MusicBlock.tsx  # Draggable block component
│   │   └── BlockPalette.tsx # Block library panel
│   ├── Canvas/
│   │   ├── Timeline.tsx    # Drop zone and sequence display
│   │   └── Playhead.tsx    # Animated position indicator
│   └── Controls/
│       ├── TransportControls.tsx # Play/Stop/Reset
│       └── ScanButton.tsx  # QR injection modal
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── blockLibrary.ts     # Block definitions
│   ├── stores/
│   │   └── useSequenceStore.ts # Zustand store
│   └── audio/
│       └── audioEngine.ts  # ⚠️ PROBLEMATIC FILE
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

### package.json
```json
{
  "name": "music-blocks",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "framer-motion": "^11.0.0",
    "next": "14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tone": "^14.7.77",
    "uuid": "^9.0.1",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/uuid": "^9.0.8",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0"
  }
}
```

### lib/types.ts
```typescript
export interface NoteEvent {
  time: number;
  note: string;
  duration: number;
  velocity?: number;
}

export interface BlockDefinition {
  blockId: string;
  name: string;
  ticks: number;
  color: string;
  pattern: NoteEvent[];
}

export interface SequenceBlock {
  instanceId: string;
  blockId: string;
}

export interface SequenceStore {
  sequence: SequenceBlock[];
  tempo: number;
  isPlaying: boolean;
  currentTick: number;
  injectExternalSequence: (idArray: string[]) => void;
  addBlock: (blockId: string) => void;
  removeBlock: (instanceId: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  clearSequence: () => void;
  setTempo: (tempo: number) => void;
  play: () => void;
  stop: () => void;
  reset: () => void;
  setCurrentTick: (tick: number) => void;
}
```

### lib/blockLibrary.ts
```typescript
import { BlockDefinition } from "./types";

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

export const TICK_WIDTH = 40;

export function getBlockDefinition(blockId: string): BlockDefinition | undefined {
  return BLOCK_LIBRARY[blockId];
}

export function getAllBlocks(): BlockDefinition[] {
  return Object.values(BLOCK_LIBRARY);
}
```

### lib/stores/useSequenceStore.ts
```typescript
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { SequenceBlock, SequenceStore } from "../types";
import { getBlockDefinition } from "../blockLibrary";

export const useSequenceStore = create<SequenceStore>((set, get) => ({
  sequence: [],
  tempo: 120,
  isPlaying: false,
  currentTick: 0,

  injectExternalSequence: (idArray: string[]) => {
    const validBlocks: SequenceBlock[] = idArray
      .filter((blockId) => getBlockDefinition(blockId) !== undefined)
      .map((blockId) => ({
        instanceId: uuidv4(),
        blockId,
      }));
    set({ sequence: validBlocks, isPlaying: false, currentTick: 0 });
  },

  addBlock: (blockId: string) => {
    const definition = getBlockDefinition(blockId);
    if (!definition) return;
    const newBlock: SequenceBlock = { instanceId: uuidv4(), blockId };
    set((state) => ({ sequence: [...state.sequence, newBlock] }));
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

  clearSequence: () => set({ sequence: [], isPlaying: false, currentTick: 0 }),
  setTempo: (tempo: number) => set({ tempo: Math.max(40, Math.min(240, tempo)) }),
  play: () => set({ isPlaying: true }),
  stop: () => set({ isPlaying: false }),
  reset: () => set({ isPlaying: false, currentTick: 0 }),
  setCurrentTick: (tick: number) => set({ currentTick: tick }),
}));

export const selectSequence = (state: SequenceStore) => state.sequence;
export const selectIsPlaying = (state: SequenceStore) => state.isPlaying;
export const selectCurrentTick = (state: SequenceStore) => state.currentTick;
export const selectTempo = (state: SequenceStore) => state.tempo;
```

### lib/audio/audioEngine.ts ⚠️ PROBLEMATIC FILE
```typescript
"use client";

import { SequenceBlock } from "../types";
import { getBlockDefinition } from "../blockLibrary";

// Tone.js instance - PROBLEM: require/import doesn't expose expected exports
let Tone: any = null;
let synth: any = null;
let scheduledEvents: number[] = [];
let audioInitialized = false;

function getTone() {
  if (!Tone) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Tone = require("tone");
    console.log("Tone loaded:", Tone);
    console.log("Tone keys:", Object.keys(Tone));
  }
  return Tone;
}

export async function initAudio(): Promise<void> {
  if (audioInitialized) return;
  const tone = getTone();

  // PROBLEM: tone.start is undefined
  try {
    if (typeof tone.start === "function") {
      await tone.start();
    } else if (tone.context && tone.context.resume) {
      await tone.context.resume();
    } else if (tone.Context && tone.Context.prototype) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      await ctx.resume();
    }
  } catch (err) {
    console.warn("Audio context start error:", err);
  }

  audioInitialized = true;

  if (!synth) {
    try {
      synth = new tone.PolySynth(tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.3 },
      }).toDestination();
    } catch (err) {
      console.error("Synth creation error:", err);
    }
  }
}

// ... rest of functions for scheduling, playback, etc.
```

---

## 5. Working vs Broken Features

| Feature | Status | Notes |
|---------|--------|-------|
| Drag from palette to timeline | ✅ Working | |
| Reorder blocks on timeline | ✅ Working | |
| Remove blocks from timeline | ✅ Working | |
| Zustand state management | ✅ Working | |
| UI rendering | ✅ Working | |
| Scan modal for injection | ✅ Working | |
| **Audio playback** | ❌ BROKEN | Tone.js import issue |
| **Playhead animation** | ❌ BROKEN | Depends on audio |

---

## 6. Next Steps to Fix

1. **Debug Tone.js exports**: Add `console.log(Object.keys(require("tone")))` and check browser console
2. **Try default export**: `const Tone = ToneModule.default || ToneModule`
3. **Try context.resume()**: Instead of `Tone.start()`, use `Tone.context.resume()`
4. **Lock Tone.js version**: Change `"tone": "^14.7.77"` to `"tone": "14.7.77"` (exact)
5. **Consider alternative**: Use Web Audio API directly if Tone.js continues to fail

---

## 7. Console Output Needed

When clicking Play, check browser console for:
```
Tone loaded: [object]
Tone keys: [array of available properties]
```

This will reveal what's actually exported from Tone.js in the bundled environment.
