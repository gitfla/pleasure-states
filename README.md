# Pleasure States

**[pleasurestates.com](https://pleasurestates.com)** — Creative Strategy Consultancy

A bespoke, fully custom website built with vanilla JS, CSS, and GSAP. No framework, no build tool — just deliberate architecture and precise control over every detail.

---

## Stack

- **Vanilla JS (ES6+)** — no framework
- **GSAP 3.12.5** — animation engine
- **CSS custom properties** — design token system
- **Alte Haas Grotesk** — custom typeface (TTF, `font-display: swap`)
- **Vercel** — hosting, caching, www redirect

---

## Architecture

### Section-based scroll system

All sections are `position: fixed; width: 100vw; height: 100vh`, stacked via z-index. Scrolling triggers **clip-path transitions** — the current section is clipped away to reveal the next one underneath, GPU-accelerated via `inset()`.

```
Scroll down → clip bottom of current section upward (0 → vh over 1.2s)
Scroll up   → clip top of current section downward (0 → vh over 1.2s)
```

`ScrollController` acts as the central event bus. Each section registers `onEnter`, `onLeave`, and `onScrollAttempt` callbacks — sections never communicate directly.

### Modular grid

The layout is built on a **6×7 modular grid** derived from a 1728×1117px reference frame. All values scale fluidly using `clamp()` and `max()`:

```css
--cell-width:  clamp(120px, 14.18vw, 245px);  /* 245/1728 */
--cell-height: calc((100vh - 8 * var(--gutter)) / 7);
--gutter:      max(12px, 1.45vw);              /* uncapped on wide screens */
```

Three horizontal bands (32.7% | 32.7% | 31.4%) plus a 3.2% nav strip. Double gutters at band boundaries allow asymmetric content placement — 2-col video paired with 2-col text, etc.

### Two-tier viewport precision

iOS Safari dynamically shows/hides its toolbar, invalidating `100vh`. A two-tier system handles this:

1. **CSS baseline** — `dvh` units for layout fallback
2. **JS precision** — `visualViewport` API overwrites CSS vars with pixel-exact measurements

Critical fixed elements (splash, mobile menu) use the JS-precision tier.

### JS module structure

```
js/
├── main.js                   entry point, initialises in dependency order
├── scroll-controller.js      transition engine, boundary logic, state machine
├── menu.js                   desktop menu indicator animation
├── mobile-menu.js            slide-in drawer, social links
├── sections/
│   ├── splash.js             5-step GSAP timeline with image sizing
│   ├── what-we-believe.js    paragraph reveals
│   ├── what-we-do.js         scrollable text box with boundary detection
│   └── work-with-us.js       CTA button interactions
└── utils/
    ├── viewport.js           visualViewport precision layer
    ├── animation-helpers.js  reusable GSAP patterns (fade, reveal, type)
    ├── timing-constants.js   centralised animation durations
    └── video-loader.js       poster crossfade, autoplay retry
```

---

## Notable Details

**Splash image sizing** — the PLEASURE image is the anchor (100% column width). STATES scales to match its height. The tagline is then positioned to align its baseline with the image bottom. Two `requestAnimationFrame` calls ensure layout is settled before measurement.

**Scroll boundary detection** — in the "What We Do" section, a scrollable text box sits inside the locked section. `ScrollController` only triggers a section transition when the text box is at its top or bottom boundary, with a gesture snapshot taken at `touchstart` to prevent a single swipe from scrolling the text box *and* transitioning the section.

**CTA button reveal choreography** — the button lives at z-index 0 until the "Work with Us" section. On first transition, it's promoted to z-index 2 (just behind the current section being clipped away), so it's naturally uncovered by the wipe. After reveal it stays at z-index 100+.

**CTA button hover swap** — on desktop hover, "FOLLOW THE FEELING" cross-fades to three inline links (Email · Instagram · LinkedIn) via simultaneous CSS opacity transitions. The outer element is a `<div role="link">` to keep drag semantics separate from navigation.

**`mix-blend-mode: difference`** — the logo, menu, and CTA button all use blend mode to remain legible on any background without JS color-switching. White elements on dark sections appear white; the same elements on white sections invert to black automatically.

**Splash video variant** — an inline script (before `<body>`) selects a random splash video variant and sets the poster `src` synchronously, preventing any flash of a default image before render.

**Mobile video handling** — on mobile, section videos that aren't visible have their `src` stripped and `autoplay` removed to avoid unnecessary network requests. Videos resume on `visibilitychange` to handle iOS background suspension.

---

## CSS approach

Design tokens live in ~80 CSS custom properties in `:root`. All typographic and spatial values use `clamp()` for fluid scaling between a defined minimum and a reference-frame maximum:

```css
--font-size-h1:  clamp(60px, 6.83vw, 118px);
--button-height: clamp(40px, 3.96vw, 69px);   /* vw-based to maintain 7.5:1 width ratio */
```

`vw` is used for the button height (not `vh`) so the aspect ratio stays consistent regardless of window height — a deliberate choice to match a specific width:height proportion spec.

---

## Performance

- All scripts loaded with `defer`
- `font-display: swap` on both font weights
- Vercel config: 1-year cache on `resources/`, 1-week on `css/` and `js/`
- Video files: h264, `+faststart` flag (metadata at front for early playback)
- `overscroll-behavior: none` on `html` and `body` (prevents Android pull-to-refresh)
- Vercel Analytics (lightweight, no cookie banner required)
