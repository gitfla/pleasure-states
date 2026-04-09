// What we believe Section
const WhatWeBelieveSection = {
    timeline: null,
    isAnimating: false,
    hasAutoAdvanced: false,
    autoAdvanceTimer: null,           // Timer for auto-advance after animation
    lastScrollTime: 0,  // Gesture detection: Track last scroll event time
    GESTURE_TIMEOUT: 300,  // Gesture detection: 300ms gap = new gesture

    // ANIMATION TIMING CONSTANTS (reference base constants for consistency)
    INITIAL_DELAY: TimingConstants.DELAY_MEDIUM + TimingConstants.FADE_PARAGRAPH,  // 1.8s - Accounts for logo fade (0.6s) + gap (1.2s) to match paragraph spacing
    PARAGRAPH_DELAY: TimingConstants.DELAY_MEDIUM,          // 1.2s - Delay between paragraphs
    WORD_FADE_DURATION: TimingConstants.FADE_WORD,          // 0.2s - Fade-in duration per word in last paragraph
    WORD_BY_WORD_DELAY: TimingConstants.WORD_INSTANT_DELAY, // 0.0s - Delay per word in last paragraph
    FINAL_STATE_FADE_DURATION: TimingConstants.FADE_PARAGRAPH, // 0.6s - Fade-in duration when showing final state
    AUTO_ADVANCE_DELAY_MS: TimingConstants.DELAY_MEDIUM * 1000, // 1000ms - Delay before auto-advancing after animation interrupt

    init() {
        ScrollController.registerSection('what-we-believe', {
            onEnter: (hasAnimated) => this.onEnter(hasAnimated),
            onLeave: () => this.onLeave(),
            onScrollAttempt: (direction) => this.onScrollAttempt(direction)
        });
    },

    onEnter(hasAnimated) {

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

        // Track timing for gap calculations
        let previousElementEndTime = null;

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
                        duration: this.WORD_FADE_DURATION,
                        ease: 'power2.out'
                    }, wordIndex === 0 ? '+=0' : `+=${this.WORD_BY_WORD_DELAY}`);
                });
            } else {
                // Regular paragraph
                const anim = AnimationHelpers.getAnimationFromTo();
                this.timeline.fromTo(p, anim.from, {
                    ...anim.to,
                    onStart: () => {
                        // Log paragraph start time
                        if (ScrollController.timingReferenceTimestamp !== null) {
                            const startTime = performance.now();
                            const relativeTime = Math.round(startTime - ScrollController.timingReferenceTimestamp);

                            // Calculate gap from previous element
                            let gapInfo = '';
                            if (index === 0 && ScrollController.logoFadeEndTime !== null) {
                                // First paragraph - calculate gap from logo end
                                const gap = Math.round(startTime - ScrollController.logoFadeEndTime);
                                gapInfo = ` (gap from logo end: ${gap}ms)`;
                            } else if (previousElementEndTime !== null) {
                                // Subsequent paragraphs - calculate gap from previous paragraph
                                const gap = Math.round(startTime - previousElementEndTime);
                                gapInfo = ` (gap from P${index - 1} end: ${gap}ms)`;
                            }

                        }
                    },
                    onComplete: () => {
                        // Log paragraph end time
                        if (ScrollController.timingReferenceTimestamp !== null) {
                            const endTime = performance.now();
                            previousElementEndTime = endTime;
                            const relativeTime = Math.round(endTime - ScrollController.timingReferenceTimestamp);
                            const duration = Math.round(anim.to.duration * 1000);
                        }
                    }
                },
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
            this.autoAdvanceTimer = setTimeout(() => {
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
        if (this.isAnimating) {
            return false; // Block all scrolling during animation
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
            duration: this.FINAL_STATE_FADE_DURATION,
            ease: 'power2.out'
        });
    },

    onLeave() {
        // Stop animation when leaving section
        this.stopAnimation();

        // Clean up auto-advance timer
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }

        // Reset gesture tracking
        this.lastScrollTime = 0;
    }
};
