# Product Feature Document: Block Editor with Pixel Art

**Version**: 1.0
**Date**: 2026-04-13
**Target Users**: Teachers and Educators
**Status**: Proposed

---

## Executive Summary

This document proposes a **Block Editor** feature for MusicBlocks that allows teachers to create custom musical blocks with user-defined patterns and visual pixel art representations. This empowers educators to:
- Design curriculum-specific musical patterns
- Create culturally relevant musical blocks
- Add visual metaphors through pixel art
- Customize difficulty levels for different age groups
- Build themed lesson plans with matching visual aesthetics

---

## Problem Statement

### Current Limitations
1. **Fixed Block Library**: Teachers can only use the 17 pre-defined blocks (5 melody, 5 beats, 7 harmony)
2. **No Visual Customization**: Blocks are color-coded but have no iconic/visual representation beyond text labels
3. **Limited Musical Patterns**: Cannot create blocks for specific musical concepts being taught (e.g., triplets, dotted rhythms, specific cultural patterns)
4. **Cultural Barriers**: Cannot represent music from diverse cultural backgrounds (gamelan patterns, Middle Eastern rhythms, etc.)
5. **Engagement Gap**: Younger students may struggle with text-only block identification

### User Needs
Teachers need to:
- Create blocks that match their lesson plans
- Add visual icons/pictures to blocks for younger students or visual learners
- Share custom block libraries with other teachers
- Build progressive difficulty (e.g., simple 2-tick blocks → complex 8-tick blocks)
- Represent musical concepts visually (e.g., a "bouncy ball" for staccato)

---

## Proposed Solution

A **two-panel Block Editor** interface that allows teachers to:
1. **Define musical patterns** (notes, rhythms, chords) with duration between 0.5 to 1.5 measures
2. **Draw pixel art icons** that represent the block visually

### Core Components

#### 1. Musical Pattern Editor
**Duration Range**: 2-6 ticks (0.5 to 1.5 measures at 4/4 time)
- **Minimum**: 2 ticks (half measure) - simple, beginner-friendly patterns
- **Maximum**: 6 ticks (one and half measures) - complex, advanced patterns
- **Optimal Sweet Spot**: 4 ticks (one measure) - aligns with musical intuition

**Features**:
- **Melody Editor**: Piano roll grid (12 notes × 24 subdivisions)
  - Vertical axis: Notes (C3-B4 range, extendable)
  - Horizontal axis: Time (subdivided into 16th notes)
  - Click to add/remove notes
  - Drag to adjust duration
  - Velocity control per note

- **Beat Editor**: Drum grid (3 drums × 24 subdivisions)
  - Rows: Kick, Snare, Hi-Hat
  - Columns: 16th note subdivisions
  - Toggle cells to create patterns
  - Velocity control per hit

- **Harmony Editor**: Chord timeline
  - Place chord blocks on timeline
  - Select from chord library (Major, Minor, 7th, etc.)
  - Or define custom chords (note selection)
  - Set duration for each chord

**Playback Features**:
- **Preview Button**: Hear the pattern before saving
- **Loop Mode**: Repeat pattern for refinement
- **Metronome**: Optional click track
- **Tempo Control**: Adjust BPM for editing (defaults to global tempo on save)

#### 2. Pixel Art Editor
**Canvas Size**: 24×24 pixels or 32×32 pixels
**Purpose**: Create iconic visual representation of the musical block

**Tools**:
- **Pencil**: Draw individual pixels
- **Fill Bucket**: Fill connected areas
- **Eraser**: Remove pixels
- **Color Picker**: 16-color palette + custom colors
- **Grid Toggle**: Show/hide pixel grid
- **Preview**: See how icon looks at actual size

**Suggested Icon Themes**:
- **Visual Metaphors**: Bouncing ball (staccato), smooth wave (legato), stairs (ascending)
- **Instruments**: Piano keys, guitar, drums
- **Cultural Symbols**: Dragon (Chinese music), Camel (Middle Eastern)
- **Abstract Patterns**: Geometric shapes representing rhythm
- **Emotions**: Happy face (upbeat), sad face (minor key)

