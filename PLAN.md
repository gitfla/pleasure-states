# Pleasure States - Interactive Website Plan

## Executive Summary

A full-screen, section-based narrative website featuring a sophisticated **mask-lifting scroll effect** where each section slides up to cover the previous one, creating a layered storytelling experience. Built with vanilla JavaScript and GSAP for maximum control and performance.

---

## Table of Contents

1. [Implementation Status](#implementation-status) ⭐ **START HERE**
2. [User Experience Vision](#user-experience-vision)
3. [Technical Architecture](#technical-architecture)
4. [The Mask-Lifting Scroll Effect](#the-mask-lifting-scroll-effect)
5. [Section-by-Section Breakdown](#section-by-section-breakdown)
6. [Interaction Design Decisions](#interaction-design-decisions)
7. [Code Architecture](#code-architecture)
8. [Animation Philosophy](#animation-philosophy)
9. [Future Enhancements](#future-enhancements)

---

## Implementation Status

**Current Phase:** MVP Phase 2 - Testing Complete ✅
**Last Updated:** March 10, 2026
**Hours Invested:** ~8 hours
**Next Up:** Content Updates from Figma Design

### MVP Phase 1: Core Foundation ✅ COMPLETE

#### File Structure & Setup
- [x] Create project directory structure
- [x] Set up CSS modular architecture (reset, variables, layout, sections, components)
- [x] Set up JavaScript modular architecture (main, controller, sections, utils)
- [x] Create HTML structure with 4 sections

#### CSS Implementation
- [x] Implement CSS reset and normalize
- [x] Create CSS variables (colors, typography, z-indexes, timing)
- [x] Build base layout system (Grid)
- [x] Implement **mask-lifting scroll effect** (fixed positioning + z-index stacking)
- [x] Create animated gradient placeholders (replacing videos for MVP)
- [x] Style splash section
- [x] Style philosophy section
- [x] Style what-we-do section
- [x] Style contact section
- [x] Implement menu component styles

#### JavaScript Core
- [x] Build ScrollController (master orchestrator)
- [x] Implement scroll event handling (wheel + touch)
- [x] Implement scroll debouncing (150ms)
- [x] Implement touch threshold (50px minimum swipe)
- [x] Build section registration system (callbacks)
- [x] **Implement mask-lifting transitions** (slide up/down with GSAP)
- [x] Fix initialization timing bug (separated init() and start())
- [x] Add comprehensive debugging logs

#### Section Animations
- [x] Splash: Sequential text reveals (3 lines)
- [x] Splash: Auto-advance after completion
- [x] Splash: Scroll blocking implementation
- [x] Philosophy: Sequential paragraph reveals (4 paragraphs)
- [x] Philosophy: Scroll interruption logic
- [x] Philosophy: Auto-advance after completion
- [x] What We Do: Typing effect (30 chars/second)
- [x] What We Do: Text box auto-scroll
- [x] What We Do: Scroll interruption with fade-out
- [x] Contact: Sequential element reveals
- [x] Contact: No auto-advance (terminal section)

#### Navigation & Interaction
- [x] Menu component (top-right, 3 buttons)
- [x] Menu click navigation to sections
- [x] Bidirectional navigation (forward and backward)
- [x] Animation helpers utility module
- [x] Video loader utility module (prepared for Phase 3)

### MVP Phase 2: Testing & Bug Fixes ✅ COMPLETE

#### Testing & Bug Fixes
- [x] **Test splash screen animations work** - VERIFIED
- [x] **Test mask-lifting effect forward navigation** - VERIFIED
- [x] **Test mask-lifting effect backward navigation** - VERIFIED
- [x] **Fix menu visibility** - Menu hidden on splash, visible from philosophy onwards
- [x] **Fix scroll sensitivity** - Increased debounce to 300ms, fixed race condition
- [x] **Fix menu navigation accuracy** - Added gsap.set() to reset positions before animations
- [x] **Fix typing animation opacity** - Reset opacity to 1 when starting typing after interrupt
- [x] Test philosophy scroll interruption - WORKING
- [x] Test what-we-do typing effect - WORKING
- [x] Test what-we-do scroll interruption - WORKING
- [x] Test menu navigation to all sections - WORKING
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

#### Animation Refinements
- [x] Verify all easing feels consistent - power2.inOut throughout
- [x] Test animation performance (60fps target) - Smooth on desktop
- [x] Verify no animation jank during transitions - Smooth with fixes
- [ ] Mobile performance testing needed

#### Content & Polish
- [ ] Replace placeholder text with Figma content (NEXT)
- [ ] Update menu item names from Figma design (NEXT)
- [ ] Adjust typography sizes for readability
- [ ] Fine-tune spacing and padding
- [ ] Add any missing visual polish

### MVP Phase 3: Videos & Responsiveness ⏸️ NOT STARTED

#### Video Integration
- [ ] Prepare video files (compress, optimize)
- [ ] Convert videos to WebM (VP9) format
- [ ] Convert videos to MP4 (H.264) fallback format
- [ ] Replace CSS gradients with actual `<video>` elements
- [ ] Implement lazy loading (Intersection Observer)
- [ ] Test video playback in all sections
- [ ] Implement video pause on section leave
- [ ] Test video performance (memory usage)
- [ ] Optimize video file sizes (<5MB each)

#### Mobile Responsiveness
- [ ] Implement mobile CSS breakpoints (768px, 480px)
- [ ] Stack columns vertically on mobile
- [ ] Adjust section heights for mobile
- [ ] Test touch scrolling on real devices (iOS, Android)
- [ ] Adjust touch threshold if needed
- [ ] Simplify animations for mobile (reduce stagger delays)
- [ ] Hide background videos on mobile (performance)
- [ ] Test menu usability on small screens
- [ ] Implement mobile-specific typography sizes

### Phase 4: Accessibility & SEO ⏸️ NOT STARTED

#### Accessibility
- [ ] Add ARIA labels to navigation buttons
- [ ] Add ARIA live regions for section changes
- [ ] Implement keyboard navigation (arrow keys)
- [ ] Add focus management on section transitions
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Add skip links for screen readers
- [ ] Implement reduced motion media query support
- [ ] Ensure sufficient color contrast (WCAG AA)
- [ ] Add alt text to any images/videos

#### SEO & Performance
- [ ] Add meta tags (description, Open Graph)
- [ ] Implement URL hash updates for deep linking
- [ ] Add canonical URL
- [ ] Optimize initial page load (defer non-critical JS)
- [ ] Run Lighthouse audit (target 90+ performance)
- [ ] Implement lazy loading for below-fold content
- [ ] Add structured data (JSON-LD)

### Phase 5: Analytics & Advanced Features ⏸️ NOT STARTED

#### Analytics
- [ ] Implement analytics tracking (Plausible/GA4)
- [ ] Track section views
- [ ] Track animation interruptions (user patience metric)
- [ ] Track menu clicks
- [ ] Track scroll direction patterns
- [ ] Track time spent per section
- [ ] Track bounce rate from splash screen

#### Advanced Features
- [ ] Add browser back button support (history.pushState)
- [ ] Implement deep linking (URL hash → section)
- [ ] Add social share buttons
- [ ] Implement custom cursor (optional)
- [ ] Add preloader/loading screen
- [ ] Implement smooth scroll on browser resize

---

### Known Issues & Blockers

**Currently No Blockers** ✅

#### Recently Fixed (March 10, 2026)
- ✅ **Splash screen not animating** - Fixed initialization timing (separated init/start)
- ✅ **No mask-lifting effect** - Implemented fixed positioning + z-index + GSAP transforms
- ✅ **Menu showing on splash** - Added CSS opacity controls + updateMenuVisibility() method
- ✅ **Scroll sensitivity too high** - Increased debounce from 150ms to 300ms + fixed race condition in handleScrollAttempt()
- ✅ **Menu navigation to wrong sections** - Added gsap.set() to reset section positions before animations
- ✅ **Typing animation invisible after scroll** - Added opacity reset in startTyping() (was stuck at 0 from fade-out)

#### Bug Fix Details

**Scroll Sensitivity Fix (scroll-controller.js:130-155)**
- **Problem:** Race condition where `isTransitioning` was set before `goToSection()` was called, causing immediate exit
- **Solution:** Removed premature flag setting in `handleScrollAttempt()`, let `goToSection()` handle it properly
- **Result:** Multiple rapid scroll events now properly blocked with "transition in progress" and "debounced" messages

**Typing Animation Opacity Fix (what-we-do.js:40)**
- **Problem:** When scrolling interrupted typing, `onScrollAttempt()` faded text to opacity: 0, but `startTyping()` never reset it
- **Solution:** Added `gsap.set(typingContainer, { opacity: 1 })` at start of typing
- **Result:** Typing now visible when manually scrolling to "What We Do" section

**Menu Navigation Fix (scroll-controller.js:196-217)**
- **Problem:** Jumping non-sequentially left sections with leftover transforms from previous navigations
- **Solution:** Added `gsap.set()` calls before animations to reset positions
- **Result:** Menu clicks now reliably go to correct section

#### To Investigate
- ⚠️ **iOS Safari viewport height** - May need 100svh instead of 100vh
- ⚠️ **Video autoplay policies** - Need to test on real devices
- ⏸️ **Figma plugin access** - Need to resolve plugin installation to fetch design specs

---

## User Experience Vision

### Core Concept
The website presents a **linear narrative journey** through four distinct experiences. Users progress through the story at their own pace, with animations that respond to their behavior. The mask-lifting scroll creates a sense of **revealing new layers** rather than traditional scrolling.

### Design Principles

1. **Minimal Distraction**: Full-screen sections, no visible scrollbars, clean interface
2. **Responsive Narrative**: Animations pause/interrupt when users scroll, respecting their desire to move forward
3. **Tactile Feedback**: Each interaction feels intentional and smooth
4. **Visual Hierarchy**: Later sections literally cover earlier ones, emphasizing forward progression

### User Flow

```
SPLASH (locked)
  → watches 3 text lines appear
  → auto-advances after completion
  ↓
PHILOSOPHY (interruptible)
  → watches paragraphs reveal OR scrolls to skip
  → auto-advances or user scrolls
  ↓
WHAT WE DO (interruptible)
  → watches typing effect OR scrolls to skip
  → text fades, section advances
  ↓
CONTACT (final destination)
  → no auto-advance
  → can scroll back up to explore previous sections
```

---

## Technical Architecture

### Tech Stack Decision

**Chosen:** Vanilla HTML/CSS/JavaScript + GSAP

**Why:**
- Full control over scroll behavior (no framework overhead)
- GSAP provides professional-grade animation performance
- Simple enough for intermediate developers to maintain
- No build process required
- Fast load times

**Rejected Alternatives:**
- ❌ **React/Next.js**: Overkill for a linear narrative site
- ❌ **Scroll libraries (fullpage.js)**: Too opinionated, can't achieve mask-lifting effect
- ❌ **Pure CSS**: Can't handle complex interruption logic

### File Structure

```
/pleasure-states/
├── index.html                 # Single-page structure
├── css/
│   ├── reset.css             # Normalize browser defaults
│   ├── variables.css         # Design tokens (colors, timing, z-indexes)
│   ├── layout.css            # Grid system + mask-lifting positioning
│   ├── sections/             # Section-specific styles
│   │   ├── splash.css
│   │   ├── philosophy.css
│   │   ├── what-we-do.css
│   │   └── contact.css
│   ├── components/
│   │   ├── menu.css          # Top-right navigation
│   │   └── typography.css
│   └── responsive.css        # Mobile breakpoints
├── js/
│   ├── main.js               # Initialization orchestrator
│   ├── scroll-controller.js  # Master scroll logic
│   ├── sections/             # Section-specific behaviors
│   │   ├── splash.js
│   │   ├── philosophy.js
│   │   ├── what-we-do.js
│   │   └── contact.js
│   ├── utils/
│   │   ├── video-loader.js   # Lazy loading videos
│   │   └── animation-helpers.js  # Reusable GSAP patterns
│   └── menu.js               # Navigation clicks
└── assets/
    └── videos/               # Optimized video files
```

---

## The Mask-Lifting Scroll Effect

### What Is It?

Instead of traditional scrolling where content moves up/down, **sections slide vertically like sheets of paper** being placed on top of each other. The next section slides up from the bottom and covers the current section.

**Reference:** https://www.linousoumpasis.gr/

### Technical Implementation

#### CSS Foundation

All sections are positioned **fixed** at the same viewport location with **z-index stacking**:

```css
/* layout.css */

.section {
    position: fixed;    /* All sections occupy same space */
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

/* Z-index creates stacking order */
#splash {
    z-index: 10;
    /* Starts visible */
}

#philosophy {
    z-index: 20;
    transform: translateY(100%);  /* Starts off-screen below */
}

#what-we-do {
    z-index: 30;
    transform: translateY(100%);
}

#contact {
    z-index: 40;
    transform: translateY(100%);
}
```

**Key Decision:** Using `transform: translateY()` instead of `top` property because:
- Hardware-accelerated (GPU-based)
- Smoother animations (60fps)
- Better performance on mobile
- GSAP optimizes transforms automatically

#### JavaScript Animation

The mask-lifting animation is controlled in `scroll-controller.js`:

```javascript
goToSection(targetIndex, immediate = false) {
    const currentSectionData = this.sections[this.currentSection];
    const targetSectionData = this.sections[targetIndex];
    const direction = targetIndex > this.currentSection ? 'down' : 'up';

    if (direction === 'down') {
        // FORWARD: Next section slides UP from bottom
        gsap.fromTo(targetSectionData.element,
            { y: '100%' },  // Start: off-screen below viewport
            {
                y: '0%',    // End: covers current section
                duration: 1.2,
                ease: 'power2.inOut'
            }
        );
    } else {
        // BACKWARD: Current section slides DOWN to reveal previous
        gsap.to(currentSectionData.element, {
            y: '100%',      // Slide down off-screen
            duration: 1.2,
            ease: 'power2.inOut'
        });
    }
}
```

**Why This Works:**

1. **Z-index determines visibility**: Philosophy (z:20) will always appear above Splash (z:10)
2. **Transform doesn't affect layout**: Sections stay in DOM position, only visual position changes
3. **Bidirectional**: Forward (slide up) and backward (slide down) feel natural
4. **No page scroll**: Browser scroll position never changes

### How It Affects User Experience

**Visual Impact:**
- Creates a **sense of depth and layers**
- Feels like peeling back pages of a book
- Each section "earns" its space by covering the previous

**Interaction Benefits:**
- **Smooth and predictable**: Users know exactly what to expect
- **Reversible**: Can scroll back up to reveal previous sections
- **Menu navigation**: Jumping to any section feels intentional (slides appropriately)

**Performance Characteristics:**
- No reflow/repaint from scroll position changes
- GPU-accelerated transforms
- Smooth 60fps animations even with videos playing

---

## Section-by-Section Breakdown

### Section 1: Splash Screen

**Purpose:** First impression, set the tone, introduce the brand

**Visual Design:**
- Two columns: 1/3 animated gradient, 2/3 text
- Three headline texts appear sequentially
- Minimalist, high-contrast

**Behavior:**

```javascript
// splash.js

playAnimation() {
    const timeline = gsap.timeline({
        onComplete: () => this.onAnimationComplete()
    });

    // Line 1: "Experience the moment"
    timeline.fromTo(lines[0],
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }
    );

    // Line 2: "Discover new possibilities" (0.5s delay)
    timeline.fromTo(lines[1],
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, ease: 'power2.out' },
        '+=0.5'
    );

    // Line 3: "Welcome to Pleasure States" (0.5s delay)
    timeline.fromTo(lines[2],
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, ease: 'power2.out' },
        '+=0.5'
    );
}

onAnimationComplete() {
    // Wait 1 second, then advance
    setTimeout(() => {
        ScrollController.unlockScroll();     // Allow user interaction
        ScrollController.advanceToNext();    // Slide to Philosophy
    }, 1000);
}
```

**UX Decision: Scroll Blocking**

```javascript
// User CANNOT scroll during splash
this.isScrollBlocked = true;

// Wheel/touch events are ignored
if (this.isScrollBlocked) {
    e.preventDefault();
    return;
}
```

**Why:** Forces users to watch the opening sequence, establishing the narrative pacing. Menu navigation still works as an escape hatch.

**Total Duration:** ~3.5 seconds (1s + 1s + 1s + 0.5s delays + 1s after)

---

### Section 2: Philosophy

**Purpose:** Explain the brand's values through progressive revelation

**Visual Design:**
- Three columns: text (1/3), two gradient backgrounds (2/3)
- Four paragraphs revealed one by one
- Dark background with bright text

**Behavior:**

```javascript
// philosophy.js

animateParagraphs() {
    this.isAnimating = true;
    const paragraphs = document.querySelectorAll('.philosophy-paragraph');

    this.timeline = gsap.timeline({
        onComplete: () => this.onAnimationComplete()
    });

    paragraphs.forEach((p, index) => {
        this.timeline.fromTo(p,
            { opacity: 0, y: 20 },      // Start slightly below
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
            index === 0 ? 0 : '+=0.6'   // 0.6s between paragraphs
        );
    });
}

onScrollAttempt(direction) {
    if (this.isAnimating) {
        // User interrupted animation - stop immediately
        this.stopAnimation();
        // Scroll controller handles navigation
    }
}
```

**UX Decision: Interruptible Animation**

**Scenario A - Patient User:**
1. Watches paragraph 1 appear (0.8s)
2. Waits 0.6s
3. Watches paragraph 2 appear (0.8s)
4. ... continues through all 4 paragraphs
5. After 0.8s delay, auto-advances to "What We Do"

**Scenario B - Impatient User:**
1. Starts watching animations
2. Scrolls wheel at any point
3. Animations **immediately stop**
4. Philosophy section slides up, "What We Do" covers it

**Why This Matters:**
- Respects user agency (they control pacing)
- Doesn't trap users in slow animations
- Still allows full experience for those who want it
- Creates two valid interaction patterns

---

### Section 3: What We Do

**Purpose:** Demonstrate capability through dynamic typing effect

**Visual Design:**
- Three columns: gradient (1/3), overlapping gradient + text box (2/3)
- White text box with transparency floats over background
- Typing effect shows text appearing character-by-character

**Behavior:**

```javascript
// what-we-do.js

startTyping() {
    this.isTyping = true;
    const chars = this.textContent.split('');
    const charsPerSecond = 30;  // Typing speed
    const delayPerChar = 1 / charsPerSecond;

    this.typingTimeline = gsap.timeline({
        onComplete: () => this.onTypingComplete()
    });

    let currentText = '';

    chars.forEach((char, index) => {
        this.typingTimeline.call(() => {
            currentText += char;
            typingContainer.textContent = currentText;

            // Auto-scroll text box when content overflows
            if (typingContainer.scrollHeight > textBox.clientHeight) {
                textBox.scrollTop = typingContainer.scrollHeight - textBox.clientHeight;
            }
        }, [], delayPerChar * index);
    });
}

onScrollAttempt(direction) {
    if (this.isTyping) {
        this.stopTyping();

        // Fade out text gracefully before transitioning
        gsap.to(typingContainer, {
            opacity: 0,
            duration: 0.3
        });
    }
}
```

**UX Decision: Internal Scrolling**

The text box has **its own scroll behavior** independent of page navigation:

```css
.what-we-do-text-box {
    height: 60vh;           /* Fixed height */
    overflow-y: auto;       /* Can scroll internally */
    padding: 2rem;
}
```

**Why:**
- Creates a **"content within content"** effect
- Text box feels like a window into more information
- Users see typing happen live, then watch box scroll automatically
- Adds visual interest (movement within the section)

**Typing Speed Calculation:**

```
30 characters/second = 33ms per character
~500 character text = ~16.6 seconds total
```

**User Experience:**
1. Section slides up to cover Philosophy
2. Typing starts immediately: "We craft experiences..."
3. Text accumulates, box scrolls down automatically
4. User can either:
   - **Watch entire typing** (~17s) → auto-advances
   - **Scroll at any time** → typing stops, text fades, advances

---

### Section 4: Contact

**Purpose:** Final destination, call-to-action

**Visual Design:**
- Three columns with centered text in middle
- Clean, minimal
- Call-to-action button

**Behavior:**

```javascript
// contact.js

animateElements() {
    const elements = document.querySelectorAll('.contact-line');

    this.timeline = gsap.timeline();

    elements.forEach((el, index) => {
        this.timeline.fromTo(el,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
            index === 0 ? 0 : '+=0.4'  // Faster stagger (0.4s)
        );
    });
}
```

**UX Decision: No Auto-Advance**

```javascript
data-auto-advance="false"
```

**Why:**
- **Terminal section**: Nowhere to go next
- Users can **scroll back up** freely to revisit sections
- CTA needs user attention (email link, button)
- Provides closure to the narrative

---

## Interaction Design Decisions

### 1. Scroll Blocking Strategy

**Decision:** Only block scroll on Splash, allow on all other sections

```javascript
// Splash: locked
data-scroll-blocking="true"
this.isScrollBlocked = true;

// All others: interruptible
data-scroll-blocking="false"
this.isScrollBlocked = false;
```

**Impact:**
- **First impression controlled**: Users must see opening
- **Rest of experience flexible**: Users control their pace
- **Menu always works**: Even during splash, menu provides escape

### 2. Wheel Event Debouncing

**Problem:** Mouse wheels can fire 10-20 events per second, causing jittery transitions

**Solution:**

```javascript
const wheelDebounceDelay = 150; // ms
let lastWheelTime = 0;

window.addEventListener('wheel', (e) => {
    const now = Date.now();

    // Ignore rapid events
    if (now - lastWheelTime < wheelDebounceDelay) {
        e.preventDefault();
        return;
    }

    lastWheelTime = now;
    const direction = e.deltaY > 0 ? 1 : -1;
    this.handleScrollAttempt(direction);
}, { passive: false });
```

**Impact:**
- Prevents accidental double-scrolls
- Makes transitions feel **deliberate**
- Better user control (one scroll = one section change)

### 3. Touch Event Threshold

**Problem:** Small finger movements shouldn't trigger full section changes on mobile

**Solution:**

```javascript
const snapThreshold = 50; // pixels

window.addEventListener('touchmove', (e) => {
    const touchEndY = e.touches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    // Only trigger if swipe is significant
    if (Math.abs(deltaY) > snapThreshold && !touchMoved) {
        touchMoved = true;
        const direction = deltaY > 0 ? 1 : -1;
        this.handleScrollAttempt(direction);
    }
}, { passive: false });
```

**Impact:**
- **50px minimum swipe** prevents accidental transitions
- Natural mobile interaction
- Feels responsive but not twitchy

### 4. Animation Interruption Philosophy

**Decision:** All animations (except splash) can be interrupted

**Implementation:**

```javascript
onScrollAttempt(direction) {
    if (this.isAnimating) {
        // Kill timeline immediately
        if (this.timeline) {
            this.timeline.kill();
            this.isAnimating = false;
        }
    }
}
```

**Why:**
- **User agency**: They control the pace
- **No frustration**: Can skip slow animations
- **Respect time**: Fast users aren't punished
- **Discoverable**: Slow users discover full animations naturally

### 5. Z-Index Architecture

**Decision:** Use predictable, spaced z-index values

```css
#splash     { z-index: 10; }   /* Base layer */
#philosophy { z-index: 20; }   /* +10 */
#what-we-do { z-index: 30; }   /* +10 */
#contact    { z-index: 40; }   /* +10 */
```

**Why +10 increments:**
- Room for future layers (e.g., modals at z:15, overlays at z:25)
- Clear visual hierarchy
- Easy to debug in DevTools
- Follows common CSS architecture patterns

---

## Code Architecture

### Module Communication Pattern

**Chosen:** Event-driven callbacks via registration pattern

```javascript
// scroll-controller.js manages state
const ScrollController = {
    sections: [],
    currentSection: 0,

    registerSection(id, callbacks) {
        const section = this.sections.find(s => s.id === id);
        section.onEnter = callbacks.onEnter;
        section.onLeave = callbacks.onLeave;
        section.onScrollAttempt = callbacks.onScrollAttempt;
    }
};

// splash.js registers its behavior
SplashSection.init() {
    ScrollController.registerSection('splash', {
        onEnter: () => this.playAnimation(),
        onLeave: () => this.cleanup(),
        onScrollAttempt: () => { /* blocked */ }
    });
}
```

**Why This Pattern:**
- **Decoupled**: Sections don't know about scroll controller internals
- **Testable**: Can test sections independently
- **Extensible**: Easy to add new sections
- **Clear lifecycle**: Enter/Leave/ScrollAttempt covers all states

### Initialization Sequence

**Critical:** Order matters!

```javascript
// main.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize controller (caches sections, sets up listeners)
    ScrollController.init();

    // 2. Sections register callbacks
    SplashSection.init();
    PhilosophySection.init();
    WhatWeDoSection.init();
    ContactSection.init();

    // 3. Menu setup
    MenuController.init();

    // 4. Start experience (triggers splash animation)
    ScrollController.start();
});
```

**Why This Order:**
1. Controller needs to cache DOM elements first
2. Sections register before start() is called
3. Menu uses controller's goToSection() API
4. start() triggers splash animation when all callbacks are registered

---

## Animation Philosophy

### GSAP Timeline Benefits

**Decision:** Use GSAP timelines instead of CSS animations

```javascript
// Sequential animations with timeline
this.timeline = gsap.timeline();

timeline.fromTo(element1, {...}, {...});
timeline.fromTo(element2, {...}, {...}, '+=0.5');  // 0.5s after previous
timeline.fromTo(element3, {...}, {...}, '+=0.5');
```

**Why:**
- **Sequencing**: Easy to chain animations
- **Control**: Can pause, reverse, kill timelines
- **Performance**: Hardware-accelerated transforms
- **Callbacks**: onStart, onComplete, onUpdate hooks
- **Interruption**: `.kill()` stops everything cleanly

### Easing Choices

```javascript
// Used throughout: 'power2.inOut'
ease: 'power2.inOut'
```

**Why power2.inOut:**
- Starts slow, accelerates, ends slow
- Natural-feeling motion (matches physics)
- Not too aggressive (power3/4 feel robotic)
- Consistent across all animations (cohesive feel)

### Transform vs. Position

**Decision:** Always use `transform` for movement

```css
/* ❌ Bad: Causes reflow */
.section { top: 100vh; }

/* ✅ Good: GPU accelerated */
.section { transform: translateY(100%); }
```

**Performance Impact:**
- `transform` runs on GPU (compositing layer)
- `top/left` triggers layout recalculation
- 60fps vs. choppy 30fps animations
- Especially critical with videos playing

---

## Future Enhancements

### Phase 2: Real Videos

Replace CSS gradients with actual video files:

```html
<video class="section-video" autoplay muted loop playsinline>
    <source src="assets/videos/splash.webm" type="video/webm">
    <source src="assets/videos/splash.mp4" type="video/mp4">
</video>
```

**Optimization Strategy:**
- WebM (VP9) primary format
- MP4 (H.264) fallback
- 1-2 Mbps bitrate
- 2-5 MB per video
- Lazy load via Intersection Observer

### Phase 3: Mobile Responsiveness

```css
@media (max-width: 768px) {
    /* Stack columns vertically */
    .splash-grid,
    .philosophy-grid,
    .what-we-do-grid,
    .contact-grid {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
    }

    /* Adjust heights */
    .splash-video-container { height: 40vh; }
    .splash-text-container { height: 60vh; }
}
```

**Mobile Interaction Changes:**
- Touch swipe with 50px threshold (already implemented)
- Simplified animations (reduce stagger delays)
- Hide background videos (performance)

### Phase 4: Accessibility

```javascript
// URL hash updates for deep linking
goToSection(targetIndex) {
    // ... animation code ...
    window.location.hash = this.sections[targetIndex].id;
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') ScrollController.advanceToNext();
    if (e.key === 'ArrowUp') ScrollController.goToPrevious();
});
```

**Accessibility Checklist:**
- ARIA live regions for section changes
- Skip links for screen readers
- Keyboard navigation (arrow keys)
- Focus management on section change
- Reduced motion media query support

### Phase 5: Analytics

Track user behavior to understand engagement:

```javascript
// Track section views
onEnter() {
    analytics.track('Section Viewed', {
        section: this.id,
        timestamp: Date.now()
    });
}

// Track interruptions (reveals user patience)
onScrollAttempt() {
    if (this.isAnimating) {
        analytics.track('Animation Interrupted', {
            section: this.id,
            percentComplete: this.timeline.progress()
        });
    }
}
```

---

## Technical Constraints & Limitations

### Current Limitations

1. **No Browser Back Button Support**
   - Sections don't update URL history
   - Back button exits site instead of previous section
   - **Solution:** Could use `history.pushState()` with hash fragments

2. **No Deep Linking**
   - Can't share URL to specific section
   - Always starts at splash
   - **Solution:** Read URL hash on load, `goToSection()` accordingly

3. **No Mobile Testing Yet**
   - Touch interactions untested on real devices
   - May need tweaks for iOS Safari
   - **Solution:** Test on real devices, adjust thresholds

4. **Fixed Viewport Assumption**
   - Assumes 100vh = actual viewport height
   - iOS Safari URL bar can cause issues
   - **Solution:** Use `100svh` (small viewport height) for mobile

### Browser Support

**Target:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+

**Known Issues:**
- Safari < 14: May not support VP9 WebM (use MP4 fallback)
- iOS requires `playsinline` attribute for inline video
- Firefox has slightly different wheel event behavior (debouncing handles this)

---

## Performance Considerations

### Animation Budget

**Target:** 60fps (16.67ms per frame)

**Optimizations:**
1. **GPU-accelerated transforms only**
2. **Lazy load videos** (load when section becomes visible)
3. **Kill timelines on leave** (free memory)
4. **Debounce wheel events** (reduce JS execution)
5. **Use `will-change` sparingly** (only during transitions)

### Memory Management

```javascript
onLeave() {
    // Always cleanup animations
    if (this.timeline) {
        this.timeline.kill();
        this.timeline = null;
    }

    // Pause videos to free memory
    VideoLoader.pauseVideos(this.element);
}
```

---

## Conclusion

This website combines modern animation techniques with thoughtful interaction design to create an immersive narrative experience. The mask-lifting scroll effect provides a unique visual identity while maintaining intuitive user control.

**Key Success Factors:**
1. ✅ Fixed positioning + z-index for layered sections
2. ✅ GSAP for professional-grade animations
3. ✅ Interruptible animations respect user agency
4. ✅ Debounced scroll events prevent jank
5. ✅ Modular architecture enables easy maintenance

**Development Time:** 12-16 hours (MVP with full interactions)

**Complexity Level:** Intermediate (requires understanding of GSAP, event handling, CSS positioning)

---

## Current Session Status (March 10, 2026)

### Completed This Session
1. ✅ Fixed scroll sensitivity (race condition bug)
2. ✅ Fixed typing animation invisibility (opacity reset bug)
3. ✅ Fixed menu navigation accuracy (position reset bug)
4. ✅ All core functionality tested and working
5. ✅ Updated PLAN.md with comprehensive bug fix documentation

### Next Steps
1. **Figma Design Integration** - User has Figma design at: https://www.figma.com/design/O1e2dawOftAuA4AhOELPjt/Pleasure-States---WEBSITE?node-id=226-176
   - Install Figma plugin successfully
   - Extract menu item names (user mentioned "What we believe" but message was cut off)
   - Extract content for all sections
   - Update colors, typography, spacing to match design

2. **Content Updates** - Replace all placeholder text with final content from Figma

3. **Mobile Testing** - Test on real devices and adjust responsive breakpoints

### Files Modified This Session
- `/Users/fla/Documents/coding/pleasure-states/js/scroll-controller.js` - Fixed race condition in handleScrollAttempt, added position resets in goToSection, added debug logging
- `/Users/fla/Documents/coding/pleasure-states/js/sections/what-we-do.js` - Added opacity reset in startTyping, added debug logging
- `/Users/fla/Documents/coding/pleasure-states/PLAN.md` - Updated implementation status and bug fix documentation

### Debug Logging Added
Console logs added throughout for easier troubleshooting:
- ScrollController: goToSection, onTransitionComplete, handleScrollAttempt
- WhatWeDoSection: onEnter, startTyping with element checks
- All logs use consistent "ModuleName: action" format

**Recommendation:** Can remove debug logs once Figma content is integrated and mobile testing is complete.

---

**Last Updated:** March 10, 2026
**Status:** MVP Phase 2 Complete, Ready for Figma Content Integration
