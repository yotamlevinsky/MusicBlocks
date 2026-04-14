"use client";

import { SequenceBlock, DrumType, CustomBlock } from "../types";
import { getBlockDefinition, getBeatDefinition, getHarmonyDefinition } from "../blockLibrary";

// Web Audio API based audio engine
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let playbackTimeouts: number[] = [];
let tickInterval: number | null = null;
let loopTimeout: number | null = null;

// Keep oscillator references alive to prevent garbage collection
const activeOscillators: Set<OscillatorNode> = new Set();

// Note frequency map (extended for harmony)
const NOTE_FREQUENCIES: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
};

function getFrequency(note: string): number {
  return NOTE_FREQUENCIES[note] || 440;
}

export async function initAudio(): Promise<void> {
  if (audioContext) {
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    return;
  }

  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.4;
  masterGain.connect(audioContext.destination);

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}

// ============ MELODY SOUNDS ============

function playNote(frequency: number, startTime: number, duration: number, velocity: number = 0.8): void {
  if (!audioContext || !masterGain) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;

  const attack = 0.02;
  const decay = 0.1;
  const sustain = 0.5;
  const release = 0.3;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(velocity, startTime + attack);
  gainNode.gain.linearRampToValueAtTime(velocity * sustain, startTime + attack + decay);
  gainNode.gain.setValueAtTime(velocity * sustain, startTime + duration - release);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.1);
}

// ============ HARMONY SOUNDS ============

// Helper: Play a single note in a chord (dedicated function keeps references alive)
function playChordNote(frequency: number, startTime: number, duration: number, velocity: number, ctx: AudioContext, master: GainNode): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle"; // Brighter than sine for audibility
  osc.frequency.value = frequency;

  const attack = 0.02;
  const decay = 0.1;
  const sustain = 0.5;
  const release = 0.3;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(velocity, startTime + attack);
  gain.gain.linearRampToValueAtTime(velocity * sustain, startTime + attack + decay);
  gain.gain.setValueAtTime(velocity * sustain, startTime + duration - release);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(master);

  // Keep reference alive to prevent garbage collection
  activeOscillators.add(osc);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);

  // Clean up reference after playback
  osc.onended = () => {
    activeOscillators.delete(osc);
    osc.disconnect();
    gain.disconnect();
  };
}

function playChord(notes: string[], startTime: number, duration: number, velocity: number = 0.6): void {
  if (!audioContext || !masterGain) return;

  // Local references to avoid closure issues
  const ctx = audioContext;
  const master = masterGain;
  const noteVelocity = velocity / Math.sqrt(notes.length);

  // Use dedicated helper for each note
  notes.forEach(note => {
    const frequency = getFrequency(note);
    playChordNote(frequency, startTime, duration, noteVelocity, ctx, master);
  });
}

// ============ DRUM SOUNDS ============

function playKick(startTime: number, velocity: number = 0.8): void {
  if (!audioContext || !masterGain) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(150, startTime);
  osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.1);

  gain.gain.setValueAtTime(velocity, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + 0.3);
}