**Technical Specs**:
- **Storage**: PNG with transparency or base64-encoded pixel array
- **Colors**: RGB with alpha channel
- **Render**: CSS `image-rendering: pixelated` for crisp display

#### 3. Block Metadata
**Required Fields**:
- **Name**: Display name (max 20 characters)
- **Block ID**: Unique identifier (auto-generated: `custom_001`, `custom_002`)
- **Category**: Melody, Beat, or Harmony
- **Duration**: Auto-calculated from pattern (2-6 ticks)
- **Color**: Background color (color picker)

**Optional Fields**:
- **Description**: Teacher notes (not shown to students)
- **Difficulty Level**: Beginner / Intermediate / Advanced (for filtering)
- **Cultural Origin**: Tag for cultural context (e.g., "West African", "Japanese")
- **Lesson Plan**: Link to associated lesson (future integration)
- **Tags**: Custom keywords for searching

#### 4. Block Library Management
**Teacher Dashboard**:
- **My Blocks**: View all custom blocks created by teacher
- **Shared Blocks**: Blocks shared by other teachers (community library)
- **Import/Export**: JSON format for sharing via file
- **Duplicate**: Clone existing block for modification
- **Archive**: Hide blocks without deleting

**Block Actions**:
- **Edit**: Modify pattern or pixel art
- **Delete**: Remove block (with confirmation)
- **Share**: Publish to community library
- **QR Code**: Generate QR code for physical block integration

---

## User Interface Design

### Editor Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Create New Block                                         [×] Close  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─── Block Info ────────────────────────────────────────────────┐  │
│  │ Name: [____________________]  Category: [Melody ▼]           │  │
│  │ Color: [🎨]  Difficulty: [Intermediate ▼]                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─── Pattern Editor ──────────────┐  ┌─── Pixel Art Editor ─────┐ │
│  │                                  │  │                           │ │
│  │   Notes                          │  │   ┌─────────────────────┐ │ │
│  │   B4  ┌───┐                      │  │   │ 32×32 Canvas        │ │ │
│  │   A4  │   │   ┌─┐                │  │   │                     │ │ │
│  │   G4  │   ├───┤ │                │  │   │   [Pixel Grid]      │ │ │
│  │   F4  └───┘   └─┘                │  │   │                     │ │ │
│  │   E4                              │  │   │                     │ │ │
│  │   D4  ╔═══╗                      │  │   └─────────────────────┘ │ │
│  │   C4  ║   ║                      │  │                           │ │ │
│  │       └───┴───┴───┴───┴─        │  │   Tools: ✏️ 🪣 🧹        │ │
│  │       0   1   2   3   4   5  T  │  │   Colors: [Palette]      │ │ │
│  │                                  │  │                           │ │
│  │   [▶ Preview] [🔁 Loop] 120 BPM │  │   Preview: [Tiny Icon]   │ │ │
│  │                                  │  │                           │ │
│  └──────────────────────────────────┘  └───────────────────────────┘ │
│                                                                       │
│  ┌─── Preview ──────────────────────────────────────────────────┐   │
│  │  Your block will look like this:                             │   │
│  │                                                               │   │
│  │  ┌──────────┐                                                │   │
│  │  │  [Icon]  │  Block Name                4 ticks             │   │
│  │  └──────────┘                                                │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
│                    [Cancel]  [Save to My Blocks]                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Block Display with Pixel Art

**In Palette**:
```
┌────────────────┐
│  ┌──────────┐  │
│  │  [Icon]  │  │  ← 32×32 pixel art
│  │   🎵     │  │
│  └──────────┘  │
│  Custom Name   │  ← Text label below
└────────────────┘
```

**On Timeline**:
```
┌──────────────────────────────┐
│ [Icon]  Block Name           │  ← Icon on left, name on right
│ •  •  •  •                   │  ← Tick markers at bottom
└──────────────────────────────┘
```

---

## Technical Implementation

### Data Model

