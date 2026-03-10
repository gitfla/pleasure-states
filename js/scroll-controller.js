// Scroll Controller - Master scroll orchestration
const ScrollController = {
    // State
    currentSection: 0,
    isTransitioning: false,
    isScrollBlocked: false,
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
            onEnter: null, // Callback when section becomes active
            onLeave: null, // Callback when leaving section
            onScrollAttempt: null, // Callback when user tries to scroll
        }));
    },

    // Setup event listeners
    registerEventListeners() {
        // Wheel events (desktop)
        let wheelTimeout;
        let lastWheelTime = 0;

        window.addEventListener('wheel', (e) => {
            e.preventDefault(); // Always prevent default scroll

            const now = Date.now();

            // Block if scroll is locked (splash screen)
            if (this.isScrollBlocked) {
                return;
            }

            // Block if transition is in progress (prevents rapid scrolling through sections)
            if (this.isTransitioning) {
                console.log('ScrollController: Scroll ignored - transition in progress');
                return;
            }

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

        // Validate target
        if (targetIndex < 0 || targetIndex >= this.sections.length) {
            console.log('ScrollController: Cannot scroll beyond boundaries');
            return; // Can't scroll beyond boundaries
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
        if (targetIndex < 0 || targetIndex >= this.sections.length) {
            console.log('ScrollController: Invalid target index');
            return;
        }

        // Set transitioning flag (may already be set by handleScrollAttempt)
        this.isTransitioning = true;

        const currentSectionData = this.sections[this.currentSection];
        const targetSectionData = this.sections[targetIndex];
        const direction = targetIndex > this.currentSection ? 'down' : 'up';

        console.log('ScrollController: Direction:', direction);

        // Call onLeave for current section
        if (currentSectionData.onLeave) {
            currentSectionData.onLeave();
        }

        const duration = immediate ? 0 : this.config.transitionDuration;

        if (direction === 'down') {
            // Scrolling forward: Next section slides up from bottom
            console.log('ScrollController: Sliding section', targetIndex, 'up from bottom');

            // Ensure target section starts at 100% (below viewport)
            gsap.set(targetSectionData.element, { y: '100%' });

            gsap.to(targetSectionData.element, {
                y: '0%',     // Slide up to cover current
                duration: duration,
                ease: 'power2.inOut',
                onComplete: () => this.onTransitionComplete(targetIndex)
            });
        } else {
            // Scrolling backward: Current section slides down to reveal previous
            console.log('ScrollController: Sliding section', this.currentSection, 'down to reveal', targetIndex);

            // Ensure target section (which is below current) is at 0%
            gsap.set(targetSectionData.element, { y: '0%' });

            // Slide current section down to reveal it
            gsap.to(currentSectionData.element, {
                y: '100%',      // Slide down off-screen
                duration: duration,
                ease: 'power2.inOut',
                onComplete: () => this.onTransitionComplete(targetIndex)
            });
        }
    },

    // Called when transition animation completes
    onTransitionComplete(newIndex) {
        console.log('ScrollController: Transition complete, now at section', newIndex);
        this.currentSection = newIndex;
        this.isTransitioning = false;

        const newSectionData = this.sections[newIndex];
        console.log('ScrollController: New section data:', newSectionData ? newSectionData.id : 'NULL');
        console.log('ScrollController: Has onEnter callback?', !!newSectionData.onEnter);

        // Update scroll blocking state
        this.isScrollBlocked = newSectionData.isScrollBlocking;

        // Show/hide menu based on section
        this.updateMenuVisibility();

        // Call onEnter for new section
        if (newSectionData.onEnter) {
            console.log('ScrollController: Calling onEnter for section', newSectionData.id);
            newSectionData.onEnter();
        } else {
            console.warn('ScrollController: No onEnter callback for section', newSectionData.id);
        }
    },

    // Show menu from philosophy onwards, hide on splash
    updateMenuVisibility() {
        const menu = document.getElementById('mainMenu');
        if (this.currentSection === 0) {
            // Splash: hide menu
            menu.classList.remove('visible');
        } else {
            // All other sections: show menu
            menu.classList.add('visible');
        }
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
