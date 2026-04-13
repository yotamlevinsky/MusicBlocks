# Harmony Playback Bug - Detailed Report

**Date**: 2026-04-13
**Status**: UNRESOLVED
**Severity**: HIGH
**Component**: `lib/audio/audioEngine.ts` - `playChord()` function

---

## Executive Summary

The harmony sequencer in MusicBlocks does not produce any audio output when harmony blocks are placed on the timeline and playback is initiated. This is despite:
- Melody sequencer working correctly
- Beat/drum sequencer working correctly
- Audio context being properly initialized
- Correct scheduling of harmony events
- Correct frequency calculations
- Proper oscillator creation and connection

---

## Symptoms

### What Works
✅ Melody blocks play correctly with triangle wave oscillators
✅ Beat blocks play drums (kick, snare, hi-hat) correctly
✅ AudioContext initializes successfully (state: "running")
✅ Harmony blocks are scheduled correctly (confirmed via console logs)
✅ Frequencies are calculated correctly (e.g., C3 = 130.81 Hz)
✅ Oscillators are created and start/stop calls are made
✅ Single note test (playing only first note of chord) WORKS

### What Doesn't Work
❌ Multiple notes playing simultaneously (chords) produce no sound
❌ Using `forEach` loop to create multiple oscillators fails silently
❌ Using regular `for` loop to create multiple oscillators also fails

---

## Technical Details

### AudioContext State
- **State**: `running` (confirmed)
- **CurrentTime**: Starts at 0, advances normally
- **Master Gain**: 0.4, connected to destination
- **Lookahead**: 0.3 seconds

### Harmony Block Scheduling
Console output confirms proper scheduling:
```
playChord called with notes: ['A2', 'C3', 'E3'] at time: 0.3
Playing single test note: A2 freq: 110
Oscillator created and started
Scheduled: 0 melody, 1 harmony, 0 beat blocks. Total: 4 ticks. Loop: false
```

### Working Code Path (Melody)
```typescript
function playNote(frequency: number, startTime: number, duration: number, velocity: number = 0.8): void {
  if (!audioContext || !masterGain) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;

  // Envelope setup
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
```

### Non-Working Code Path (Harmony - Multiple Notes)
```typescript
function playChord(notes: string[], startTime: number, duration: number, velocity: number = 0.6): void {
  if (!audioContext || !masterGain) return;

  const noteVelocity = velocity / Math.sqrt(notes.length);

  for (let i = 0; i < notes.length; i++) {
    const frequency = getFrequency(notes[i]);
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.value = frequency;

    // Same envelope as playNote
    const attack = 0.02;
    const decay = 0.1;
    const sustain = 0.5;
    const release = 0.3;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(noteVelocity, startTime + attack);
    gain.gain.linearRampToValueAtTime(noteVelocity * sustain, startTime + attack + decay);
    gain.gain.setValueAtTime(noteVelocity * sustain, startTime + duration - release);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }
}
```

### Working Code Path (Harmony - Single Note Test)
```typescript
function playChord(notes: string[], startTime: number, duration: number, velocity: number = 0.6): void {
  if (!audioContext || !masterGain) return;

  // TEST: Just play the first note using the exact same code as playNote
  const frequency = getFrequency(notes[0]);

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;

  // Same envelope as playNote...
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.1);
}
```
**This version WORKS** ✅ - Produces sound when playing only the first note.

---

## Debugging History

### Attempt 1: Initial Implementation
**Action**: Implemented `playChord` with `forEach` loop and `sine` oscillator type
**Result**: No sound
**Hypothesis**: Timing issue or envelope problem

### Attempt 2: Increased Lookahead Time
**Action**: Changed lookahead from 0.1s to 0.3s
**Result**: No sound
**Hypothesis**: Not a timing issue

### Attempt 3: Simplified Envelope
**Action**: Removed complex ADSR, used simple attack/release
**Result**: No sound
**Hypothesis**: Not an envelope issue

### Attempt 4: Added Safety Check
**Action**: Used `Math.max(startTime, audioContext.currentTime)` to prevent past scheduling
**Result**: No sound
**Console**: Shows scheduling is already in future

### Attempt 5: Matched playNote Exactly
**Action**: Copied exact envelope parameters from working `playNote` function
**Result**: No sound
**Observation**: Even with identical envelope, multi-note version fails

### Attempt 6: Changed Loop Type
**Action**: Changed from `notes.forEach()` to `for` loop
**Result**: No sound
**Hypothesis**: Not a closure/scope issue

### Attempt 7: Single Note Test
**Action**: Modified `playChord` to play only `notes[0]` using exact same code as `playNote`
**Result**: WORKS! Sound is produced ✅
**Critical Finding**: Single oscillator works, multiple oscillators fail

---

## Current Hypothesis

There appears to be an issue with creating **multiple Web Audio API oscillators** within the same function call. Possible causes:

### Theory 1: Oscillator/Gain Node Garbage Collection
JavaScript may be garbage collecting the oscillator and gain node references before they finish playing, when created in a loop without being stored in a persistent array.

**Evidence**:
- Single oscillator (stored in function scope) works
- Multiple oscillators (created in loop, not stored) don't work

**Test**: Store all oscillators in an array:
```typescript
const oscillators: OscillatorNode[] = [];
for (let i = 0; i < notes.length; i++) {
  const osc = audioContext.createOscillator();
  oscillators.push(osc); // Keep reference
  // ... setup and start
}
```

### Theory 2: AudioContext Node Limit
Some browsers may have limitations on simultaneous AudioNode creation or connections.

**Evidence**:
- Single node works
- Multiple nodes fail
- No error messages

**Test**: Try creating only 2 oscillators instead of 3, then test with different numbers.

### Theory 3: Gain Automation Timeline Conflict
When multiple oscillators share the same `startTime` with different gain nodes, there may be an automation timeline conflict.

**Evidence**:
- All oscillators scheduled at the same `startTime`
- Each has its own gain envelope
- All connect to same `masterGain`

**Test**: Stagger the envelope timing slightly (e.g., `startTime + i * 0.001`).

### Theory 4: Browser-Specific Web Audio Bug
The issue may be specific to the browser being used.

**Test**: Try in different browsers (Chrome, Firefox, Safari).

### Theory 5: Variable Scope/Closure Issue
Although we tested with both `forEach` and `for` loops, there may still be a subtle scope issue with how `audioContext` or `masterGain` are accessed.

**Evidence**:
- Both loop types fail
- Single access works

**Test**: Create local references before the loop:
```typescript
const ctx = audioContext;
const master = masterGain;
for (...) {
  const osc = ctx.createOscillator();
  gain.connect(master);
}
```

---

## Proposed Solutions (Untested)

### Solution 1: Store Oscillator References
```typescript
function playChord(notes: string[], startTime: number, duration: number, velocity: number = 0.6): void {
  if (!audioContext || !masterGain) return;

  const oscillators: OscillatorNode[] = [];
  const gainNodes: GainNode[] = [];
  const noteVelocity = velocity / Math.sqrt(notes.length);

  // Create all nodes first
  for (let i = 0; i < notes.length; i++) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.value = getFrequency(notes[i]);

    oscillators.push(osc);
    gainNodes.push(gain);
  }

  // Then connect and schedule
  oscillators.forEach((osc, i) => {
    const gain = gainNodes[i];

    // Envelope setup
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(noteVelocity, startTime + 0.02);
    gain.gain.linearRampToValueAtTime(noteVelocity * 0.5, startTime + 0.12);
    gain.gain.setValueAtTime(noteVelocity * 0.5, startTime + duration - 0.3);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });

  // Keep references until playback completes
  setTimeout(() => {
    oscillators.length = 0;
    gainNodes.length = 0;
  }, (duration + 0.2) * 1000);
}
```

### Solution 2: Use Separate Function Per Note
```typescript
function playChord(notes: string[], startTime: number, duration: number, velocity: number = 0.6): void {
  const noteVelocity = velocity / Math.sqrt(notes.length);
  notes.forEach(note => {
    playSingleChordNote(getFrequency(note), startTime, duration, noteVelocity);
  });
}

function playSingleChordNote(frequency: number, startTime: number, duration: number, velocity: number): void {
  if (!audioContext || !masterGain) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  // Envelope...

  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.1);
}
```

### Solution 3: Use Single Oscillator with Multiple Frequencies
This is not directly possible with Web Audio API, but we could use a custom PeriodicWave that combines the frequencies.

### Solution 4: Sequential Instead of Parallel
As a workaround, play notes in rapid succession (arpeggio) instead of simultaneously:
```typescript
notes.forEach((note, i) => {
  const offset = i * 0.05; // 50ms offset
  playNote(getFrequency(note), startTime + offset, duration, velocity);
});
```

---

## Impact

- **User Impact**: HIGH - Harmony sequencer is completely non-functional
- **Workaround Available**: No (besides playing only melody and beats)
- **Data Loss**: No
- **Security Risk**: No

---

## Next Steps

1. Test Solution 1 (Store oscillator references)
2. Test in different browsers
3. Check browser console for any suppressed errors
4. Consult Web Audio API documentation for node creation best practices
5. Consider filing bug report with browser vendor if browser-specific

---

## Related Issues

- None (first occurrence)

---

## Environment

- **Framework**: Next.js 14.2.0
- **Audio Library**: Web Audio API (native)
- **Browser**: [Not specified - needs testing across browsers]
- **OS**: Linux 6.14.0-37-generic

---

## Code References

- `lib/audio/audioEngine.ts:72-112` - playChord function
- `lib/audio/audioEngine.ts:43-68` - playNote function (working reference)
- `lib/audio/audioEngine.ts:275-290` - Harmony scheduling code
- `lib/blockLibrary.ts:169-244` - HARMONY_LIBRARY definitions