```typescript
interface CustomBlock {
  blockId: string; // "custom_001"
  name: string;
  category: "melody" | "beat" | "harmony";
  ticks: number; // 2-6
  color: string; // hex color
  pattern: NoteEvent[] | DrumEvent[] | ChordEvent[];

  // New fields for custom blocks
  pixelArt: {
    size: 24 | 32;
    pixels: string; // base64-encoded PNG or pixel array
  };

  metadata: {
    createdBy: string; // teacher ID
    createdAt: Date;
    description?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    culturalOrigin?: string;
    tags?: string[];
    isShared: boolean; // published to community
  };
}

interface BlockLibrary {
  preset: BlockDefinition[]; // Original 17 blocks
  custom: CustomBlock[]; // Teacher-created blocks
}
```

### File Structure

```
components/
├── BlockEditor/
│   ├── BlockEditorModal.tsx       # Main modal container
│   ├── PatternEditor/
│   │   ├── MelodyEditor.tsx       # Piano roll grid
│   │   ├── BeatEditor.tsx         # Drum grid
│   │   └── HarmonyEditor.tsx      # Chord timeline
│   ├── PixelArtEditor/
│   │   ├── PixelCanvas.tsx        # Drawing canvas
│   │   ├── ToolBar.tsx            # Drawing tools
│   │   └── ColorPalette.tsx       # Color picker
│   ├── BlockMetadataForm.tsx      # Name, color, category fields
│   └── BlockPreview.tsx           # Live preview of final block
│
├── Blocks/
│   └── CustomBlock.tsx            # Renders blocks with pixel art
│
lib/
├── stores/
│   └── useCustomBlockStore.ts     # Zustand store for custom blocks
├── blockStorage.ts                # localStorage/IndexedDB for persistence
└── pixelArt.ts                    # Utility functions for pixel rendering

pages/api/
├── blocks/
│   ├── save.ts                    # Save custom block
│   ├── list.ts                    # Get user's blocks
│   └── share.ts                   # Publish to community
```

### Storage Strategy

**Local Development** (Phase 1):
- localStorage for custom blocks (5MB limit)
- Base64-encoded pixel art stored inline
- Export/import via JSON files

**Production** (Phase 2):
- Backend database (PostgreSQL/Supabase)
- S3/CDN for pixel art images
- User authentication (teacher accounts)
- Community library with moderation

### Rendering Pixel Art

```typescript
// Convert pixel array to CSS background
function renderPixelArt(pixels: PixelData, size: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Draw pixels
  pixels.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  });

  return canvas.toDataURL();
}

// Apply to block
<div
  className="block-icon"
  style={{
    backgroundImage: `url(${renderPixelArt(block.pixelArt.pixels, 32)})`,
    imageRendering: 'pixelated'
  }}
/>
```

---

## User Flows

### Flow 1: Teacher Creates Custom Block

1. **Access Editor**
   - Click "Create Block" button in teacher dashboard
   - Modal opens with editor interface

2. **Define Pattern**
   - Select category (Melody/Beat/Harmony)
   - Use grid to create musical pattern
   - Click notes/hits to toggle
   - Drag to adjust duration
   - Click "Preview" to hear pattern

3. **Design Pixel Art**
   - Select color from palette
   - Use pencil tool to draw icon
   - Use fill bucket for solid areas
   - Preview icon at actual size
   - Iterate until satisfied

4. **Set Metadata**
   - Enter block name
   - Choose background color
   - Set difficulty level (optional)
   - Add tags (optional)

5. **Save Block**
   - Click "Save to My Blocks"
   - Block appears in custom palette
   - Immediately usable in sequences

### Flow 2: Teacher Shares Block with Community

1. **Select Block**
   - Go to "My Blocks" library
   - Click block to share

2. **Review and Publish**
   - Review metadata and description
   - Add cultural context if applicable
   - Click "Share with Community"
   - Block appears in community library

3. **Other Teachers Discover**
   - Browse community library
   - Filter by category, difficulty, culture
   - Import blocks to their library

### Flow 3: Student Uses Custom Block

1. **View Enhanced Palette**
   - Custom blocks appear alongside preset blocks
   - Pixel art icons make blocks visually distinctive
   - Hover shows block name and duration

2. **Drag to Timeline**
   - Same interaction as preset blocks
   - Icon displays on timeline
   - Plays teacher's custom pattern

