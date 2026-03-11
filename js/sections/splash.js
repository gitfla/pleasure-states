// Splash Section
const SplashSection = {
    timeline: null,
    hasAutoAdvanced: false,

    init() {
        console.log('SplashSection: init() called');
        // Register with scroll controller
        ScrollController.registerSection('splash', {
            onEnter: (hasAnimated) => this.onEnter(hasAnimated),
            onLeave: () => this.cleanup(),
            onScrollAttempt: () => {
                // Ignore scroll attempts during splash
                // Scrolling is blocked by controller
            }
        });
    },

    onEnter(hasAnimated) {
        console.log('SplashSection: onEnter() called, hasAnimated:', hasAnimated);
        if (hasAnimated) {
            // Section was already animated - show final state immediately
            this.showFinalState();
        } else {
            // First visit - play animation
            this.playAnimation();
        }
    },

    playAnimation() {
        console.log('SplashSection: playAnimation() called');
        const images = document.querySelectorAll('.splash-image');
        const tagline = document.querySelector('.splash-tagline');
        console.log('SplashSection: Found', images.length, 'image elements');

        if (images.length === 0) {
            console.error('SplashSection: No .splash-image elements found!');
            return;
        }

        this.timeline = gsap.timeline({
            onStart: () => console.log('SplashSection: Animation timeline started'),
            onComplete: () => this.onAnimationComplete()
        });

        // "PLEASURE" image appears
        this.timeline.fromTo(images[0],
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );

        // "STATES" image appears
        this.timeline.fromTo(images[1],
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
            '+=0.25'
        );

        // "PLEASURE IS SERIOUS BUSINESS" appears
        if (tagline) {
            this.timeline.fromTo(tagline,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
                '+=0.25'
            );
        }
    },

    onAnimationComplete() {
        // Only auto-advance on first visit
        if (!this.hasAutoAdvanced) {
            this.hasAutoAdvanced = true;
            setTimeout(() => {
                ScrollController.unlockScroll();
                ScrollController.advanceToNext();
            }, 1000);
        }
    },

    showFinalState() {
        // Set all animated elements to their final state immediately
        const images = document.querySelectorAll('.splash-image');
        const tagline = document.querySelector('.splash-tagline');

        gsap.set(images, { opacity: 1, y: 0 });
        if (tagline) {
            gsap.set(tagline, { opacity: 1, y: 0 });
        }
    },

    cleanup() {
        // Stop animation when leaving section
        if (this.timeline) {
            this.timeline.kill();
        }
    }
};
