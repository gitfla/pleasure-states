// Splash Section
const SplashSection = {
    timeline: null,

    init() {
        // Register with scroll controller
        ScrollController.registerSection('splash', {
            onEnter: () => this.playAnimation(),
            onLeave: () => this.cleanup(),
            onScrollAttempt: () => {
                // Ignore scroll attempts during splash
                // Scrolling is blocked by controller
            }
        });
    },

    playAnimation() {
        const lines = document.querySelectorAll('.splash-line');

        this.timeline = gsap.timeline({
            onComplete: () => this.onAnimationComplete()
        });

        // Line 1 appears
        this.timeline.fromTo(lines[0],
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }
        );

        // Line 2 appears
        this.timeline.fromTo(lines[1],
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: 'power2.out' },
            '+=0.5' // 0.5s after previous animation
        );

        // Line 3 appears
        this.timeline.fromTo(lines[2],
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: 'power2.out' },
            '+=0.5'
        );
    },

    onAnimationComplete() {
        // Wait 1 second, then scroll to next section
        setTimeout(() => {
            ScrollController.unlockScroll();
            ScrollController.advanceToNext();
        }, 1000);
    },

    cleanup() {
        if (this.timeline) {
            this.timeline.kill();
        }
    }
};
