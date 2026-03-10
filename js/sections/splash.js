// Splash Section
const SplashSection = {
    timeline: null,

    init() {
        console.log('SplashSection: init() called');
        // Register with scroll controller
        ScrollController.registerSection('splash', {
            onEnter: () => this.playAnimation(),
            onLeave: () => this.cleanup(),
            onAfterLeave: () => this.resetState(),
            onScrollAttempt: () => {
                // Ignore scroll attempts during splash
                // Scrolling is blocked by controller
            }
        });
    },

    playAnimation() {
        console.log('SplashSection: playAnimation() called');
        const texts = document.querySelectorAll('.splash-text');
        const tagline = document.querySelector('.splash-tagline');
        console.log('SplashSection: Found', texts.length, 'text elements');

        if (texts.length === 0) {
            console.error('SplashSection: No .splash-text elements found!');
            return;
        }

        this.timeline = gsap.timeline({
            onStart: () => console.log('SplashSection: Animation timeline started'),
            onComplete: () => this.onAnimationComplete()
        });

        // "PLEASURE" appears
        this.timeline.fromTo(texts[0],
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
        );

        // "STATES" appears
        this.timeline.fromTo(texts[1],
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
            '+=0.5'
        );

        // "PLEASURE IS SERIOUS BUSINESS" appears
        if (tagline) {
            this.timeline.fromTo(tagline,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
                '+=0.5'
            );
        }
    },

    onAnimationComplete() {
        // Wait 1 second, then scroll to next section
        setTimeout(() => {
            ScrollController.unlockScroll();
            ScrollController.advanceToNext();
        }, 1000);
    },

    cleanup() {
        // Stop animation when leaving section
        if (this.timeline) {
            this.timeline.kill();
        }
    },

    resetState() {
        // Reset visual state after transition completes
        const texts = document.querySelectorAll('.splash-text');
        const tagline = document.querySelector('.splash-tagline');

        gsap.set(texts, { opacity: 0, y: 20 });
        if (tagline) {
            gsap.set(tagline, { opacity: 0, y: 20 });
        }
    }
};
