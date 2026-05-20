// Scroll Controller - Master scroll orchestration
const ScrollController = {
    // State
    currentSection: 0,
    isTransitioning: false,
    isScrollBlocked: false,
    isMobile: window.innerWidth <= 768,  // Track viewport mode explicitly
    sections: [],
    sectionElements: [],
    timingReferenceTimestamp: null,  // Reference timestamp for timing logs
    logoFadeStartTime: null,  // Track when logo fade starts
    logoFadeEndTime: null,  // Track when logo fade ends

    // Configuration
    config: {
        snapThreshold: 50, // Pixels of scroll to trigger snap
        transitionDuration: 1.2, // Seconds
        wheelDebounceDelay: 300, // MS between wheel events (increased from 150)
        enableVerticalAnimation: false, // Enable y-axis movement in fade animations (Mod 3)
        autoAdvanceEnabled: false, // Auto-advance to next section after animations (Mod 6, default: disabled)
    },

    // Initialize
    init() {
        this.cacheSections();
        this.registerEventListeners();

        // Debounce resize to avoid excessive calls
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 250);
        });

        // Don't call positionOnSplash() here - it will be called after sections register
    },

    // Start the experience (called after all sections are initialized)
    start() {
        this.positionOnSplash();
    },

    // Full re-initialization (for viewport mode changes)
    reinitialize() {

        // Save current section ID for remapping (not index, which will change)
        const currentSectionId = this.sections[this.currentSection]?.id;

        // Re-cache sections (will filter based on new isMobile state)
        this.cacheSections();

        // Remap to equivalent section by ID, not index
        // Special case: work-with-us-1 on mobile -> work-with-us-2 on desktop
        let targetId = currentSectionId;
        if (currentSectionId === 'work-with-us-1' && !this.isMobile) {
            targetId = 'work-with-us-2';  // Mobile work-with-us-1 -> desktop work-with-us
        }

        // Find new index for this section ID
        const newIndex = this.sections.findIndex(s => s.id === targetId);
        if (newIndex !== -1) {
            this.currentSection = newIndex;
        } else {
            // Fallback: clamp to valid range
            this.currentSection = Math.min(this.currentSection, this.sections.length - 1);
        }

        // Reset state flags that may be stale
        this.isTransitioning = false;  // Cancel any in-flight transitions
        // Note: hasAnimated flags are on section objects, rebuilt with sections array

        // Update all UI components
        this.updateScrollIndicator();
        this.updateMenuVisibility();

        // Re-sync menu active state
        if (typeof MenuController !== 'undefined') {
            const newSectionId = this.sections[this.currentSection]?.id;
            if (newSectionId) {
                MenuController.updateActiveMenuItem(newSectionId);
            }
        }

    },

    // Handle window resize (viewport mode changes)
    handleResize() {
        const nowMobile = window.innerWidth <= 768;

        // Viewport mode changed - refresh page to reinitialize cleanly
        if (this.isMobile !== nowMobile) {
            window.location.reload();
        }
    },

    // Cache all section elements and metadata
    cacheSections() {
        this.sectionElements = Array.from(document.querySelectorAll('[data-section]'));

        // Filter out work-with-us-1 on desktop
        if (!this.isMobile) {
            this.sectionElements = this.sectionElements.filter(el => el.id !== 'work-with-us-1');
        }

        this.sections = this.sectionElements.map((el, index) => ({
            element: el,
            id: el.id,
            index: index,  // Re-indexed after filtering
            isScrollBlocking: el.dataset.scrollBlocking === 'true',
            autoAdvance: el.dataset.autoAdvance === 'true',
            hasAnimated: false, // Track if section has been animated
            onEnter: null, // Callback when section becomes active
            onLeave: null, // Callback when leaving section (before animation)
            onScrollAttempt: null, // Callback when user tries to scroll
            isAtScrollBoundary: null, // Callback to check if at scroll boundary (for typing box transitions)
        }));
    },

    // Setup event listeners
    registerEventListeners() {
        // Wheel events (desktop)
        let wheelTimeout;
        let lastWheelTime = 0;

        window.addEventListener('wheel', (e) => {
            const now = Date.now();

            if (this.isScrollBlocked) { e.preventDefault(); return; }
            if (this.isTransitioning) { e.preventDefault(); return; }

            const direction = e.deltaY > 0 ? 1 : -1;

            // In what-we-do, let the text box scroll and only transition at boundaries
            if (this.currentSection === 2 && typeof WhatWeDoSection !== 'undefined') {
                if (WhatWeDoSection.isNewGesture()) WhatWeDoSection.handleGestureStart();
                WhatWeDoSection.lastWheelTime = now;

                if (this.canTransitionFromTypingBox(direction)) {
                    e.preventDefault();
                    if (now - lastWheelTime < this.config.wheelDebounceDelay) return;
                    lastWheelTime = now;
                    this.handleScrollAttempt(direction);
                    return;
                }

                const currentBoundary = WhatWeDoSection.checkCurrentBoundary();
                if ((direction === 1 && currentBoundary.atBottom) || (direction === -1 && currentBoundary.atTop)) {
                    e.preventDefault();
                    return;
                }

                // Not at boundary — let the box scroll natively
                return;
            }

            // All other sections: prevent default and transition
            e.preventDefault();
            if (now - lastWheelTime < this.config.wheelDebounceDelay) return;
            lastWheelTime = now;
            this.handleScrollAttempt(direction);

        }, { passive: false });

        // Touch events (mobile)
        let touchStartY = 0;
        let touchMoved = false;

        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchMoved = false;

            // Snapshot boundary at true gesture start so a long swipe can't
            // scroll the text box and transition sections in the same gesture
            if (this.currentSection === 2 && typeof WhatWeDoSection !== 'undefined') {
                WhatWeDoSection.handleGestureStart();
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (this.isScrollBlocked) { e.preventDefault(); return; }
            if (this.isTransitioning) { e.preventDefault(); return; }

            const deltaY = touchStartY - e.touches[0].clientY;
            const direction = deltaY > 0 ? 1 : -1;

            // In what-we-do, let the text box scroll and only transition at boundaries
            if (this.currentSection === 2 && typeof WhatWeDoSection !== 'undefined') {
                if (this.canTransitionFromTypingBox(direction)) {
                    if (Math.abs(deltaY) > this.config.snapThreshold && !touchMoved) {
                        e.preventDefault();
                        touchMoved = true;
                        this.handleScrollAttempt(direction);
                    }
                    return;
                }

                const currentBoundary = WhatWeDoSection.checkCurrentBoundary();
                if ((direction === 1 && currentBoundary.atBottom) || (direction === -1 && currentBoundary.atTop)) {
                    e.preventDefault();
                    return;
                }

                // Not at boundary — let the text box scroll natively
                return;
            }

            // All other sections: prevent default and transition on threshold
            e.preventDefault();
            if (Math.abs(deltaY) > this.config.snapThreshold && !touchMoved) {
                touchMoved = true;
                this.handleScrollAttempt(direction);
            }

        }, { passive: false });

    },

    // Position viewport on splash screen
    positionOnSplash() {
        this.currentSection = 0;
        this.isScrollBlocked = true;

        // No need to scrollTo since sections are fixed position
        // Splash is already visible at z-index 10

        // Trigger splash animation
        if (this.sections[0] && this.sections[0].onEnter) {
            this.sections[0].onEnter();
        } else {
        }
    },

    // Handle user scroll attempt
    handleScrollAttempt(direction) {
        // Check if already transitioning
        if (this.isTransitioning) {
            return;
        }

        const currentSectionData = this.sections[this.currentSection];

        // Notify section of scroll attempt (Mod 7: two-step interruption)
        // Section can return false to prevent immediate transition
        if (currentSectionData.onScrollAttempt) {
            const result = currentSectionData.onScrollAttempt(direction);
            // If returns false, don't proceed with transition
            if (result === false) {
                return;
            }
        }

        // Calculate target section
        const targetIndex = this.currentSection + direction;

        // Validate target - prevent going back to splash (index 0)
        if (targetIndex < 1 || targetIndex >= this.sections.length) {
            return; // Can't scroll to splash or beyond end
        }

        // Execute transition (goToSection will set isTransitioning flag)
        this.goToSection(targetIndex);
    },

    // Navigate to specific section with mask-lifting effect
    goToSection(targetIndex, immediate = false) {

        // Check if already transitioning (for menu clicks)
        if (this.isTransitioning) {
            return;
        }
        if (targetIndex === this.currentSection) {
            return;
        }
        // Prevent navigating to splash (index 0) or beyond boundaries
        if (targetIndex < 1 || targetIndex >= this.sections.length) {
            return;
        }

        // Set transitioning flag (may already be set by handleScrollAttempt)
        this.isTransitioning = true;

        const currentSectionData = this.sections[this.currentSection];
        const targetSectionData = this.sections[targetIndex];
        const direction = targetIndex > this.currentSection ? 'down' : 'up';

        // Update current section index early so scroll indicator and menu animate with the transition
        const previousSection = this.currentSection;
        this.currentSection = targetIndex;

        // Update scroll indicator BEFORE starting transition so it animates in sync
        this.updateScrollIndicator();

        // Update active menu item BEFORE starting transition so it animates in sync
        if (typeof MenuController !== 'undefined' && MenuController.updateActiveMenuItem) {
            MenuController.updateActiveMenuItem(targetSectionData.id);
        }

        // Call onLeave for current section
        if (currentSectionData.onLeave) {
            currentSectionData.onLeave();
        }

        const duration = immediate ? 0 : this.config.transitionDuration;

        // Both sections stationary at top:0.
        // Current section sits on top (z:999) and is clipped away, revealing target (z:1) behind it.
        // Scroll down: clip bottom grows 0→vh (boundary line travels bottom→top).
        // Scroll up: clip top grows 0→vh (boundary line travels top→bottom).

        // Use the element's own rendered height so inset() clips fully regardless of dvh/chrome
        const vh = currentSectionData.element.offsetHeight;

        gsap.set(targetSectionData.element, { top: '0%', zIndex: 1 });
        // Splash needs z:101 to cover fixed menu/logo (z:100). Other sections use z:99 so menu/logo stay visible.
        const currentZ = previousSection === 0 ? 101 : 99;
        gsap.set(currentSectionData.element, { zIndex: currentZ, clipPath: `inset(0px 0px 0px 0px)` });

        // On mobile, fade out fixed splash elements that escape clip-path
        if (previousSection === 0 && this.isMobile) {
            const tagline = document.querySelector('.mobile-splash-tagline');
            const arrow = document.querySelector('.mobile-splash-arrow');
            if (tagline) gsap.to(tagline, { opacity: 0, duration: duration, ease: 'power2.inOut' });
            if (arrow) gsap.to(arrow, { opacity: 0, duration: duration, ease: 'power2.inOut' });
        }

        // CTA button: show at z:0 (behind current section) when transitioning INTO work-with-us-2
        // so it's revealed naturally by the wipe. After transition, restore to high z-index.
        const ctaButton = document.getElementById('ctaButton');
        const enteringWorkWithUs2 = targetSectionData.id === 'work-with-us-2';
        const ctaAlreadyRevealed = ctaButton && ctaButton.classList.contains('cta-visible');
        if (ctaButton) {
            if (enteringWorkWithUs2 && !ctaAlreadyRevealed) {
                // First time: z:2 so wipe reveals it from behind current section
                gsap.set(ctaButton, { zIndex: 2 });
                ctaButton.classList.add('cta-visible');
            } else if (!ctaAlreadyRevealed) {
                // Not yet revealed — keep hidden below everything
                gsap.set(ctaButton, { zIndex: 0 });
            }
            // Already revealed — leave z-index untouched, stays visible always
        }

        const cleanup = () => {
            gsap.set(currentSectionData.element, { top: '100%', zIndex: 0, clipPath: 'none' });
            gsap.set(targetSectionData.element, { zIndex: '' });
            // Restore CTA z-index after first reveal
            if (ctaButton && enteringWorkWithUs2 && !ctaAlreadyRevealed) {
                gsap.set(ctaButton, { zIndex: '' });
            }
            const lo = Math.min(targetIndex, previousSection);
            const hi = Math.max(targetIndex, previousSection);
            for (let i = lo + 1; i < hi; i++) {
                gsap.set(this.sections[i].element, { top: '100%' });
            }
            this.onTransitionComplete(targetIndex);
        };

        if (immediate) {
            // Instant swap — use gsap.set so cleanup runs synchronously
            gsap.set(currentSectionData.element, { clipPath: direction === 'down' ? `inset(0px 0px ${vh}px 0px)` : `inset(${vh}px 0px 0px 0px)` });
            cleanup();
        } else if (direction === 'down') {
            // Clip current from the bottom upward: inset bottom grows 0→vh
            gsap.to(currentSectionData.element, {
                clipPath: `inset(0px 0px ${vh}px 0px)`,
                duration,
                ease: 'power2.inOut',
                onComplete: cleanup
            });
        } else {
            // Clip current from the top downward: inset top grows 0→vh
            gsap.to(currentSectionData.element, {
                clipPath: `inset(${vh}px 0px 0px 0px)`,
                duration,
                ease: 'power2.inOut',
                onComplete: cleanup
            });
        }
    },

    // Called when transition animation completes
    onTransitionComplete(newIndex) {

        // Note: this.currentSection was already updated at the start of goToSection
        this.isTransitioning = false;

        const newSectionData = this.sections[newIndex];

        // Set reference timestamp for timing logs when entering what-we-believe
        if (newSectionData.id === 'what-we-believe') {
            this.timingReferenceTimestamp = performance.now();
        }

        // DEBUG: Log all section positions
        this.sections.forEach((s, i) => {
            const top = s.element.style.top;
        });

        // Update scroll blocking state
        this.isScrollBlocked = newSectionData.isScrollBlocking;

        // Show/hide menu, logo, scroll bar after transition completes
        this.updateMenuVisibility();

        // Update logo visibility
        if (typeof updateLogoVisibility === 'function') {
            updateLogoVisibility(newIndex);
        }

        // Call onEnter for new section, passing hasAnimated flag
        if (newSectionData.onEnter) {
            newSectionData.onEnter(newSectionData.hasAnimated);
            // Mark as animated after first visit
            newSectionData.hasAnimated = true;
        } else {
        }
    },

    // No-op: menu/logo/scrollbar/CTA are always visible, covered by splash z-index
    updateMenuVisibility() {},

    // Compute gutter in pixels (CSS variable uses clamp/max, can't parseFloat directly)
    getGutterPx() {
        const temp = document.createElement('div');
        temp.style.cssText = 'position:absolute;visibility:hidden;width:var(--gutter)';
        document.body.appendChild(temp);
        const val = parseFloat(getComputedStyle(temp).width);
        document.body.removeChild(temp);
        return val;
    },

    // Update scroll indicator bar position based on current section
    updateScrollIndicator() {
        const scrollIndicator = document.getElementById('scrollIndicator');
        if (!scrollIndicator) {
            return;
        }

        const currentIndex = this.currentSection - 1; // 0-based index for non-splash sections

        if (currentIndex < 0) {
            return;
        }

        // Compute actual gutter value in pixels (can't use parseFloat on CSS variables with max/clamp)
        const temp = document.createElement('div');
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        temp.style.width = 'var(--gutter)';
        document.body.appendChild(temp);
        const gutterValue = parseFloat(getComputedStyle(temp).width);
        document.body.removeChild(temp);

        // Calculate responsive scroll bar height: max(135px, 24.17vh)
        const scrollBarHeight = Math.max(135, window.innerHeight * 0.2417);

        // Calculate positions in pixels (always use top property for smooth transition)
        let topPosition;

        switch (currentIndex) {
            case 0: // what-we-believe: align with top of first menu item (1 gutter from top)
                topPosition = gutterValue;
                break;
            case 1: // what-we-do: vertically centered
                topPosition = (window.innerHeight - scrollBarHeight) / 2;
                break;
            case 2: // work-with-us-1 (mobile only)
            case 3: // work-with-us-2
                // Both work-with-us sections share the same indicator position (bottom)
                // Indicator represents menu item, not individual sections
                topPosition = window.innerHeight - scrollBarHeight - gutterValue;
                break;
        }

        // Apply position (transition will animate smoothly)
        scrollIndicator.style.top = topPosition + 'px';
    },

    // Check if typing box allows section transition from boundary
    canTransitionFromTypingBox(direction) {

        // Only applies to what-we-do section (index 2)
        if (this.currentSection !== 2) {
            return false;
        }

        const currentSectionData = this.sections[this.currentSection];

        // Delegate to section's boundary check method
        if (typeof currentSectionData.isAtScrollBoundary === 'function') {
            const result = currentSectionData.isAtScrollBoundary(direction);
            return result;
        }

        return false;
    },

    // API: Register section callbacks
    registerSection(sectionId, callbacks) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section) {
            section.onEnter = callbacks.onEnter || null;
            section.onLeave = callbacks.onLeave || null;
            section.onScrollAttempt = callbacks.onScrollAttempt || null;
            section.isAtScrollBoundary = callbacks.isAtScrollBoundary || null;
        }
    },

    // API: Unlock scrolling (called by splash screen when complete)
    unlockScroll() {
        this.isScrollBlocked = false;
    },

    // API: Auto-advance to next section
    advanceToNext(delay = 0) {
        setTimeout(() => {
            this.goToSection(this.currentSection + 1);
        }, delay);
    }
};
