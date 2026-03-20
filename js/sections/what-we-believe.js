// What we believe Section
const WhatWeBelieveSection = {
    timeline: null,
    isAnimating: false,
    hasAutoAdvanced: false,
    autoAdvanceTimer: null,           // Timer for auto-advance after animation
    animationWasInterrupted: false,  // Mod 7: Two-step scroll
    autoDelayTimer: null,             // Mod 7: Two-step scroll
    lastScrollTime: 0,  // Gesture detection: Track last scroll event time
    GESTURE_TIMEOUT: 300,  // Gesture detection: 300ms gap = new gesture

    // ANIMATION TIMING CONSTANTS (in seconds, except where noted in MS)
    INITIAL_DELAY: 1.0,            // Delay before first paragraph
    PARAGRAPH_DELAY: 0.6,          // Delay between paragraphs
    WORD_BY_WORD_DELAY: 0.2,      // Delay per word in last paragraph (70ms)
    AUTO_ADVANCE_DELAY_MS: 800,    // MS - delay before auto-advancing after animation interrupt

    init() {
        ScrollController.registerSection('what-we-believe', {
            onEnter: (hasAnimated) => this.onEnter(hasAnimated),
            onLeave: () => this.onLeave(),
            onScrollAttempt: (direction) => this.onScrollAttempt(direction)
        });
    },

    onEnter(hasAnimated) {
        console.log('WhatWeBelieveSection: onEnter() called, hasAnimated:', hasAnimated);

        // Store original text of last paragraph before any animation (Mod 4A)
        const lastParagraph = document.querySelector('.philosophy-paragraph[data-index="6"]');
        if (lastParagraph && !lastParagraph.dataset.originalText) {
            lastParagraph.dataset.originalText = lastParagraph.textContent;
        }

        if (hasAnimated) {
            // Section was already animated - show final state immediately
            this.showFinalState();
        } else {
            // First visit - play animation
            this.animateParagraphs();
        }
    },

    animateParagraphs() {
        this.isAnimating = true;

        const paragraphs = document.querySelectorAll('.philosophy-paragraph');

        this.timeline = gsap.timeline({
            onComplete: () => this.onAnimationComplete()
        });

        const initialDelay = this.INITIAL_DELAY;
        const paragraphDelay = this.PARAGRAPH_DELAY;

        // Reveal each paragraph with stagger
        paragraphs.forEach((p, index) => {
            if (index === 6) {
                // Last paragraph: fade in container, THEN word-by-word fade-in
                const text = p.dataset.originalText || p.textContent;
                const words = text.split(/(\s+)/); // Preserve whitespace
                p.innerHTML = ''; // Clear text

                // Create spans for all words
                const wordSpans = [];
                words.forEach(word => {
                    const span = document.createElement('span');
                    span.textContent = word;
                    span.style.opacity = '0';
                    wordSpans.push(span);
                    p.appendChild(span);
                });

                const anim = AnimationHelpers.getAnimationFromTo();
                // Instantly set paragraph container visible (no fade duration)
                this.timeline.fromTo(p, anim.from, {...anim.to, duration: 0}, `+=${paragraphDelay}`);

                // Fade in each word sequentially
                wordSpans.forEach((span, wordIndex) => {
                    this.timeline.to(span, {
                        opacity: 1,
                        duration: 0.3,
                        ease: 'power2.out'
                    }, wordIndex === 0 ? '+=0' : `+=${this.WORD_BY_WORD_DELAY}`);
                });
            } else {
                // Regular paragraph
                const anim = AnimationHelpers.getAnimationFromTo();
                this.timeline.fromTo(p, anim.from, anim.to,
                    index === 0 ? initialDelay : `+=${paragraphDelay}`
                );
            }
        });
    },

    onAnimationComplete() {
        this.isAnimating = false;

        // Only auto-advance on first visit and if enabled
        if (ScrollController.config.autoAdvanceEnabled && !this.hasAutoAdvanced) {
            this.hasAutoAdvanced = true;
            console.log('WhatWeBelieveSection: Setting auto-advance timer for', this.AUTO_ADVANCE_DELAY_MS, 'ms');
            this.autoAdvanceTimer = setTimeout(() => {
                console.log('WhatWeBelieveSection: Auto-advance timer fired');
                ScrollController.advanceToNext();
            }, this.AUTO_ADVANCE_DELAY_MS);
        }
    },

    // Gesture detection: Check if this is a new gesture
    isNewGesture() {
        const now = Date.now();
        const timeSinceLastScroll = now - this.lastScrollTime;
        return timeSinceLastScroll > this.GESTURE_TIMEOUT;
    },

    onScrollAttempt(direction) {
        const now = Date.now();

        // Reset interrupt flag if this is a new gesture
        if (this.isNewGesture() && !this.isAnimating) {
            console.log('WhatWeBelieveSection: New gesture detected, resetting interrupt flag');
            this.animationWasInterrupted = false;
        }

        this.lastScrollTime = now;

        if (this.isAnimating) {
            // FIRST SCROLL: Stop animation, show final state, stay on section (Mod 7)
            this.stopAnimation();
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

    stopAnimation() {
        if (this.timeline) {
            this.timeline.kill();
            this.isAnimating = false;
        }
    },

    showFinalState() {
        // Set all animated elements to their final state with fade-in
        const paragraphs = document.querySelectorAll('.philosophy-paragraph');

        // Restore last paragraph text if it was cleared for typing (Mod 4A)
        const lastParagraph = paragraphs[6];
        if (lastParagraph && lastParagraph.dataset.originalText) {
            lastParagraph.textContent = lastParagraph.dataset.originalText;
        }

        const enableVertical = ScrollController?.config?.enableVerticalAnimation ?? true;

        // Fade in the paragraphs instead of instant set
        gsap.to(paragraphs, {
            opacity: 1,
            ...(enableVertical ? { y: 0 } : {}),
            duration: 0.4,
            ease: 'power2.out'
        });
    },

    onLeave() {
        // Stop animation when leaving section
        this.stopAnimation();

        // Clean up auto-advance timer
        if (this.autoAdvanceTimer) {
            console.log('WhatWeBelieveSection: Clearing auto-advance timer');
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }

        // Clean up two-step scroll state (Mod 7)
        this.animationWasInterrupted = false;
        this.lastScrollTime = 0;  // Reset gesture tracking
        if (this.autoDelayTimer) {
            clearTimeout(this.autoDelayTimer);
            this.autoDelayTimer = null;
        }
    }
};
