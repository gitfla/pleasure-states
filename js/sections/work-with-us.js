// Work with us Section
const WorkWithUsSection = {
    timeline: null,
    isAnimating: false,

    init() {
        ScrollController.registerSection('work-with-us', {
            onEnter: (hasAnimated) => this.onEnter(hasAnimated),
            onLeave: () => this.onLeave(),
            onScrollAttempt: (direction) => this.onScrollAttempt(direction)
        });
    },

    onEnter(hasAnimated) {
        console.log('WorkWithUsSection: onEnter() called, hasAnimated:', hasAnimated);
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

        this.timeline = gsap.timeline({
            onComplete: () => { this.isAnimating = false; }
        });

        // First animate the headline on the left
        this.timeline.fromTo(headline,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );

        // Then animate each paragraph on the right, one by one
        paragraphs.forEach((el, index) => {
            this.timeline.fromTo(el,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
                '+=0.4'
            );
        });
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
        const headline = document.querySelector('.work-with-us-headline');
        const paragraphs = document.querySelectorAll('.contact-line');

        gsap.set(headline, { opacity: 1, y: 0 });
        gsap.set(paragraphs, { opacity: 1, y: 0 });
    },

    onLeave() {
        // Stop animation when leaving section
        this.stopAnimation();
    }
};
