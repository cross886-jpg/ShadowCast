---
name: Spanish 240 Shadowing Studio
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes a focused, reassuring, and distraction-free cognitive space engineered specifically for high-intensity vocal language acquisition. Targeting Korean-speaking learners working through Spanish foundational benchmarks (A1–A2), the visual experience prioritizes cognitive clarity over ornamental delight. 

Drawing from modern utilitarian ergonomics and institutional clarity, the interface employs crisp light backgrounds, distinct tonal zoning, and high-legibility visual markers. The emotional signature is calm, deliberate, and dependable: auditory playback triggers structured focus, while repetition phases provide immediate, affirming visual cues. The design system uses precise micro-spacing, balanced weights, and zero-latency visual hierarchies to keep learners anchored entirely in phonological training.

## Colors
The color architecture relies on a deterministic state machine calibrated for auditory shadowing cycles.

- **Primary (`#2563EB` - Royal Blue):** Anchors the core application chrome, navigation, active listening phases, wave/scrub indicators, and primary navigational actions. It denotes systematic accuracy and auditory focus.
- **Secondary (`#10B981` - Emerald Green):** Governs the active speaking interval, recording phase, mic activity meters, and shadowing progression markers. It signals output execution, cadence, and vocal validation.
- **Neutral (`#64748B` - Slate Neutral):** Provides balanced optical contrast for structural wireframes, secondary annotations, and inactive controls, fading into the perimeter to keep content central.
- **Surface & Canvas:** Canvas sits at `#F8FAFC`, transitioning to `#FFFFFF` for elevated audio card modules. High-contrast neutral ink (`#0F172A`) ensures uncompromised rendering across both Spanish diacritics and Korean typography.

## Typography
Typography is standardized on Inter across display, reading, and micro-interface layers. Inter's tall x-height, clear aperture structures, and robust Unicode coverage guarantee parity between complex Spanish diacritical glyphs (`á`, `é`, `í`, `ó`, `ú`, `ñ`, `¿`, `¡`) and Korean Hangul syllables.

- **Dual-Language Flow:** Spanish target sentences are rendered at `body-lg` (regular) or `headline-sm` (during active shadowing) with deliberate line-height buffering (`1.5` minimum) to prevent vertical collision with inverted punctuation (`¿`, `¡`). Korean translations and structural phoneme cues appear directly below in `body-sm` (`#64748B`), balancing visual priority.
- **Micro-Metrics:** Lesson trackers, playback rates (e.g., `0.8x`, `1.0x`), and sentence counts (`Sentence 14 / 240`) strictly leverage `label-md` and `label-sm` with tabular lining figures for zero visual jitter during audio timeline progression.

## Layout & Spacing
The layout model is mobile-first, relying on a centered single-column stack on handheld viewports and expanding to a bounded multi-column container on larger displays (maximum content width: 840px for shadowing suites, 1140px for library navigation).

- **Mobile Viewport (<640px):** 16px (`1rem`) outer canvas margins with 16px component-to-component vertical rhythm. Primary playback actions and speech response triggers pin to a persistent, tactile bottom sheet dock.
- **Tablet / Desktop (≥640px):** Expands to 24px–32px canvas margins. Card padding scales to `space-xl` (`2rem`) to maximize focus around the target speech card.
- **Rhythmic Gaps:** Structural metadata utilizes `space-xs` and `space-sm`. Sentence comparisons (Spanish master text vs. Korean translation) use `space-sm` for optical cohesion, while distinct training controls separate by `space-lg`.

## Elevation & Depth
Visual hierarchy relies on structural tonal separation rather than heavy physical drops, preserving visual cleanliness during repetitive vocal drills.

- **Level 0 (Canvas Base):** Flat `#F8FAFC` foundation with zero shadow.
- **Level 1 (Card & Study Blocks):** Crisp pure white (`#FFFFFF`) surfaces defined by a 1px border of `#E2E8F0` and an ambient, low-opacity drop: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Active Phase Focus & Hovered Cards):** Used when a sentence block enters the active audio/recording cycle. Elevated with `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04)` alongside dynamic border highlighting (`#2563EB` for listening, `#10B981` for shadowing/speaking).
- **Level 3 (Floating Audio Dock & Drawers):** High-priority fixed playback controls sit elevated at `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` over a subtle `backdrop-filter: blur(8px)`.

## Shapes
A roundedness factor of 2 provides a balanced, approachable, yet rigorous physical form factor.

- **Base Elements (`0.5rem` / `8px`):** Applied uniformly to inputs, audio speed selectors, badges, micro chips, and secondary interaction cells.
- **Cards & Modal Layers (`1rem` / `16px`):** Target sentence containers, progress review dashboards, and floating bottom docks employ `rounded-lg` for friendly ergonomics in touch environments.
- **Pill Formats:** Dedicated purely to persistent state badges (e.g., `Escuchando` / `듣기`, `Hablando` / `말하기`), circular play/pause triggers, and scrubber handles.

## Components

### Buttons
- **Primary Audio CTA:** Solid `#2563EB` background with white text, 48px minimum touch height on mobile, `rounded-md` (8px), using `label-lg`. During the active speaking phase, the action button dynamically morphs into `#10B981`.
- **Secondary Actions:** White background, 1px border `#E2E8F0`, `#0F172A` text, hover/active state tinted with `#F1F5F9`.
- **Micro-Controls:** Icon buttons (playback speed, step back 5s, loop single sentence) use `space-sm` padding, subtle borders, and 40x40px tap bounding boxes.

### Sentence Study Cards
The focal container of the studio. Built with pure white surfaces, 1px border `#E2E8F0`, and `rounded-lg`. Displays the unit index (`042 / 240`) in `label-sm` (`#64748B`), the primary Spanish prompt in `headline-sm` (`#0F172A`), followed by the Korean contextual guide in `body-sm` (`#475569`). When engaged, the left border is accented with a 4px indicator strip matching the active phase: `#2563EB` for listening playback, `#10B981` for learner mic response.

### Chips & Phase Indicators
Compact badges rendered with `rounded-full` and `space-xs` vertical, `space-sm` horizontal padding. 
- *Listening Chip:* Soft blue background (`#EFF6FF`), text `#1D4ED8`.
- *Speaking/Shadowing Chip:* Soft emerald background (`#ECFDF5`), text `#047857`.
- *Level Flag:* Slate outline (`#E2E8F0`), text `#475569` displaying CEFR level (`A1`, `A2`).

### Input Fields & Controls
Pitch and speed sliders, search filters, and reflection textareas utilize 1px `#CBD5E1` borders, pure white surfaces, and 8px radii. Focus states cast an electric `#2563EB` ring at 2px spread, 0px offset.

### Audio Waveform & Speech Progress Scrubber
A horizontal dual-color linear track: the background track sits at `#E2E8F0`, filled with `#2563EB` during the source speaker's audio timeline and instantly converting to a pulsing `#10B981` track during the configured repetition/pause window.