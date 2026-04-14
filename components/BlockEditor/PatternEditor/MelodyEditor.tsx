"use client";

import { useState, useRef, useEffect } from "react";
import { NoteEvent } from "@/lib/types";

// Note frequencies for preview playback
const NOTE_FREQUENCIES: Record<string, number> = {
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13,
  "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00,
  "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
};

interface MelodyEditorProps {
  ticks: number;
  pattern: NoteEvent[];
  onChange: (pattern: NoteEvent[]) => void;
}

// Note grid: C4 to B4 (one octave)
const NOTES = [
  "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4", "E4", "D#4", "D4", "C#4", "C4"
];

const NOTE_COLORS: Record<string, string> = {
  "C4": "bg-blue-100",
  "C#4": "bg-gray-100",
  "D4": "bg-blue-100",
  "D#4": "bg-gray-100",
  "E4": "bg-blue-100",
  "F4": "bg-blue-100",
  "F#4": "bg-gray-100",
  "G4": "bg-blue-100",
  "G#4": "bg-gray-100",
  "A4": "bg-blue-100",
  "A#4": "bg-gray-100",
  "B4": "bg-blue-100",
};

export default function MelodyEditor({
  ticks,
  pattern,
  onChange,
}: MelodyEditorProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Play note preview
  const playNotePreview = (note: string) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) return;

    // Create oscillator for the note
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    // Envelope: quick fade in and out
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  };

  // Each tick is subdivided into 4 cells (16th notes)
  const subdivisions = ticks * 4;

  const toggleNote = (note: string, time: number) => {
    const existingIndex = pattern.findIndex(
      (n) => n.note === note && n.time === time
    );

    if (existingIndex >= 0) {
      // Remove note
      onChange(pattern.filter((_, i) => i !== existingIndex));
    } else {
      // Add note with default duration of 0.25 ticks (16th note / 1/4 of a tick)
      const newNote: NoteEvent = {
        note,
        time,
        duration: 0.25,
        velocity: 0.8,
      };
      onChange([...pattern, newNote]);

      // Play audio preview
      playNotePreview(note);
    }
  };

  const isNoteActive = (note: string, time: number): boolean => {
    return pattern.some((n) => n.note === note && n.time === time);
  };

  const handleMouseDown = (note: string, time: number) => {
    setIsDrawing(true);
    toggleNote(note, time);
  };

  const handleMouseEnter = (note: string, time: number) => {
    if (isDrawing) {
      toggleNote(note, time);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearPattern = () => {
    if (confirm("Clear all notes?")) {
      onChange([]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-600">
          Click or drag to add notes • Click again to remove
        </div>
        <button
          onClick={clearPattern}
          className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition"
        >
          Clear All
        </button>
      </div>

      {/* Piano Roll Grid */}
      <div
        className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex">
          {/* Note Labels */}
          <div className="bg-gray-100 border-r-2 border-gray-300">
            {NOTES.map((note) => (
              <div
                key={note}
                className="h-8 w-12 flex items-center justify-center text-xs font-semibold border-b border-gray-200"
              >
                {note}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-x-auto">
            <div
              className="grid"
              style={{
                gridTemplateRows: `repeat(${NOTES.length}, 2rem)`,
              }}
            >
              {NOTES.map((note, rowIndex) => (
                <div
                  key={note}
                  className="flex border-b border-gray-200"
                  style={{
                    gridRow: rowIndex + 1,
                  }}
                >
                  {Array.from({ length: subdivisions }).map((_, colIndex) => {
                    const time = colIndex * 0.25; // Each cell is 0.25 ticks (16th note)
                    const isActive = isNoteActive(note, time);
                    const isBeatStart = colIndex % 4 === 0; // Beat boundary every 4 cells (every tick)

                    return (
                      <div
                        key={colIndex}
                        className={`
                          h-8 w-8 border-r cursor-pointer transition-colors
                          ${isBeatStart ? "border-gray-400" : "border-gray-200"}
                          ${isActive ? "bg-purple-500 hover:bg-purple-600" : NOTE_COLORS[note] + " hover:bg-purple-200"}
                        `}
                        onMouseDown={() => handleMouseDown(note, time)}
                        onMouseEnter={() => handleMouseEnter(note, time)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Tick markers */}
            <div className="flex border-t-2 border-gray-300 bg-gray-50">
              {Array.from({ length: ticks }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 text-center text-xs font-semibold py-1 text-gray-600"
                  style={{ width: "8rem" }}
                >
                  Tick {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Summary */}
      <div className="text-xs text-gray-600">
        Notes in pattern: {pattern.length}
      </div>
    </div>
  );
}
