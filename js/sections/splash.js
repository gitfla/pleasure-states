// Splash Section
const SplashSection = {
    timeline: null,

    init() {
        console.log('SplashSection: init() called');
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
        console.log('SplashSection: playAnimation() called');
        const lines = document.querySelectorAll('.splash-line');
        console.log('SplashSection: Found', lines.length, 'text lines');

        if (lines.length === 0) {
            console.error('SplashSection: No .splash-line elements found!');
            return;
        }

        this.timeline = gsap.timeline({
            onStart: () => console.log('SplashSection: Animation timeline started'),
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