3. **Learn Musical Concepts**
   - Visual icon reinforces musical concept
   - Pattern teaches specific rhythm/melody
   - Progressive difficulty builds skills

---

## Use Cases

### Use Case 1: Elementary Music Teacher (Age 6-8)

**Scenario**: Teaching basic rhythm patterns to first graders

**Custom Blocks Created**:
1. **"Clapping Pattern"**
   - Pattern: 4 quarter notes
   - Icon: 👏 (clapping hands pixel art)
   - Color: Bright yellow
   - Purpose: Students identify rhythm by visual icon

2. **"Walking Beat"**
   - Pattern: 8 eighth notes
   - Icon: 👣 (footsteps pixel art)
   - Color: Light blue
   - Purpose: Students walk while pattern plays

3. **"Skipping Rhythm"**
   - Pattern: Dotted quarter + eighth (×2)
   - Icon: 🦘 (kangaroo/skip pixel art)
   - Color: Orange
   - Purpose: Teaches dotted rhythms through movement

**Impact**: Young students can build sequences using visual icons instead of reading text labels, making the activity accessible and engaging.

---

### Use Case 2: Middle School Music Theory (Age 11-13)

**Scenario**: Teaching intervals and chord progressions

**Custom Blocks Created**:
1. **"Perfect Fifth"**
   - Pattern: C3→G3 melodic interval
   - Icon: 5️⃣ (number 5 pixel art)
   - Duration: 2 ticks
   - Purpose: Isolated interval practice

2. **"I-IV-V-I Progression"**
   - Pattern: C Major → F Major → G Major → C Major
   - Icon: Musical staff pixel art showing progression
   - Duration: 4 ticks
   - Purpose: Foundation for song structure

3. **"Minor Triad"**
   - Pattern: A Minor chord
   - Icon: Sad face 😔 (minor = sad)
   - Duration: 2 ticks
   - Purpose: Visual association with chord quality

**Impact**: Students learn theory concepts through experimentation, building progressions by ear and validating with theoretical knowledge.

---

### Use Case 3: High School World Music (Age 14-18)

**Scenario**: Exploring African drumming patterns

**Custom Blocks Created**:
1. **"Djembe Solo Pattern"**
   - Pattern: Traditional djembe rhythm (6 ticks)
   - Icon: 🥁 Djembe drum pixel art
   - Tags: "West African", "Polyrhythm"
   - Duration: 6 ticks (1.5 measures)

2. **"Dundun Bass Line"**
   - Pattern: Low drum foundation
   - Icon: 🪘 Bass drum pixel art
   - Tags: "West African", "Foundation"
   - Duration: 4 ticks

3. **"Bell Pattern (Gankogui)"**
   - Pattern: High-pitched bell rhythm
   - Icon: 🔔 Bell pixel art
   - Tags: "West African", "Timeline"
   - Duration: 4 ticks

**Impact**: Students experience authentic cultural rhythms, teacher can build curriculum around cultural context, visual icons help distinguish different instruments in the ensemble.

---

### Use Case 4: Special Education Music Class

**Scenario**: Teaching students with learning differences

**Custom Blocks Created**:
1. **Color-Coded Emotions**
   - Pattern: Different melodies (happy, sad, calm, excited)
   - Icon: Emoji faces with matching colors
   - Purpose: Emotional expression through music

2. **Simple 2-Tick Patterns**
   - Pattern: Two notes only
   - Icon: Large, simple shapes (circle, square)
   - Purpose: Reduce cognitive load

3. **Sensory Descriptors**
   - Pattern: Various timbres
   - Icon: Textures (smooth wave, spiky stars)
   - Purpose: Multi-sensory learning

**Impact**: Visual-first interface accommodates different learning styles, simplified patterns allow success at individual pace, emotional connection through customized content.

---

## Success Metrics

### Teacher Engagement
- **# of custom blocks created** per teacher (Target: 5+ in first month)
- **% of teachers** who create at least one block (Target: 60%)
- **Blocks shared** to community (Target: 20% of created blocks)
- **Time spent in editor** (Target: 15+ minutes per session)

