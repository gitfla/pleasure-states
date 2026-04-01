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
        // Register work-with-us-1 (headline section)
        ScrollController.registerSection('work-with-us-1', {
            onEnter: (hasAnimated) => this.onEnter1(hasAnimated),
            onLeave: () => this.onLeave1(),
            onScrollAttempt: (direction) => this.onScrollAttempt1(direction)
        });

        // Register work-with-us-2 (paragraphs + button section)
        ScrollController.registerSection('work-with-us-2', {
            onEnter: (hasAnimated) => this.onEnter2(hasAnimated),
            onLeave: () => this.onLeave2(),
            onScrollAttempt: (direction) => this.onScrollAttempt2(direction)
        });

        // Legacy: Also register 'work-with-us' for desktop compatibility
        const legacySection = document.getElementById('work-with-us');
        if (legacySection) {
            ScrollController.registerSection('work-with-us', {
                onEnter: (hasAnimated) => this.onEnter(hasAnimated),
                onLeave: () => this.onLeave(),
                onScrollAttempt: (direction) => this.onScrollAttempt(direction)
            });
        }
    },

    // ========================================
    // WORK WITH US - PART 1 (Headline)
    // ========================================

    onEnter1(hasAnimated) {
        console.log('WorkWithUsSection Part 1: onEnter() called, hasAnimated:', hasAnimated);

        const headline = document.querySelector('#work-with-us-1 .work-with-us-headline');
        if (headline && !headline.dataset.originalHTML) {
            headline.dataset.originalHTML = headline.innerHTML;
            headline.dataset.originalText = headline.textContent;
        }

        if (hasAnimated) {
            this.showFinalState1();
        } else {
            this.animateHeadline();
        }
    },

    onLeave1() {
        console.log('WorkWithUsSection Part 1: onLeave() called');
        if (this.timeline1) {
            this.timeline1.kill();
        }
    },

    onScrollAttempt1(direction) {
        if (direction === 'down') {
            // If animation is complete or interrupted, allow scroll to part 2
            if (!this.isAnimating || this.animationComplete) {
                return true; // Allow scroll
            }
        }
        return true; // Allow scrolling in this section
    },

    showFinalState1() {
        const headline = document.querySelector('#work-with-us-1 .work-with-us-headline');
        const words = headline ? headline.textContent.trim().split(/\s+/).filter(w => w) : [];

        words.forEach(() => {
            gsap.set(headline, { opacity: 1 });
        });
    },

    animateHeadline() {
        console.log('[WORK WITH US 1] ========================================');
        console.log('[WORK WITH US 1] animateHeadline() called');

        this.isAnimating = true;
        const headline = document.querySelector('#work-with-us-1 .work-with-us-headline');
        if (!headline) {
            console.error('[WORK WITH US 1] Headline element not found!');
            return;
        }

        // Get original HTML with line breaks
        const originalHTML = headline.dataset.originalHTML;

        // Replace <br> tags with spaces to properly split words
        const textWithSpaces = originalHTML.replace(/<br\s*\/?>/gi, ' ');
        // Create temporary element to get text content without HTML tags
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = textWithSpaces;
        const words = tempDiv.textContent.trim().split(/\s+/).filter(w => w);

        console.log('[WORK WITH US 1] Original HTML:', originalHTML);
        console.log('[WORK WITH US 1] Text with spaces:', textWithSpaces);
        console.log('[WORK WITH US 1] Words:', words);
        console.log('[WORK WITH US 1] Word count:', words.length);
        console.log('[WORK WITH US 1] Timing constants:', {
            INITIAL_DELAY: this.INITIAL_DELAY,
            HEADLINE_WORD_DELAY: this.HEADLINE_WORD_DELAY
        });

        // Create GSAP timeline
        this.timeline1 = gsap.timeline({
            onStart: () => {
                console.log('[WORK WITH US 1] Timeline started');
            },
            onComplete: () => {
                console.log('[WORK WITH US 1] Timeline completed');
                this.isAnimating = false;
                this.animationComplete = true;
                // Restore original HTML with line breaks
                headline.innerHTML = originalHTML;
            }
        });

        // Clear headline and make visible
        headline.textContent = '';
        headline.style.opacity = '1';
        console.log('[WORK WITH US 1] Headline cleared, opacity set to 1');

        // Show words one by one (no fade, instant appearance)
        let currentText = '';
        words.forEach((word, i) => {
            const delay = i === 0 ? this.INITIAL_DELAY : `+=${this.HEADLINE_WORD_DELAY}`;
            console.log(`[WORK WITH US 1] Scheduling word ${i} "${word}" with delay: ${delay}`);

            this.timeline1.call(() => {
                currentText += (i > 0 ? ' ' : '') + word;
                headline.textContent = currentText;
                console.log(`[WORK WITH US 1] ✅ Word ${i} "${word}" appeared at ${performance.now().toFixed(2)}ms`);
                console.log(`[WORK WITH US 1] Current text: "${currentText}"`);
            }, null, delay);
        });

        console.log('[WORK WITH US 1] Timeline setup complete, total duration:', this.timeline1.duration());
        console.log('[WORK WITH US 1] ========================================');
    },

    // ========================================
    // WORK WITH US - PART 2 (Paragraphs + Button)
    // ========================================

    onEnter2(hasAnimated) {
        console.log('WorkWithUsSection Part 2: onEnter() called, hasAnimated:', hasAnimated);

        if (hasAnimated) {
            this.showFinalState2();
        } else {
            this.animateParagraphs();
        }
    },

    onLeave2() {
        console.log('WorkWithUsSection Part 2: onLeave() called');
        if (this.timeline2) {
            this.timeline2.kill();
        }
    },

    onScrollAttempt2(direction) {
        // Allow scrolling freely in part 2
        return true;
    },

    showFinalState2() {
        const paragraphs = document.querySelectorAll('#work-with-us-2 .contact-line');
        const ctaButton = document.getElementById('ctaButton');

        gsap.set(paragraphs, { opacity: 1 });
        if (ctaButton) {
            gsap.set(ctaButton, { opacity: 1, pointerEvents: 'auto' });
        }
    },

    animateParagraphs() {
        this.isAnimating = true;
        const paragraphs = document.querySelectorAll('#work-with-us-2 .contact-line');
        const ctaButton = document.getElementById('ctaButton');

        // Create timeline
        this.timeline2 = gsap.timeline({
            onComplete: () => {
                this.isAnimating = false;
            }
        });

        // Animate paragraphs
        paragraphs.forEach((p, i) => {
            this.timeline2.fromTo(p,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: TimingConstants.FADE_PARAGRAPH,
                    ease: 'power2.out'
                },
                i === 0 ? this.INITIAL_DELAY : `+=${this.PARAGRAPH_STAGGER_DELAY}`
            );
        });

        // Animate CTA button
        if (ctaButton) {
            this.timeline2.fromTo(ctaButton,
                { opacity: 0, pointerEvents: 'none' },
                {
                    opacity: 1,
                    pointerEvents: 'auto',
                    duration: TimingConstants.FADE_PARAGRAPH,
                    ease: 'power2.out'
                },
                `+=${this.BUTTON_DELAY}`
            );
        }
    },

    // ========================================
    // LEGACY: Original combined section (for desktop)
    // ========================================

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