function playSnare(startTime: number, velocity: number = 0.8): void {
  if (!audioContext || !masterGain) return;

  const bufferSize = audioContext.sampleRate * 0.2;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1000;

  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(velocity * 0.5, startTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  const osc = audioContext.createOscillator();
  const oscGain = audioContext.createGain();

  osc.type = "triangle";
  osc.frequency.value = 180;

  oscGain.gain.setValueAtTime(velocity * 0.7, startTime);
  oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

  osc.connect(oscGain);
  oscGain.connect(masterGain);

  noise.start(startTime);
  noise.stop(startTime + 0.2);
  osc.start(startTime);
  osc.stop(startTime + 0.1);
}

function playHiHat(startTime: number, velocity: number = 0.6): void {
  if (!audioContext || !masterGain) return;

  const bufferSize = audioContext.sampleRate * 0.05;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7000;

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(velocity * 0.3, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  noise.start(startTime);
  noise.stop(startTime + 0.05);
}

function playDrum(drum: DrumType, startTime: number, velocity: number = 0.8): void {
  switch (drum) {
    case "kick": playKick(startTime, velocity); break;
    case "snare": playSnare(startTime, velocity); break;
    case "hihat": playHiHat(startTime, velocity); break;
  }
}

// ============ SCHEDULING ============

export async function scheduleSequence(
  melodySequence: SequenceBlock[],
  beatSequence: SequenceBlock[],
  harmonySequence: SequenceBlock[],
  onTickUpdate: (tick: number) => void,
  onComplete: () => void,
  bpm: number = 120,
  isLooping: boolean = false,
  onLoopRestart?: () => void,
  customBlocks: CustomBlock[] = []
): Promise<void> {
  // Helper to get block definition from custom or preset blocks
  const getDefinition = (blockId: string) => {
    const customBlock = customBlocks.find((b) => b.blockId === blockId);
    return customBlock || getBlockDefinition(blockId);
  };
  if (!audioContext) {
    await initAudio();
  }

  // Ensure audio context is running
  if (audioContext && audioContext.state === "suspended") {
    await audioContext.resume();
  }

  await clearScheduledEvents();

  const hasMelody = melodySequence.length > 0;
  const hasBeats = beatSequence.length > 0;
  const hasHarmony = harmonySequence.length > 0;

  if (!hasMelody && !hasBeats && !hasHarmony) {
    onComplete();
    return;
  }

  const secondsPerBeat = 60 / bpm;
  const startTime = audioContext!.currentTime + 0.3;

  // Calculate total ticks for each sequence
  let melodyTotalTicks = 0;
  melodySequence.forEach((seqBlock) => {
    const def = getDefinition(seqBlock.blockId);
    if (def) melodyTotalTicks += def.ticks;
  });

  let beatTotalTicks = 0;
  beatSequence.forEach((seqBlock) => {
    const def = getBeatDefinition(seqBlock.blockId);
    if (def) beatTotalTicks += def.ticks;
  });

  let harmonyTotalTicks = 0;
  harmonySequence.forEach((seqBlock) => {
    const def = getHarmonyDefinition(seqBlock.blockId);
    if (def) harmonyTotalTicks += def.ticks;
  });

  const totalTicks = Math.max(melodyTotalTicks, beatTotalTicks, harmonyTotalTicks);

  // Schedule melody notes
  let currentMelodyTick = 0;
  melodySequence.forEach((seqBlock) => {
    const definition = getDefinition(seqBlock.blockId);
    if (!definition) return;

    definition.pattern.forEach((noteEvent) => {
      const absoluteTick = currentMelodyTick + noteEvent.time;
      const noteStartTime = startTime + absoluteTick * secondsPerBeat;
      const noteDuration = noteEvent.duration * secondsPerBeat;
      const frequency = getFrequency(noteEvent.note);

      playNote(frequency, noteStartTime, noteDuration, noteEvent.velocity ?? 0.8);
    });

    currentMelodyTick += definition.ticks;
  });

  // Schedule harmony/chord events
  let currentHarmonyTick = 0;
  harmonySequence.forEach((seqBlock) => {
    const definition = getHarmonyDefinition(seqBlock.blockId);
    if (!definition) return;

    definition.pattern.forEach((chordEvent) => {
      const absoluteTick = currentHarmonyTick + chordEvent.time;
      const chordStartTime = startTime + absoluteTick * secondsPerBeat;
      const chordDuration = chordEvent.duration * secondsPerBeat;

      playChord(chordEvent.notes, chordStartTime, chordDuration, chordEvent.velocity ?? 0.6);
    });

    currentHarmonyTick += definition.ticks;
  });

  // Schedule beat/drum events
  let currentBeatTick = 0;
  beatSequence.forEach((seqBlock) => {
    const definition = getBeatDefinition(seqBlock.blockId);
    if (!definition) return;

    definition.pattern.forEach((drumEvent) => {
      const absoluteTick = currentBeatTick + drumEvent.time;
      const drumStartTime = startTime + absoluteTick * secondsPerBeat;

      playDrum(drumEvent.drum, drumStartTime, drumEvent.velocity ?? 0.8);
    });

    currentBeatTick += definition.ticks;
  });

  // Schedule tick updates for playhead animation
  const tickDuration = secondsPerBeat * 0.25 * 1000;
  let currentTick = 0;

  tickInterval = window.setInterval(() => {
    if (currentTick <= totalTicks) {
      onTickUpdate(currentTick);
      currentTick += 0.25;
    }
  }, tickDuration) as unknown as number;

  // Schedule completion or loop
  const totalDuration = totalTicks * secondsPerBeat * 1000;

  if (isLooping) {
    loopTimeout = window.setTimeout(() => {
      if (onLoopRestart) onLoopRestart();
    }, totalDuration);
  } else {
    const completionTimeout = window.setTimeout(() => {
      clearScheduledEvents();
      onComplete();
    }, totalDuration + 200);
    playbackTimeouts.push(completionTimeout);
  }

  isPlaying = true;
}

export async function clearScheduledEvents(): Promise<void> {
  playbackTimeouts.forEach((id) => window.clearTimeout(id));
  playbackTimeouts = [];

  if (tickInterval !== null) {
    window.clearInterval(tickInterval);
    tickInterval = null;
  }

  if (loopTimeout !== null) {
    window.clearTimeout(loopTimeout);
    loopTimeout = null;
  }

  // Clean up any remaining active oscillators
  activeOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {
      // Oscillator may already be stopped
    }
  });
  activeOscillators.clear();

  isPlaying = false;
}

export async function stopPlayback(): Promise<void> {
  await clearScheduledEvents();

  if (audioContext && audioContext.state === "running" && masterGain) {
    const now = audioContext.currentTime;
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + 0.1);

    setTimeout(() => {
      if (masterGain) {
        masterGain.gain.setValueAtTime(0.4, audioContext!.currentTime);
      }
    }, 150);
  }
}

export function getTotalTicks(sequence: SequenceBlock[], type: "melody" | "beat" | "harmony" = "melody", customBlocks: CustomBlock[] = []): number {
  return sequence.reduce((total, seqBlock) => {
    let def;
    if (type === "beat") def = getBeatDefinition(seqBlock.blockId);
    else if (type === "harmony") def = getHarmonyDefinition(seqBlock.blockId);
    else {
      const customBlock = customBlocks.find((b) => b.blockId === seqBlock.blockId);
      def = customBlock || getBlockDefinition(seqBlock.blockId);
    }
    return total + (def?.ticks ?? 0);
  }, 0);
}

export function getBlockStartTick(sequence: SequenceBlock[], instanceId: string, type: "melody" | "beat" | "harmony" = "melody", customBlocks: CustomBlock[] = []): number {
  let tick = 0;
  for (const block of sequence) {
    if (block.instanceId === instanceId) {
      return tick;
    }
    let def;
    if (type === "beat") def = getBeatDefinition(block.blockId);
    else if (type === "harmony") def = getHarmonyDefinition(block.blockId);
    else {
      const customBlock = customBlocks.find((b) => b.blockId === block.blockId);
      def = customBlock || getBlockDefinition(block.blockId);
    }
    tick += def?.ticks ?? 0;
  }
  return tick;
}
