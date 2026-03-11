// What we believe Section
const WhatWeBelieveSection = {
    timeline: null,
    isAnimating: false,
    hasAutoAdvanced: false,

    init() {
        ScrollController.registerSection('what-we-believe', {
            onEnter: (hasAnimated) => this.onEnter(hasAnimated),
            onLeave: () => this.onLeave(),
            onScrollAttempt: (direction) => this.onScrollAttempt(direction)
        });
    },

    onEnter(hasAnimated) {
        console.log('WhatWeBelieveSection: onEnter() called, hasAnimated:', hasAnimated);
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

        // Reveal each paragraph with stagger
        paragraphs.forEach((p, index) => {
            this.timeline.fromTo(p,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
                index === 0 ? 0 : '+=0.6' // First paragraph starts immediately
            );
        });
    },

    onAnimationComplete() {
        this.isAnimating = false;

        // Only auto-advance on first visit
        if (!this.hasAutoAdvanced) {
            this.hasAutoAdvanced = true;
            setTimeout(() => {
                ScrollController.advanceToNext();
            }, 800);
        }
    },

    onScrollAttempt(direction) {
        if (this.isAnimating) {
            // User scrolled during animation - stop and skip to final state
            this.stopAnimation();
            this.showFinalState();
        }
    },

    stopAnimation() {
        if (this.timeline) {
            this.timeline.kill();
            this.isAnimating = false;
        }
    },

    showFinalState() {
        // Set all animated elements to their final state immediately
        const paragraphs = document.querySelectorAll('.philosophy-paragraph');
        gsap.set(paragraphs, { opacity: 1, y: 0 });
    },

    onLeave() {
        // Stop animation when leaving section
        this.stopAnimation();
    }
};
