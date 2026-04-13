"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSequenceStore } from "@/lib/stores/useSequenceStore";
import {
  initAudio,
  scheduleSequence,
  stopPlayback,
} from "@/lib/audio/audioEngine";

export default function TransportControls() {
  const {
    sequence,
    beatSequence,
    harmonySequence,
    tempo,
    isLooping,
    isPlaying,
    play,
    stop,
    reset,
    setCurrentTick,
    setTempo: setStoreTempo,
    toggleLoop,
    clearSequence,
    clearBeatSequence,
    clearHarmonySequence,
  } = useSequenceStore();

  const isLoopingRef = useRef(isLooping);
  isLoopingRef.current = isLooping;

  const hasContent = sequence.length > 0 || beatSequence.length > 0 || harmonySequence.length > 0;

  const startPlayback = useCallback(async () => {
    if (!hasContent) return;

    try {
      await initAudio();

      const handleLoopRestart = () => {
        if (isLoopingRef.current) {
          setCurrentTick(0);
          startPlayback();
        }
      };

      await scheduleSequence(
        sequence,
        beatSequence,
        harmonySequence,
        (tick) => setCurrentTick(tick),
        () => {
          stop();
          setCurrentTick(0);
        },
        tempo,
        isLoopingRef.current,
        handleLoopRestart
      );

      play();
    } catch (error) {
      console.error("Playback error:", error);
    }
  }, [sequence, beatSequence, harmonySequence, tempo, hasContent, play, stop, setCurrentTick]);

  const handlePlay = useCallback(async () => {
    await startPlayback();
  }, [startPlayback]);

  const handleStop = useCallback(async () => {
    try {
      await stopPlayback();
      stop();
      setCurrentTick(0);
    } catch (error) {
      console.error("Stop error:", error);
    }
  }, [stop, setCurrentTick]);

  const handleReset = useCallback(async () => {
    await handleStop();
    reset();
  }, [handleStop, reset]);

  const handleClearAll = useCallback(() => {
    clearSequence();
    clearBeatSequence();
    clearHarmonySequence();
  }, [clearSequence, clearBeatSequence, clearHarmonySequence]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (isPlaying) {
          handleStop();
        } else {
          handlePlay();
        }
      }

      if (e.code === "KeyL") {
        toggleLoop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, handlePlay, handleStop, toggleLoop]);

  return (
    <div className="flex items-center gap-3">
      {/* Tempo control */}
      <div className="flex items-center gap-2">
        <label className="text-slate-400 text-sm">BPM:</label>
        <input
          type="number"
          min={40}
          max={240}
          value={tempo}
          onChange={(e) => setStoreTempo(parseInt(e.target.value) || 120)}
          className="w-14 bg-slate-700 text-white rounded px-2 py-1 text-sm"
          disabled={isPlaying}
        />
      </div>

      {/* Loop toggle */}
      <motion.button
        onClick={toggleLoop}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          transition-colors
          ${isLooping ? "bg-purple-500 hover:bg-purple-600" : "bg-slate-600 hover:bg-slate-500"}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle Loop (L)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </motion.button>

      {/* Transport buttons */}
      <div className="flex items-center gap-2">
        {/* Play/Stop */}
        <motion.button
          onClick={isPlaying ? handleStop : handlePlay}
          disabled={!hasContent}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>

        {/* Clear All */}
        <motion.button
          onClick={handleClearAll}
          disabled={!hasContent || isPlaying}
          className="px-3 h-10 rounded-lg flex items-center justify-center
            bg-slate-700 hover:bg-slate-600 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Clear
        </motion.button>
      </div>
    </div>
  );
}