### Student Learning Outcomes
- **Sequence completion rate** with custom vs. preset blocks
- **Time to complete activity** (should decrease with visual aids)
- **Student feedback** on block recognizability
- **Retention test scores** after lessons using custom blocks

### Community Growth
- **Community library size** (Target: 100+ blocks in 6 months)
- **Block downloads/imports** (Target: Average 10 imports per block)
- **Diversity of content** (# of cultural origins represented)

---

## Implementation Phases

### Phase 1: MVP (4-6 weeks)
**Goal**: Basic block editor for teachers

**Features**:
- ✅ Pattern editor for melody (piano roll)
- ✅ Simple color customization
- ✅ Local storage persistence
- ✅ Basic pixel art editor (24×24)
- ✅ Import/export JSON
- ❌ No beat/harmony editors yet
- ❌ No community sharing

**Deliverable**: Teachers can create and use custom melody blocks with simple icons

### Phase 2: Full Editor (6-8 weeks)
**Goal**: Complete editing capabilities

**Features**:
- ✅ Beat editor (drum grid)
- ✅ Harmony editor (chord timeline)
- ✅ Advanced pixel art (32×32, more tools)
- ✅ Difficulty tagging
- ✅ Improved metadata fields
- ❌ Still no backend/sharing

**Deliverable**: Teachers can create any type of block with full customization

### Phase 3: Community Library (8-10 weeks)
**Goal**: Enable sharing and collaboration

**Features**:
- ✅ User authentication (teacher accounts)
- ✅ Backend storage (database)
- ✅ Community library browser
- ✅ Search and filter
- ✅ Moderation tools
- ✅ QR code generation

**Deliverable**: Teachers can share blocks globally, discover others' creations

### Phase 4: Polish & Scale (Ongoing)
**Goal**: Refinement based on feedback

**Features**:
- ✅ Advanced pixel art tools (layers, symmetry)
- ✅ Block templates/themes
- ✅ Batch import/export
- ✅ Analytics dashboard
- ✅ Lesson plan integration
- ✅ Mobile-responsive editor

---

## Technical Challenges & Solutions

### Challenge 1: Canvas Performance with Many Custom Blocks
**Problem**: Rendering many 32×32 pixel art images on timeline may cause lag

**Solutions**:
- Pre-render pixel art to PNG on save
- Use CSS sprites for block icons
- Lazy load blocks outside viewport
- Cache rendered images in memory

### Challenge 2: Storage Limits
**Problem**: localStorage limited to 5MB, custom blocks + pixel art can exceed this

**Solutions**:
- Compress pixel art (PNG with tinify)
- Use IndexedDB (much larger quota)
- Implement selective sync (only active blocks in memory)
- Provide cloud storage for premium accounts

### Challenge 3: Pixel Art Editor Complexity
**Problem**: Building a full pixel editor is time-consuming

**Solutions**:
- Use existing library (e.g., react-pixel-art-editor)
- Start with minimal tools (pencil, eraser, fill)
- Add advanced features incrementally
- Provide templates to reduce from-scratch creation

### Challenge 4: Musical Pattern Validation
**Problem**: Teachers may create invalid or unplayable patterns

**Solutions**:
- Real-time preview during editing
- Validation rules (e.g., no gaps in pattern)
- Suggested fixes for common errors
- Tutorial videos and examples

---

## Accessibility Considerations

### Visual Accessibility
- **High Contrast Mode**: Ensure pixel art and patterns visible
- **Zoom Support**: All editors must support browser zoom
- **Color Blindness**: Provide alternative visual markers beyond color
- **Screen Reader**: ARIA labels for all tools and grid cells

### Motor Accessibility
- **Keyboard Navigation**: Full editor accessible via keyboard
- **Touch Support**: Larger touch targets for pixel art on mobile
- **Undo/Redo**: Forgiving editing with history
- **Snap to Grid**: Assist with precise pixel placement

### Cognitive Accessibility
- **Simple UI**: Minimize clutter, clear labels
- **Contextual Help**: Tooltips and inline guidance
- **Templates**: Pre-made patterns to modify
- **Progressive Disclosure**: Advanced features hidden until needed

---

## Future Enhancements

### Year 2 Features
1. **Collaborative Editing**: Multiple teachers co-create blocks
2. **Version History**: Restore previous versions of blocks
3. **Block Families**: Group related blocks (e.g., "Rhythmic Basics Set")
4. **Animation**: Animated pixel art (e.g., bouncing ball)
5. **Sound Effects**: Add non-musical sounds to blocks
6. **AI Assistance**: Generate patterns from hummed melody

### Integration Opportunities
1. **Learning Management Systems**: Export blocks to Google Classroom, Canvas
2. **Music Notation Software**: Import/export MusicXML
3. **Physical Blocks**: 3D-print blocks with QR codes for hybrid play
4. **Assessment Tools**: Track student progress with custom blocks

---

## Conclusion

The Block Editor with Pixel Art feature transforms MusicBlocks from a fixed curriculum tool into a **teacher-empowered creative platform**. By enabling educators to design custom blocks tailored to their students, cultural context, and pedagogical goals, we unlock:

✅ **Personalized Learning**: Content matches student needs
✅ **Cultural Inclusivity**: Authentic representation of diverse musical traditions
✅ **Visual Engagement**: Pixel art makes music concrete for visual learners
✅ **Teacher Agency**: Educators become content creators, not just consumers
✅ **Community Growth**: Shared library amplifies impact across classrooms globally

This feature positions MusicBlocks as the **leading customizable music education platform** for K-12 teachers worldwide.

---

## Appendix A: Musical Duration Reference

### Why 2-6 Ticks?

**Musical Context**:
- 1 tick = quarter note (in 4/4 time)
- 4 ticks = 1 measure
- Common time signature for education: 4/4

**Duration Rationale**:

| Ticks | Measures | Rationale | Example Use Cases |
|-------|----------|-----------|-------------------|
| 2 | 0.5 | Minimum viable pattern | Simple interval, basic rhythm |
| 3 | 0.75 | Odd meter feel | Waltz feel, triplet-based |
| 4 | 1.0 | One full measure (ideal) | Complete phrase, verse unit |
| 5 | 1.25 | Extended phrase | Complex polyrhythm |
| 6 | 1.5 | Maximum complexity | Advanced pattern, variation |

**Why not longer?**
- Blocks too long become unwieldy on timeline
- Harder to create interesting combinations
- Cognitive load for students increases
- UI/UX: Longer blocks harder to see on small screens

**Why not shorter?**
- Less than 2 ticks too simplistic
- Doesn't allow for meaningful musical expression
- Not enough room for pixel art to be recognizable

---

## Appendix B: Pixel Art Size Comparison

### 24×24 vs 32×32

**24×24 Pixels**:
- ✅ Smaller file size
- ✅ Faster rendering
- ✅ Good for simple icons
- ❌ Less detail possible
- ❌ Harder to read on high-DPI screens

**32×32 Pixels**:
- ✅ More detail possible
- ✅ Clearer on retina displays
- ✅ Standard icon size
- ❌ Larger file size (negligible)
- ❌ Slightly slower rendering (negligible)

**Recommendation**: Start with 32×32 for better quality, optimize later if needed.

---

## Appendix C: Color Palette Recommendations

### Default Palette (16 Colors)

**Primary Colors** (Musical Elements):
- 🎵 Melody Blue: `#4A90E2`
- 🥁 Beat Red: `#E94B3C`
- 🎹 Harmony Green: `#2ECC71`

**Accent Colors** (Visual Interest):
- Warm Yellow: `#FFE66D`
- Cool Cyan: `#4ECDC4`
- Purple: `#9B59B6`
- Orange: `#F39C12`
- Pink: `#FF6B9D`

**Grayscale** (Details):
- White: `#FFFFFF`
- Light Gray: `#BDC3C7`
- Medium Gray: `#7F8C8D`
- Dark Gray: `#34495E`
- Black: `#000000`

**Cultural Colors** (Customizable):
- Gold (Asian): `#FFD700`
- Terracotta (African): `#D4735E`
- Turquoise (Middle Eastern): `#40E0D0`

---

**END OF DOCUMENT**
