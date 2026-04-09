// What We Do Section
const WhatWeDoSection = {
    typingTimeline: null,
    isTyping: false,
    hasAutoAdvanced: false,
    autoAdvanceTimer: null,           // Timer for auto-advance after typing
    speedResetTimer: null,            // Timer to reset typing speed after scroll stops
    userHasScrolled: false, // Track if user manually scrolled away from bottom
    lastProgrammaticScrollTop: -1, // Track programmatic scroll position to ignore its events
    currentTypingSpeed: 1,  // 1 = normal, 3 = 3x speed
    animationWasInterrupted: false,  // Mod 7: Two-step scroll
    autoDelayTimer: null,             // Mod 7: Two-step scroll

    // Gesture tracking for boundary detection (wheel and touch events)
    gestureStartBoundary: { atTop: false, atBottom: false },
    lastWheelTime: 0,  // Shared timestamp for both wheel and touch events
    GESTURE_TIMEOUT: 50, // MS gap to consider new gesture (wheel or touch)
    gestureHitBoundary: false, // Track if current gesture reached boundary during typing
    AUTO_SCROLL_PAUSE_THRESHOLD: 150, // MS - pause auto-scroll if wheel/touch event within this time

    // Gesture tracking for left column scroll interruption
    lastLeftColumnScrollTime: 0,  // Track left column scroll events
    LEFT_COLUMN_GESTURE_TIMEOUT: 300,  // 300ms gap = new gesture (matches what-we-believe)

    // ANIMATION TIMING CONSTANTS (in seconds, except where noted in MS)
    TYPING_WORDS_PER_SECOND: 8,  // Base typing speed
    AUTO_ADVANCE_DELAY_MS: 1000,  // MS - delay before auto-advancing after typing complete
    SPEED_RESET_DELAY_MS: 500,  // MS - delay before resetting to normal speed after scroll stops

    // Calculated values
    get TYPING_DELAY_PER_WORD() {
        return 1 / this.TYPING_WORDS_PER_SECOND;
    },

    textContent: `We name things.

We write things.

We design the strategy behind things.

We look beyond the brief.

We make ideas feel inevitable.

We give shape to the stuff people feel but can't explain.

We imagine wildly and build truthfully.

We turn research into action.

We know the people shaping culture before it's obvious.

We build worlds that feel like places you want to live in.

We launch things that weren't there before.

We refresh stories to feel alive again.

We design partnerships that travel far.

We run workshops that crack things open.

We eat together.

We think fast when we need to. We work slow when it matters.

We're not an agency. We're a practice. With a network. With taste. With teeth.`,

    init() {
        ScrollController.registerSection('what-we-do', {
            onEnter: (hasAnimated) => this.onEnter(hasAnimated),
            onLeave: () => this.onLeave(),
            onScrollAttempt: (direction) => this.onScrollAttempt(direction),
            isAtScrollBoundary: (direction) => this.isAtScrollBoundary(direction)
        });
    },

    onEnter(hasAnimated) {

        // Initialize gesture tracking
        this.gestureStartBoundary = this.checkCurrentBoundary();
        this.lastWheelTime = 0;

        if (hasAnimated) {
            // Section was already animated - show final state immediately
            this.showFinalState();
        } else {
            // First visit - play typing animation
            this.startTyping();
        }
    },

    startTyping() {
        this.isTyping = true;
        this.userHasScrolled = false; // Reset flag at start of typing
        this.currentTypingSpeed = 1; // Reset to normal speed

        const typingContainer = document.getElementById('typingContent');
        const textBox = document.getElementById('typingTextBox');

        typingContainer.textContent = ''; // Clear previous content
        gsap.set(typingContainer, { opacity: 1 }); // Reset opacity in case it was faded out

        // Track last scroll position to detect direction
        let lastScrollTop = textBox.scrollTop;

        // Add scroll event listener to detect manual scrolling
        const scrollHandler = () => {
            const currentScrollTop = textBox.scrollTop;

            // Ignore scroll events from our own auto-scrolling
            if (currentScrollTop === this.lastProgrammaticScrollTop) {
                this.lastProgrammaticScrollTop = -1; // Reset after ignoring
                return;
            }
            const scrollDirection = currentScrollTop > lastScrollTop ? 'down' : 'up';
            lastScrollTop = currentScrollTop;

            // Check if user is at bottom
            const isAtBottom = textBox.scrollTop >= (typingContainer.scrollHeight - textBox.clientHeight - 5);

            // Check if content is scrollable
            const isScrollable = typingContainer.scrollHeight > textBox.clientHeight;

            // Speed up typing if scrolling down during typing
            if (this.isTyping && scrollDirection === 'down') {

                if (!isScrollable || isAtBottom) {
                    // Speed up if: content not scrollable yet OR at bottom
                    this.speedUpTyping();
                } else {
                }
            }

            if (!isAtBottom && scrollDirection === 'up') {
                // Only disable auto-scroll if scrolling UP away from bottom
                this.userHasScrolled = true;
            } else if (isAtBottom) {
                // User at bottom, resume auto-scroll
                this.userHasScrolled = false;
            }
            // If scrolling down but not at bottom yet, don't change userHasScrolled
            // Let auto-scroll pause mechanism handle it
        };

        textBox.addEventListener('scroll', scrollHandler);

        // Add wheel event listener to detect scroll attempts even when not scrollable
        const wheelHandler = (e) => {
            if (!this.isTyping) return;

            const isScrollable = typingContainer.scrollHeight > textBox.clientHeight;

            // Only handle wheel events when content is NOT scrollable
            // When scrollable, the scroll handler will handle it
            if (e.deltaY > 0 && !isScrollable) {
                this.speedUpTyping();
            }
        };

        textBox.addEventListener('wheel', wheelHandler, { passive: true });

        // Store references to remove listeners later
        this.scrollHandler = scrollHandler;
        this.wheelHandler = wheelHandler;

        // Split by whitespace while preserving spaces and newlines
        const parts = this.textContent.split(/(\s+)/);
        const wordsPerSecond = this.TYPING_WORDS_PER_SECOND;
        const delayPerWord = this.TYPING_DELAY_PER_WORD;

        this.typingTimeline = gsap.timeline({
            onComplete: () => this.onTypingComplete()
        });

        let currentText = '';

        parts.forEach((part, index) => {
            this.typingTimeline.call(() => {
                currentText += part;
                typingContainer.textContent = currentText;

                // Auto-scroll text box if content overflows and user hasn't manually scrolled
                if (typingContainer.scrollHeight > textBox.clientHeight && !this.userHasScrolled) {
                    // Check if user is actively scrolling right now
                    const timeSinceLastWheel = Date.now() - this.lastWheelTime;
                    const isUserActivelyScrolling = timeSinceLastWheel < this.AUTO_SCROLL_PAUSE_THRESHOLD;

                    // Only auto-scroll if user is NOT actively scrolling (prevents jitter)
                    if (!isUserActivelyScrolling) {
                        // Record the position we're about to set programmatically
                        const targetScrollTop = typingContainer.scrollHeight - textBox.clientHeight;
                        this.lastProgrammaticScrollTop = targetScrollTop;
                        textBox.scrollTop = targetScrollTop;
                    }
                }
            }, [], delayPerWord * index);
        });
    },

    onTypingComplete() {
        this.isTyping = false;

        // Only auto-advance on first visit and if enabled
        if (ScrollController.config.autoAdvanceEnabled && !this.hasAutoAdvanced) {
            this.hasAutoAdvanced = true;
            this.autoAdvanceTimer = setTimeout(() => {
                ScrollController.advanceToNext();
            }, this.AUTO_ADVANCE_DELAY_MS);
        }
    },

    onScrollAttempt(direction) {
        if (this.isTyping) {
            // FIRST SCROLL: Stop typing, show final state, stay on section (Mod 7)
            this.stopTyping();
            this.showFinalState();
            this.animationWasInterrupted = true;

            // Start auto-delay timer if enabled
            if (ScrollController.config.autoAdvanceEnabled) {
                this.autoDelayTimer = setTimeout(() => {
                    if (this.animationWasInterrupted) {
                        ScrollController.advanceToNext();
                        this.animationWasInterrupted = false;
                    }
                }, this.AUTO_ADVANCE_DELAY_MS);
            }

            return false; // Prevent immediate transition
        } else if (this.animationWasInterrupted) {
            // SECOND SCROLL: Allow transition (Mod 7)
            this.animationWasInterrupted = false;
            if (this.autoDelayTimer) {
                clearTimeout(this.autoDelayTimer);
                this.autoDelayTimer = null;
            }
            return true;
        }
        return true; // Animation complete, allow transition
    },

    stopTyping() {
        if (this.typingTimeline) {
            this.typingTimeline.kill();
            this.isTyping = false;
        }

        // Remove scroll event listener
        if (this.scrollHandler) {
            const textBox = document.getElementById('typingTextBox');
            if (textBox) {
                textBox.removeEventListener('scroll', this.scrollHandler);
            }
            this.scrollHandler = null;
        }

        // Remove wheel event listener
        if (this.wheelHandler) {
            const textBox = document.getElementById('typingTextBox');
            if (textBox) {
                textBox.removeEventListener('wheel', this.wheelHandler);
            }
            this.wheelHandler = null;
        }
    },

    // Speed up typing to 3x with debounced reset timer
    speedUpTyping() {
        if (!this.typingTimeline) return;

        // Cancel any existing reset timer
        if (this.speedResetTimer) {
            clearTimeout(this.speedResetTimer);
            this.speedResetTimer = null;
        }

        // Speed up if not already fast
        if (this.currentTypingSpeed === 1) {
            this.currentTypingSpeed = 3;
            this.typingTimeline.timeScale(3);
        }

        // Start new reset timer - will reset to 1x after 500ms of no scrolling
        this.speedResetTimer = setTimeout(() => {
            if (this.typingTimeline && this.currentTypingSpeed === 3) {
                this.currentTypingSpeed = 1;
                this.typingTimeline.timeScale(1);
            }
            this.speedResetTimer = null;
        }, this.SPEED_RESET_DELAY_MS);
    },

    showFinalState() {
        // Set typing content to full text immediately
        const typingContainer = document.getElementById('typingContent');
        if (typingContainer) {
            typingContainer.textContent = this.textContent;
            gsap.set(typingContainer, { opacity: 1 });
        }
    },

    onLeave() {
        // Stop typing animation when leaving section
        this.stopTyping();

        // Clean up auto-advance timer
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }

        // Clean up speed reset timer
        if (this.speedResetTimer) {
            clearTimeout(this.speedResetTimer);
            this.speedResetTimer = null;
        }

        // Clean up two-step scroll state (Mod 7)
        this.animationWasInterrupted = false;
        this.lastLeftColumnScrollTime = 0;  // Reset left column gesture tracking
        if (this.autoDelayTimer) {
            clearTimeout(this.autoDelayTimer);
            this.autoDelayTimer = null;
        }
    },

    // Gesture detection methods
    isNewGesture() {
        const now = Date.now();
        const timeSinceLastWheel = now - this.lastWheelTime;
        return timeSinceLastWheel > this.GESTURE_TIMEOUT;
    },

    isNewLeftColumnGesture() {
        const now = Date.now();
        const timeSinceLastScroll = now - this.lastLeftColumnScrollTime;
        return timeSinceLastScroll > this.LEFT_COLUMN_GESTURE_TIMEOUT;
    },

    handleGestureStart() {
        // Capture current boundary state at start of new gesture
        this.gestureStartBoundary = this.checkCurrentBoundary();
        this.gestureHitBoundary = false; // Reset for new gesture
    },

    // Check current boundary state (for preventDefault during typing)
    checkCurrentBoundary() {
        const textBox = document.getElementById('typingTextBox');
        const typingContainer = document.getElementById('typingContent');

        if (!textBox || !typingContainer) {
            return { atTop: false, atBottom: false };
        }

        const scrollTop = textBox.scrollTop;
        const scrollHeight = typingContainer.scrollHeight;
        const clientHeight = textBox.clientHeight;

        // If content doesn't overflow, treat as "at bottom"
        if (scrollHeight <= clientHeight) {
            return { atTop: true, atBottom: true };
        }

        const atTop = scrollTop === 0;
        const atBottom = scrollTop >= (scrollHeight - clientHeight - 5);

        return { atTop, atBottom };
    },

    isAtScrollBoundary(direction) {

        // Only allow boundary transitions when typing is complete
        if (this.isTyping) {
            return false;
        }

        // Check current boundary state
        const currentBoundary = this.checkCurrentBoundary();

        // Only transition if we were ALREADY at boundary when gesture started
        if (direction === 1) {
            // Scrolling down: were we at bottom when gesture started?
            const wasAtBottom = this.gestureStartBoundary.atBottom;
            const stillAtBottom = currentBoundary.atBottom;

            // Only transition if we started at bottom AND still at bottom
            return wasAtBottom && stillAtBottom;
        } else {
            // Scrolling up: were we at top when gesture started?
            const wasAtTop = this.gestureStartBoundary.atTop;
            const stillAtTop = currentBoundary.atTop;

            // Only transition if we started at top AND still at top
            return wasAtTop && stillAtTop;
        }
    }
};
