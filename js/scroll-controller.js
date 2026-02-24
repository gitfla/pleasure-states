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
        wheelDebounceDelay: 150, // MS between wheel events
    },

    // Initialize
    init() {
        this.cacheSections();
        this.registerEventListeners();
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
            const now = Date.now();

            if (this.isScrollBlocked) {
                e.preventDefault();
                return;
            }

            if (this.isTransitioning) {
                e.preventDefault();
                return;
            }

            // Debounce: ignore rapid wheel events
            if (now - lastWheelTime < this.config.wheelDebounceDelay) {
                e.preventDefault();
                return;
            }

            lastWheelTime = now;
            e.preventDefault();

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
            if (this.isScrollBlocked) {
                e.preventDefault();
                return;
            }

            if (this.isTransitioning) {
                e.preventDefault();
                return;
            }

            const touchEndY = e.touches[0].clientY;
            const deltaY = touchStartY - touchEndY;

            if (Math.abs(deltaY) > this.config.snapThreshold && !touchMoved) {
                touchMoved = true;
                const direction = deltaY > 0 ? 1 : -1;
                this.handleScrollAttempt(direction);
            }
        }, { passive: false });
    },

    // Position viewport on splash screen
    positionOnSplash() {
        this.currentSection = 0;
        this.isScrollBlocked = true;
        window.scrollTo(0, 0);

        // Trigger splash animation
        if (this.sections[0].onEnter) {
            this.sections[0].onEnter();
        }
    },

    // Handle user scroll attempt
    handleScrollAttempt(direction) {
        const currentSectionData = this.sections[this.currentSection];

        // Notify current section of scroll attempt
        if (currentSectionData.onScrollAttempt) {
            currentSectionData.onScrollAttempt(direction);
        }

        // Calculate target section
        const targetIndex = this.currentSection + direction;

        // Validate target
        if (targetIndex < 0 || targetIndex >= this.sections.length) {
            return; // Can't scroll beyond boundaries
        }

        // Execute transition
        this.goToSection(targetIndex);
    },

    // Navigate to specific section
    goToSection(targetIndex, immediate = false) {
        if (this.isTransitioning) return;
        if (targetIndex === this.currentSection) return;
        if (targetIndex < 0 || targetIndex >= this.sections.length) return;

        this.isTransitioning = true;

        const currentSectionData = this.sections[this.currentSection];
        const targetSectionData = this.sections[targetIndex];

        // Call onLeave for current section
        if (currentSectionData.onLeave) {
            currentSectionData.onLeave();
        }

        // Animate scroll to target section
        const duration = immediate ? 0 : this.config.transitionDuration;
        gsap.to(window, {
            scrollTo: {
                y: targetSectionData.element,
                autoKill: false,
            },
            duration: duration,
            ease: 'power2.inOut',
            onComplete: () => {
                this.currentSection = targetIndex;
                this.isTransitioning = false;

                // Update scroll blocking state
                this.isScrollBlocked = targetSectionData.isScrollBlocking;

                // Call onEnter for new section
                if (targetSectionData.onEnter) {
                    targetSectionData.onEnter();
                }
            }
        });
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
