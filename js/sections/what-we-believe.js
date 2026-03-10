// What we believe Section
const WhatWeBelieveSection = {
    timeline: null,
    isAnimating: false,

    init() {
        ScrollController.registerSection('what-we-believe', {
            onEnter: () => this.onEnter(),
            onLeave: () => this.onLeave(),
            onAfterLeave: () => this.resetState(),
            onScrollAttempt: (direction) => this.onScrollAttempt(direction)
        });
    },

    onEnter() {
        // Start paragraph animations
        this.animateParagraphs();
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

        // Auto-advance after short delay
        setTimeout(() => {
            ScrollController.advanceToNext();
        }, 800);
    },

    onScrollAttempt(direction) {
        if (this.isAnimating) {
            // User scrolled during animation - interrupt
            this.stopAnimation();
            // Let scroll controller handle the navigation
        }
    },

    stopAnimation() {
        if (this.timeline) {
            this.timeline.kill();
            this.isAnimating = false;
        }
    },

    onLeave() {
        // Stop animation when leaving section
        this.stopAnimation();
    },

    resetState() {
        // Reset visual state after transition completes
        const paragraphs = document.querySelectorAll('.philosophy-paragraph');
        gsap.set(paragraphs, { opacity: 0, y: 20 });
    }
};
