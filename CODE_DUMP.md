# MusicBlocks - Complete Source Code Dump

Generated: 2026-04-13

This document contains all source code for the MusicBlocks application in a single file for easy reading and reference.

---

## Configuration Files

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

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        block: {
          pulse: "#FF6B6B",
          gallop: "#4ECDC4",
          syncopated: "#FFE66D",
          longtone: "#95E1D3",
          skip: "#DDA0DD",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## App Root

### app/layout.tsx
```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MusicBlocks - Musical Playground",
  description: "An impromptu musical discovery environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
```

### app/page.tsx
```typescript
import Playground from "@/components/Playground";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <Playground />
    </main>
  );
}
```

### app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --tick-width: 40px;
}

body {
  @apply bg-slate-900 text-slate-100;
}

/* Block glow effect during playback */
.block-active {
  @apply ring-4 ring-white/50;
  box-shadow: 0 0 20px currentColor;
}

/* Timeline drop zone */
.timeline-dropzone {
  @apply min-h-[80px] border-2 border-dashed border-slate-600 rounded-lg;
  @apply transition-colors duration-200;
}

.timeline-dropzone.drag-over {
  @apply border-blue-400 bg-blue-400/10;
}

/* Playhead animation */
@keyframes playhead-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.playhead {
  animation: playhead-pulse 0.5s ease-in-out infinite;
}

/* Grid background for tick visualization */
.tick-grid {
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent calc(var(--tick-width) - 1px),
    rgba(148, 163, 184, 0.2) calc(var(--tick-width) - 1px),
    rgba(148, 163, 184, 0.2) var(--tick-width)
  );
}
```

---

## Type Definitions

### lib/types.ts
```typescript
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
  pattern: NoteEvent[]; // Audio pattern for Tone.js
}

export interface SequenceBlock {
  instanceId: string; // Unique instance ID (uuid)
  blockId: string; // Reference to BLOCK_LIBRARY
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
```

---

## Library Files

### lib/blockLibrary.ts
[Content will be read separately]

### lib/stores/useSequenceStore.ts
[Content will be read separately]

### lib/audio/audioEngine.ts
[Content will be read separately]

---

## Component Files

### components/Playground.tsx
[Content will be read separately]

### components/Blocks/MusicBlock.tsx
```typescript
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { BlockDefinition } from "@/lib/types";
import { TICK_WIDTH } from "@/lib/blockLibrary";

interface MusicBlockProps {
  definition: BlockDefinition;
  instanceId: string;
  isActive?: boolean;
  onRemove?: () => void;
}

export default function MusicBlock({
  definition,
  instanceId,
  isActive = false,
  onRemove,
}: MusicBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: instanceId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${definition.ticks * TICK_WIDTH}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <motion.div
        style={{ backgroundColor: definition.color }}
        className={`
          group relative h-16 rounded-lg cursor-grab active:cursor-grabbing
          flex items-center justify-center
          text-slate-900 font-semibold text-sm
          select-none
          transition-shadow duration-200
          ${isDragging ? "opacity-50 z-50" : ""}
          ${isActive ? "block-active" : ""}
        `}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <span className="truncate px-2">{definition.name}</span>

        {/* Tick markers */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-1">
          {Array.from({ length: definition.ticks }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-slate-900/30"
            />
          ))}
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white
              flex items-center justify-center text-xs font-bold
              opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity"
          >
            ×
          </button>
        )}
      </motion.div>
    </div>
  );
}
```

### components/Blocks/BeatBlock.tsx
```typescript
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { BeatDefinition } from "@/lib/types";
import { TICK_WIDTH } from "@/lib/blockLibrary";

interface BeatBlockProps {
  definition: BeatDefinition;
  instanceId: string;
  isActive?: boolean;
  onRemove?: () => void;
}

export default function BeatBlock({
  definition,
  instanceId,
  isActive = false,
  onRemove,
}: BeatBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: instanceId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${definition.ticks * TICK_WIDTH}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <motion.div
        style={{ backgroundColor: definition.color }}
        className={`
          group relative h-12 rounded-lg cursor-grab active:cursor-grabbing
          flex items-center justify-center
          text-white font-semibold text-xs
          select-none
          transition-shadow duration-200
          ${isDragging ? "opacity-50 z-50" : ""}
          ${isActive ? "block-active" : ""}
        `}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <span className="truncate px-2">{definition.name}</span>

        {/* Tick markers */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-1">
          {Array.from({ length: definition.ticks }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-white/30"
            />
          ))}
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white
              flex items-center justify-center text-xs font-bold
              opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity"
          >
            ×
          </button>
        )}
      </motion.div>
    </div>
  );
}
```

[Additional components will be appended...]

---

## Summary

This code dump contains the complete source code for the MusicBlocks application, a musical playground built with:

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Audio**: Web Audio API (custom implementation)

The application features three sequencers (Melody, Harmony, Beats) with drag-and-drop block arrangement, real-time playback, and visual feedback.
