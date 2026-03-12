// What We Do Section
const WhatWeDoSection = {
    typingTimeline: null,
    isTyping: false,
    hasAutoAdvanced: false,
    userHasScrolled: false, // Track if user manually scrolled away from bottom

    // Gesture tracking for boundary detection
    gestureStartBoundary: { atTop: false, atBottom: false },
    lastWheelTime: 0,
    GESTURE_TIMEOUT: 100, // MS gap to consider new gesture
    gestureHitBoundary: false, // Track if current gesture reached boundary during typing
    AUTO_SCROLL_PAUSE_THRESHOLD: 150, // MS - pause auto-scroll if wheel event within this time
    textContent: `We name things.

We write things.

We design the strategy behind things.

We help good ideas become clear ideas.

We give shape to the stuff people feel but can't explain.

We turn research into direction, not decks.

We build brand worlds people want to live in.

We help tired things feel alive again.

We think fast when we need to.

We work slow when it matters.

We plug into your team or bring our own.

We're a practice.
With a network. With taste. With teeth.`,

    init() {
        ScrollController.registerSection('what-we-do', {
            onEnter: (hasAnimated) => this.onEnter(hasAnimated),
            onLeave: () => this.onLeave(),
            onScrollAttempt: (direction) => this.onScrollAttempt(direction),
            isAtScrollBoundary: (direction) => this.isAtScrollBoundary(direction)
        });
    },

    onEnter(hasAnimated) {
        console.log('WhatWeDoSection: onEnter() called, hasAnimated:', hasAnimated);

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
        console.log('WhatWeDoSection: startTyping() called');
        this.isTyping = true;
        this.userHasScrolled = false; // Reset flag at start of typing

        const typingContainer = document.getElementById('typingContent');
        const textBox = document.getElementById('typingTextBox');

        console.log('WhatWeDoSection: typingContainer:', typingContainer);
        console.log('WhatWeDoSection: textBox:', textBox);

        typingContainer.textContent = ''; // Clear previous content
        gsap.set(typingContainer, { opacity: 1 }); // Reset opacity in case it was faded out

        // Add scroll event listener to detect manual scrolling
        const scrollHandler = () => {
            // Check if user scrolled away from bottom
            const isAtBottom = textBox.scrollTop >= (typingContainer.scrollHeight - textBox.clientHeight - 5);

            if (!isAtBottom) {
                this.userHasScrolled = true;
            } else {
                // User scrolled back to bottom, resume auto-scroll
                this.userHasScrolled = false;
            }
        };

        textBox.addEventListener('scroll', scrollHandler);

        // Store reference to remove listener later
        this.scrollHandler = scrollHandler;

        // Split by whitespace while preserving spaces and newlines
        const parts = this.textContent.split(/(\s+)/);
        const wordsPerSecond = 8; // Adjust speed for word-by-word
        const delayPerWord = 1 / wordsPerSecond;

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
                        textBox.scrollTop = typingContainer.scrollHeight - textBox.clientHeight;
                    }
                }
            }, [], delayPerWord * index);
        });
    },

    onTypingComplete() {
        this.isTyping = false;

        // Only auto-advance on first visit
        if (!this.hasAutoAdvanced) {
            this.hasAutoAdvanced = true;
            setTimeout(() => {
                ScrollController.advanceToNext();
            }, 1000);
        }
    },

    onScrollAttempt(direction) {
        if (this.isTyping) {
            // User scrolled during typing - stop and skip to final state
            this.stopTyping();
            this.showFinalState();
        }
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
    },

    // Gesture detection methods
    isNewGesture() {
        const now = Date.now();
        const timeSinceLastWheel = now - this.lastWheelTime;
        return timeSinceLastWheel > this.GESTURE_TIMEOUT;
    },

    handleGestureStart() {
        // Capture current boundary state at start of new gesture
        this.gestureStartBoundary = this.checkCurrentBoundary();
        this.gestureHitBoundary = false; // Reset for new gesture
        console.log('WhatWeDoSection: New gesture started, boundary state:', this.gestureStartBoundary);
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
        console.log('WhatWeDoSection: isAtScrollBoundary() called, direction:', direction);

        // Only allow boundary transitions when typing is complete
        if (this.isTyping) {
            console.log('WhatWeDoSection: isTyping is true, returning false');
            return false;
        }

        // Check current boundary state
        const currentBoundary = this.checkCurrentBoundary();

        // Only transition if we were ALREADY at boundary when gesture started
        if (direction === 1) {
            // Scrolling down: were we at bottom when gesture started?
            const wasAtBottom = this.gestureStartBoundary.atBottom;
            const stillAtBottom = currentBoundary.atBottom;

            console.log('WhatWeDoSection: Check down transition - wasAtBottom:', wasAtBottom, 'stillAtBottom:', stillAtBottom);

            // Only transition if we started at bottom AND still at bottom
            return wasAtBottom && stillAtBottom;
        } else {
            // Scrolling up: were we at top when gesture started?
            const wasAtTop = this.gestureStartBoundary.atTop;
            const stillAtTop = currentBoundary.atTop;

            console.log('WhatWeDoSection: Check up transition - wasAtTop:', wasAtTop, 'stillAtTop:', stillAtTop);

            // Only transition if we started at top AND still at top
            return wasAtTop && stillAtTop;
        }
    }
};
