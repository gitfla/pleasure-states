// Work with us Section
const WorkWithUsSection = {
    timeline: null,
    isAnimating: false,
    animationWasInterrupted: false,  // Mod 7: Two-step scroll
    autoDelayTimer: null,             // Mod 7: Two-step scroll

    // ANIMATION TIMING CONSTANTS (in seconds, except where noted in MS)
    PARAGRAPH_STAGGER_DELAY: 0.4,  // Delay between paragraph animations
    HEADLINE_WORD_DELAY: 0.4,     // Delay per word in headline (70ms) - increase this to slow down headline
    BUTTON_DELAY: 0.4,             // Delay before button animation
    WORD_BY_WORD_DELAY: 0.1,      // Delay per word in last paragraph (word-by-word fade)
    AUTO_ADVANCE_DELAY_MS: 800,    // MS - delay before auto-advancing after animation interrupt

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

        // 1. PARAGRAPHS FIRST (Mod 5)
        paragraphs.forEach((el, index) => {
            if (index === 2) {
                // Last paragraph: word-by-word fade-in (like what-we-believe)
                const text = el.textContent;
                const words = text.split(/(\s+)/); // Preserve whitespace
                el.innerHTML = ''; // Clear text

                // Create spans for all words
                const wordSpans = [];
                words.forEach(word => {
                    const span = document.createElement('span');
                    span.textContent = word;
                    span.style.opacity = '0';
                    wordSpans.push(span);
                    el.appendChild(span);
                });

                // Instantly set paragraph container visible (no fade duration)
                this.timeline.fromTo(el, anim.from, {...anim.to, duration: 0}, index === 0 ? 0 : `+=${this.PARAGRAPH_STAGGER_DELAY}`);

                // Fade in each word sequentially
                wordSpans.forEach((span, wordIndex) => {
                    this.timeline.to(span, {
                        opacity: 1,
                        duration: 0.3,  // Faster fade for snappier feel
                        ease: 'power2.out'
                    }, wordIndex === 0 ? '+=0' : `+=${this.WORD_BY_WORD_DELAY}`);
                });
            } else {
                // Regular paragraphs
                this.timeline.fromTo(el, anim.from, anim.to, index === 0 ? 0 : `+=${this.PARAGRAPH_STAGGER_DELAY}`);
            }
        });

        // 2. HEADLINE - Word-by-word fade-in with line breaks
        headline.innerHTML = ''; // Clear

        // Words with their positions: BASED | WHEREVER | THERE'S | GOOD | LIGHT
        const wordSequence = ['BASED', 'WHEREVER', "THERE'S", 'GOOD', 'LIGHT'];

        // Create spans for all words with line breaks
        const wordSpans = [];
        wordSequence.forEach((word, index) => {
            if (index > 0) {
                headline.appendChild(document.createElement('br'));
            }
            const span = document.createElement('span');
            span.textContent = word;
            span.style.opacity = '0';
            wordSpans.push(span);
            headline.appendChild(span);
        });

        // Instantly set headline container visible (no fade duration)
        this.timeline.fromTo(headline, anim.from, {...anim.to, duration: 0}, `+=${this.PARAGRAPH_STAGGER_DELAY}`);

        // Fade in each word sequentially
        wordSpans.forEach((span, index) => {
            this.timeline.to(span, {
                opacity: 1,
                duration: 0.8,  // Match paragraph fade duration
                ease: 'power2.out'
            }, index === 0 ? '+=0' : `+=${this.HEADLINE_WORD_DELAY}`);
        });

        // 3. CTA BUTTON (Mod 5)
        if (ctaButton) {
this.timeline.fromTo(ctaButton, anim.from, anim.to, `+=${this.BUTTON_DELAY}`);
        }
    },

    onScrollAttempt(direction) {
        if (this.isAnimating) {
            // FIRST SCROLL: Stop animation, show final state, stay on section (Mod 7)
            this.stopAnimation();
            this.showFinalState();
            this.animationWasInterrupted = true;

            // Start auto-delay timer if enabled (work-with-us is last section, no auto-advance)
            // Timer not needed for last section but keeping pattern consistent
            if (ScrollController.config.autoAdvanceEnabled) {
                this.autoDelayTimer = setTimeout(() => {
                    if (this.animationWasInterrupted) {
                        // No advance for last section
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
            duration: 0.4,
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
        // Clean up two-step scroll state (Mod 7)
        this.animationWasInterrupted = false;
        if (this.autoDelayTimer) {
            clearTimeout(this.autoDelayTimer);
            this.autoDelayTimer = null;
        }
    }
};
