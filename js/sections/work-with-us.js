// Work with us Section
const WorkWithUsSection = {
    timeline: null,

    init() {
        ScrollController.registerSection('work-with-us', {
            onEnter: () => this.onEnter(),
            onLeave: () => this.onLeave(),
            onAfterLeave: () => this.resetState(),
            onScrollAttempt: (direction) => {
                // Allow normal scroll behavior (no special handling)
                // User can scroll up to previous section
            }
        });
    },

    onEnter() {
        this.animateElements();
    },

    animateElements() {
        const headline = document.querySelector('.work-with-us-headline');
        const paragraphs = document.querySelectorAll('.contact-line');

        this.timeline = gsap.timeline();

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

    onLeave() {
        // Stop animation when leaving section
        if (this.timeline) {
            this.timeline.kill();
        }
    },

    resetState() {
        // Reset visual state after transition completes
        const headline = document.querySelector('.work-with-us-headline');
        const paragraphs = document.querySelectorAll('.contact-line');

        gsap.set(headline, { opacity: 0, y: 20 });
        gsap.set(paragraphs, { opacity: 0, y: 20 });
    }
};
