// Work with us Section
const WorkWithUsSection = {
    timeline: null,
    isAnimating: false,

    // ANIMATION TIMING CONSTANTS (reference base constants for consistency)
    INITIAL_DELAY: 0,                                          // 0s - No delay, start immediately when section transition completes
    PARAGRAPH_STAGGER_DELAY: TimingConstants.DELAY_MEDIUM,     // 1.2s - Delay between paragraph animations
    HEADLINE_WORD_DELAY: TimingConstants.DELAY_SHORT,          // 0.6s - Delay per word in headline pop-in
    BUTTON_DELAY: TimingConstants.DELAY_SHORT,                 // 0.6s - Delay before button animation
    WORD_FADE_DURATION: TimingConstants.FADE_WORD,             // 0.2s - Fade-in duration per word in last paragraph
    WORD_BY_WORD_DELAY: TimingConstants.WORD_INSTANT_DELAY,   // 0.1s - Delay per word in last paragraph (word-by-word fade)
    FINAL_STATE_FADE_DURATION: TimingConstants.FADE_PARAGRAPH, // 0.6s - Fade-in duration when showing final state
    AUTO_ADVANCE_DELAY_MS: TimingConstants.DELAY_MEDIUM * 1000, // 1200ms - Delay before auto-advancing after animation interrupt

    init() {
        ScrollController.registerSection('work-with-us', {
            onEnter: (hasAnimated) => this.onEnter(hasAnimated),
            onLeave: () => this.onLeave(),
            onScrollAttempt: (direction) => this.onScrollAttempt(direction)
        });
    },

    onEnter(hasAnimated) {
        console.log('WorkWitin whUsSection: onEnter() called, hasAnimated:', hasAnimated);

        // Store original headline HTML and text before any animation (Mod 5)
        const headline = document.querySelector('.work-with-us-headline');
        if (headline && !headline.dataset.originalHTML) {
            headline.dataset.originalHTML = headline.innerHTML;  // Store HTML with <br> tags
            headline.dataset.originalText = headline.textContent;
        }

        if (hasAnimated) {
            // Section was already animated - show final state immediately
            this.showFinalState();
        } else {
            // First visit - play animation
            this.animateElements();
        }
    },

    animateElements() {
        this.isAnimating = true;
        const headline = document.querySelector('.work-with-us-headline');
        const paragraphs = document.querySelectorAll('.contact-line');
        const ctaButton = document.getElementById('ctaButton');

        // Set reference timestamp for this section
        const referenceTimestamp = performance.now();
        console.log('[TIMING] Work-with-us animation START - REFERENCE T=0ms');

        // Track previous element end time for gap calculations
        let previousElementEndTime = null;

        this.timeline = gsap.timeline({
            onComplete: () => {
                console.log('WorkWithUsSection: Animation complete');
                this.isAnimating = false;
                // Enable pointer events on button
                if (ctaButton) {
                    ctaButton.style.pointerEvents = 'auto';
                }
                // Mark in ScrollController
                if (typeof ScrollController !== 'undefined') {
                    ScrollController.ctaButtonShown = true;
                }
            }
        });

        const anim = AnimationHelpers.getAnimationFromTo();

        // Animation order: all paragraphs except last, headline, last paragraph (word-by-word), button
        // This handles any number of paragraphs gracefully

        // 1. ALL PARAGRAPHS EXCEPT THE LAST ONE (regular fade-in)
        const regularParagraphsCount = paragraphs.length - 1;
        for (let i = 0; i < regularParagraphsCount; i++) {
            this.timeline.fromTo(paragraphs[i], anim.from, {
                ...anim.to,
                onStart: () => {
                    const startTime = performance.now();
                    const relativeTime = Math.round(startTime - referenceTimestamp);
                    let gapInfo = '';
                    if (previousElementEndTime !== null) {
                        const gap = Math.round(startTime - previousElementEndTime);
                        gapInfo = ` (gap from previous end: ${gap}ms)`;
                    }
                    console.log(`[TIMING] Paragraph ${i} START at T=${relativeTime}ms${gapInfo}`);
                },
                onComplete: () => {
                    const endTime = performance.now();
                    previousElementEndTime = endTime;
                    const relativeTime = Math.round(endTime - referenceTimestamp);
                    const duration = Math.round(anim.to.duration * 1000);
                    console.log(`[TIMING] Paragraph ${i} END at T=${relativeTime}ms (duration: ${duration}ms)`);
                }
            }, i === 0 ? this.INITIAL_DELAY : `+=${this.PARAGRAPH_STAGGER_DELAY}`);
        }

        // 2. HEADLINE - Word-by-word pop-in with line breaks
        headline.innerHTML = ''; // Clear

        // Words with their positions: BASED | WHEREVER | THERE'S | GOOD | LIGHT
        const wordSequence = ['BASED', 'WHEREVER', "THERE'S", 'GOOD', 'LIGHT'];

        // Create spans for all words with line breaks
        const headlineWordSpans = [];
        wordSequence.forEach((word, index) => {
            if (index > 0) {
                headline.appendChild(document.createElement('br'));
            }
            const span = document.createElement('span');
            span.textContent = word;
            span.style.opacity = '0';
            headlineWordSpans.push(span);
            headline.appendChild(span);
        });

        // Instantly set headline container visible (no fade duration)
        this.timeline.fromTo(headline, anim.from, {
            ...anim.to,
            duration: 0,
            onStart: () => {
                const startTime = performance.now();
                const relativeTime = Math.round(startTime - referenceTimestamp);
                let gapInfo = '';
                if (previousElementEndTime !== null) {
                    const gap = Math.round(startTime - previousElementEndTime);
                    gapInfo = ` (gap from previous end: ${gap}ms)`;
                }
                console.log(`[TIMING] Headline container START at T=${relativeTime}ms${gapInfo}`);
            }
        }, `+=${this.PARAGRAPH_STAGGER_DELAY}`);

        // Pop in each word sequentially (no fade)
        headlineWordSpans.forEach((span, index) => {
            this.timeline.to(span, {
                opacity: 1,
                duration: 0,  // Instant appearance (no fade)
                ease: 'none',
                onStart: () => {
                    const startTime = performance.now();
                    const relativeTime = Math.round(startTime - referenceTimestamp);
                    let gapInfo = '';
                    if (index > 0 && previousElementEndTime !== null) {
                        const gap = Math.round(startTime - previousElementEndTime);
                        gapInfo = ` (gap from previous word: ${gap}ms)`;
                    }
                    console.log(`[TIMING] Headline word "${span.textContent}" START at T=${relativeTime}ms${gapInfo}`);
                },
                onComplete: () => {
                    const endTime = performance.now();
                    previousElementEndTime = endTime;
                    const relativeTime = Math.round(endTime - referenceTimestamp);
                    console.log(`[TIMING] Headline word "${span.textContent}" END at T=${relativeTime}ms (instant)`);
                }
            }, index === 0 ? '+=0' : `+=${this.HEADLINE_WORD_DELAY}`);
        });

        // 3. LAST PARAGRAPH ("get in touch with us") - word-by-word fade-in
        if (paragraphs.length > 0) {
            const lastParagraph = paragraphs[paragraphs.length - 1];
            const text = lastParagraph.textContent;
            const words = text.split(/(\s+)/); // Preserve whitespace
            lastParagraph.innerHTML = ''; // Clear text

            // Create spans for all words
            const wordSpans = [];
            words.forEach(word => {
                const span = document.createElement('span');
                span.textContent = word;
                span.style.opacity = '0';
                wordSpans.push(span);
                lastParagraph.appendChild(span);
            });

            // Instantly set paragraph container visible (no fade duration)
            this.timeline.fromTo(lastParagraph, anim.from, {
                ...anim.to,
                duration: 0,
                onStart: () => {
                    const startTime = performance.now();
                    const relativeTime = Math.round(startTime - referenceTimestamp);
                    let gapInfo = '';
                    if (previousElementEndTime !== null) {
                        const gap = Math.round(startTime - previousElementEndTime);
                        gapInfo = ` (gap from previous end: ${gap}ms)`;
                    }
                    console.log(`[TIMING] Last paragraph container START at T=${relativeTime}ms${gapInfo}`);
                }
            }, `+=${this.PARAGRAPH_STAGGER_DELAY}`);

            // Fade in each word sequentially
            wordSpans.forEach((span, wordIndex) => {
                this.timeline.to(span, {
                    opacity: 1,
                    duration: this.WORD_FADE_DURATION,
                    ease: 'power2.out',
                    onStart: () => {
                        const startTime = performance.now();
                        const relativeTime = Math.round(startTime - referenceTimestamp);
                        console.log(`[TIMING] Last paragraph word "${span.textContent.trim()}" START at T=${relativeTime}ms`);
                    },
                    onComplete: () => {
                        const endTime = performance.now();
                        previousElementEndTime = endTime;
                        const relativeTime = Math.round(endTime - referenceTimestamp);
                        const duration = Math.round(this.WORD_FADE_DURATION * 1000);
                        console.log(`[TIMING] Last paragraph word "${span.textContent.trim()}" END at T=${relativeTime}ms (duration: ${duration}ms)`);
                    }
                }, wordIndex === 0 ? '+=0' : `+=${this.WORD_BY_WORD_DELAY}`);
            });
        }

        // 4. CTA BUTTON
        if (ctaButton) {
            this.timeline.fromTo(ctaButton, anim.from, {
                ...anim.to,
                onStart: () => {
                    const startTime = performance.now();
                    const relativeTime = Math.round(startTime - referenceTimestamp);
                    let gapInfo = '';
                    if (previousElementEndTime !== null) {
                        const gap = Math.round(startTime - previousElementEndTime);
                        gapInfo = ` (gap from previous end: ${gap}ms)`;
                    }
                    console.log(`[TIMING] CTA Button START at T=${relativeTime}ms${gapInfo}`);
                },
                onComplete: () => {
                    const endTime = performance.now();
                    const relativeTime = Math.round(endTime - referenceTimestamp);
                    const duration = Math.round(anim.to.duration * 1000);
                    console.log(`[TIMING] CTA Button END at T=${relativeTime}ms (duration: ${duration}ms)`);
                }
            }, `+=${this.BUTTON_DELAY}`);
        }
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
        const headline = document.querySelector('.work-with-us-headline');
        const paragraphs = document.querySelectorAll('.contact-line');
        const ctaButton = document.getElementById('ctaButton');

        // Restore headline HTML with <br> tags (Mod 5)
        if (headline && headline.dataset.originalHTML) {
            headline.innerHTML = headline.dataset.originalHTML;  // NOT textContent
        }

        const enableVertical = ScrollController?.config?.enableVerticalAnimation ?? true;
        const finalState = {
            opacity: 1,
            ...(enableVertical ? { y: 0 } : {}),
            duration: this.FINAL_STATE_FADE_DURATION,
            ease: 'power2.out'
        };

        // Fade in the elements instead of instant set
        gsap.to(headline, finalState);
        gsap.to(paragraphs, finalState);

        // Restore last paragraph text if it was cleared for word animation
        const lastParagraph = paragraphs[2];
        if (lastParagraph && lastParagraph.querySelector('span')) {
            lastParagraph.textContent = 'Get in touch with us.';
        }

        if (ctaButton) {
            gsap.to(ctaButton, finalState);
            ctaButton.style.pointerEvents = 'auto';
        }

        this.isAnimating = false;

        // Mark in ScrollController
        if (typeof ScrollController !== 'undefined') {
            ScrollController.ctaButtonShown = true;
        }
    },

    onLeave() {
        // Stop animation when leaving section
        this.stopAnimation();
    }
};
