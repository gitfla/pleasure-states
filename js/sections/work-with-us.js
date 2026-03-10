// Work with us Section
const WorkWithUsSection = {
    timeline: null,

    init() {
        ScrollController.registerSection('work-with-us', {
            onEnter: () => this.onEnter(),
            onLeave: () => this.onLeave(),
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
        const elements = document.querySelectorAll('.contact-line');

        this.timeline = gsap.timeline();

        elements.forEach((el, index) => {
            this.timeline.fromTo(el,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
                index === 0 ? 0 : '+=0.4'
            );
        });
    },

    onLeave() {
        if (this.timeline) {
            this.timeline.kill();
        }
    }
};
