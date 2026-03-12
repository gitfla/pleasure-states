// Scroll Controller - Master scroll orchestration
const ScrollController = {
    // State
    currentSection: 0,
    isTransitioning: false,
    isScrollBlocked: false,
    ctaButtonShown: false,
    mouseX: 0,  // Track mouse X position for zone-based scrolling
    sections: [],
    sectionElements: [],

    // Configuration
    config: {
        snapThreshold: 50, // Pixels of scroll to trigger snap
        transitionDuration: 1.2, // Seconds
        wheelDebounceDelay: 300, // MS between wheel events (increased from 150)
    },

    // Initialize
    init() {
        console.log('ScrollController: init() called');
        this.cacheSections();
        console.log('ScrollController: Cached', this.sections.length, 'sections');
        this.registerEventListeners();
        // Don't call positionOnSplash() here - it will be called after sections register
    },

    // Start the experience (called after all sections are initialized)
    start() {
        console.log('ScrollController: start() called');
        this.positionOnSplash();
    },

    // Cache all section elements and metadata
    cacheSections() {
        this.sectionElements = Array.from(document.querySelectorAll('[data-section]'));
        this.sections = this.sectionElements.map((el, index) => ({
            element: el,
            id: el.id,
            index: index,
            isScrollBlocking: el.dataset.scrollBlocking === 'true',
            autoAdvance: el.dataset.autoAdvance === 'true',
            hasAnimated: false, // Track if section has been animated
            onEnter: null, // Callback when section becomes active
            onLeave: null, // Callback when leaving section (before animation)
            onScrollAttempt: null, // Callback when user tries to scroll
        }));
    },

    // Setup event listeners
    registerEventListeners() {
        // Wheel events (desktop)
        let wheelTimeout;
        let lastWheelTime = 0;

        window.addEventListener('wheel', (e) => {
            const now = Date.now();

            // Block if scroll is locked (splash screen)
            if (this.isScrollBlocked) {
                e.preventDefault();
                return;
            }

            // Block if transition is in progress (prevents rapid scrolling through sections)
            if (this.isTransitioning) {
                e.preventDefault();
                console.log('ScrollController: Scroll ignored - transition in progress');
                return;
            }

            // Check if we're in what-we-do section
            if (this.currentSection === 2) { // what-we-do is section index 2
                const scrollZone = this.getScrollZone(e.target, this.mouseX);

                if (scrollZone === 'typing-box') {
                    // Allow default scroll behavior for typing box
                    // Do NOT preventDefault
                    return;
                }
            }

            // For all other cases, prevent default and handle section transitions
            e.preventDefault();

            // Debounce: ignore rapid wheel events
            if (now - lastWheelTime < this.config.wheelDebounceDelay) {
                console.log('ScrollController: Scroll ignored - debounced');
                return;
            }

            lastWheelTime = now;

            const direction = e.deltaY > 0 ? 1 : -1; // 1 = down, -1 = up
            this.handleScrollAttempt(direction);

        }, { passive: false });

        // Touch events (mobile)
        let touchStartY = 0;
        let touchMoved = false;

        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchMoved = false;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            // Block if scroll is locked or transition in progress
            if (this.isScrollBlocked || this.isTransitioning) {
                e.preventDefault();
                return;
            }

            const touchEndY = e.touches[0].clientY;
            const deltaY = touchStartY - touchEndY;

            // Only trigger if swipe exceeds threshold and hasn't been triggered yet
            if (Math.abs(deltaY) > this.config.snapThreshold && !touchMoved) {
                e.preventDefault();
                touchMoved = true;
                const direction = deltaY > 0 ? 1 : -1;
                this.handleScrollAttempt(direction);
            }
        }, { passive: false });

        // Track mouse position for zone-based scrolling
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
        }, { passive: true });
    },

    // Position viewport on splash screen
    positionOnSplash() {
        console.log('ScrollController: positionOnSplash() called');
        this.currentSection = 0;
        this.isScrollBlocked = true;

        // No need to scrollTo since sections are fixed position
        // Splash is already visible at z-index 10

        // Trigger splash animation
        if (this.sections[0] && this.sections[0].onEnter) {
            console.log('ScrollController: Triggering splash onEnter callback');
            this.sections[0].onEnter();
        } else {
            console.error('ScrollController: Splash section onEnter callback not registered!');
        }
    },

    // Handle user scroll attempt
    handleScrollAttempt(direction) {
        // Check if already transitioning
        if (this.isTransitioning) {
            console.log('ScrollController: Already transitioning, ignoring scroll');
            return;
        }

        const currentSectionData = this.sections[this.currentSection];

        // Calculate target section
        const targetIndex = this.currentSection + direction;

        // Validate target - prevent going back to splash (index 0)
        if (targetIndex < 1 || targetIndex >= this.sections.length) {
            console.log('ScrollController: Cannot scroll beyond boundaries (splash locked)');
            return; // Can't scroll to splash or beyond end
        }

        // Notify current section of scroll attempt (for animation interruption)
        if (currentSectionData.onScrollAttempt) {
            currentSectionData.onScrollAttempt(direction);
        }

        // Execute transition (goToSection will set isTransitioning flag)
        this.goToSection(targetIndex);
    },

    // Navigate to specific section with mask-lifting effect
    goToSection(targetIndex, immediate = false) {
        console.log('ScrollController: goToSection() from', this.currentSection, 'to', targetIndex);

        // Check if already transitioning (for menu clicks)
        if (this.isTransitioning) {
            console.log('ScrollController: Transition already in progress, ignoring');
            return;
        }
        if (targetIndex === this.currentSection) {
            console.log('ScrollController: Already at target section');
            return;
        }
        // Prevent navigating to splash (index 0) or beyond boundaries
        if (targetIndex < 1 || targetIndex >= this.sections.length) {
            console.log('ScrollController: Invalid target index (splash locked)');
            return;
        }

        // Set transitioning flag (may already be set by handleScrollAttempt)
        this.isTransitioning = true;

        const currentSectionData = this.sections[this.currentSection];
        const targetSectionData = this.sections[targetIndex];
        const direction = targetIndex > this.currentSection ? 'down' : 'up';

        console.log('ScrollController: Direction:', direction);

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

        if (direction === 'down') {
            // Scrolling forward: Next section slides up from bottom to cover current
            console.log('ScrollController: Sliding section', targetIndex, 'up from bottom');

            // Ensure target section starts at 100% (below viewport)
            gsap.set(targetSectionData.element, { top: '100%' });

            gsap.to(targetSectionData.element, {
                top: '0%',     // Slide up to cover current
                duration: duration,
                ease: 'power2.inOut',
                onComplete: () => this.onTransitionComplete(targetIndex)
            });
        } else {
            // Scrolling backward: Previous section slides down from top to cover current
            console.log('ScrollController: Sliding section', targetIndex, 'down from top');

            // Ensure target section starts at -100% (above viewport)
            gsap.set(targetSectionData.element, { top: '-100%' });

            // Temporarily boost z-index so previous section can cover current section
            const currentZIndex = window.getComputedStyle(currentSectionData.element).zIndex;
            const tempZIndex = parseInt(currentZIndex) + 1;
            gsap.set(targetSectionData.element, { zIndex: tempZIndex });

            // Slide previous section down to cover (current stays still)
            gsap.to(targetSectionData.element, {
                top: '0%',
                duration: duration,
                ease: 'power2.inOut',
                onComplete: () => {
                    // Reset z-index after transition
                    gsap.set(targetSectionData.element, { zIndex: '' });
                    // Move the old section out of the way
                    gsap.set(currentSectionData.element, { top: '100%' });
                    this.onTransitionComplete(targetIndex);
                }
            });
        }
    },

    // Called when transition animation completes
    onTransitionComplete(newIndex) {
        console.log('ScrollController: Transition complete, now at section', newIndex);

        // Note: this.currentSection was already updated at the start of goToSection
        this.isTransitioning = false;

        const newSectionData = this.sections[newIndex];
        console.log('ScrollController: New section data:', newSectionData ? newSectionData.id : 'NULL');
        console.log('ScrollController: Has onEnter callback?', !!newSectionData.onEnter);
        console.log('ScrollController: Has been animated?', newSectionData.hasAnimated);

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
            console.log('ScrollController: Calling onEnter for section', newSectionData.id);
            newSectionData.onEnter(newSectionData.hasAnimated);
            // Mark as animated after first visit
            newSectionData.hasAnimated = true;
        } else {
            console.warn('ScrollController: No onEnter callback for section', newSectionData.id);
        }
    },

    // Show menu and logo from philosophy onwards, hide on splash
    updateMenuVisibility() {
        const menu = document.getElementById('mainMenu');
        const logo = document.getElementById('siteLogo');
        const scrollIndicator = document.getElementById('scrollIndicator');
        const ctaButton = document.getElementById('ctaButton');

        if (this.currentSection === 0) {
            // Splash: hide menu, logo, scroll indicator, and CTA
            menu.classList.remove('visible');
            if (logo) logo.classList.remove('visible');
            if (scrollIndicator) scrollIndicator.classList.remove('visible');
            if (ctaButton && this.ctaButtonShown) {
                ctaButton.classList.add('hidden');
            }
        } else {
            // All other sections: show menu, logo, and scroll indicator
            menu.classList.add('visible');
            if (logo) logo.classList.add('visible');
            if (scrollIndicator) scrollIndicator.classList.add('visible');
            // Show CTA if it's been revealed
            if (ctaButton && this.ctaButtonShown) {
                ctaButton.classList.remove('hidden');
            }
            // Note: updateScrollIndicator() is now called at the start of goToSection for sync'd animation
        }
    },

    // Update scroll indicator bar position based on current section
    updateScrollIndicator() {
        const scrollIndicator = document.getElementById('scrollIndicator');
        if (!scrollIndicator) {
            console.log('ScrollController: scrollIndicator element not found');
            return;
        }

        const currentIndex = this.currentSection - 1; // 0-based index for non-splash sections
        console.log('ScrollController: updateScrollIndicator() called, currentSection:', this.currentSection, 'currentIndex:', currentIndex);

        if (currentIndex < 0) {
            console.log('ScrollController: currentIndex < 0, not updating scroll indicator');
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

        const scrollBarHeight = 270; // Fixed height of scroll bar

        console.log('ScrollController: gutterValue:', gutterValue, 'scrollBarHeight:', scrollBarHeight, 'window.innerHeight:', window.innerHeight);

        // Calculate positions in pixels (always use top property for smooth transition)
        let topPosition;

        switch (currentIndex) {
            case 0: // what-we-believe: 1 gutter from top
                topPosition = gutterValue;
                console.log('ScrollController: Section 0 (what-we-believe), topPosition:', topPosition);
                break;
            case 1: // what-we-do: vertically centered
                topPosition = (window.innerHeight - scrollBarHeight) / 2;
                console.log('ScrollController: Section 1 (what-we-do), topPosition:', topPosition);
                break;
            case 2: // work-with-us: 1 gutter from bottom
                topPosition = window.innerHeight - scrollBarHeight - gutterValue;
                console.log('ScrollController: Section 2 (work-with-us), topPosition:', topPosition);
                break;
        }

        console.log('ScrollController: Setting scrollIndicator.style.top to:', topPosition + 'px');
        // Apply position (transition will animate smoothly)
        scrollIndicator.style.top = topPosition + 'px';
    },

    // Determine which scroll zone the mouse is in (for what-we-do section)
    getScrollZone(target, mouseX) {
        const viewportWidth = window.innerWidth;

        // Calculate zone boundaries based on grid layout
        const leftColumnEnd = viewportWidth * 0.327;  // 32.7%
        const navStripStart = viewportWidth * 0.968;  // 96.8% (100% - 3.2%)

        // Check if mouse is over the typing box element or its children
        const typingBox = document.querySelector('.what-we-do-text-box');
        if (typingBox && (typingBox === target || typingBox.contains(target))) {
            // Mouse is over typing box area
            if (mouseX > leftColumnEnd && mouseX < navStripStart) {
                return 'typing-box';
            }
        }

        // Default: section transition zones (left column or nav strip)
        return 'section-transition';
    },

    // API: Register section callbacks
    registerSection(sectionId, callbacks) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section) {
            section.onEnter = callbacks.onEnter || null;
            section.onLeave = callbacks.onLeave || null;
            section.onScrollAttempt = callbacks.onScrollAttempt || null;
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
