// Work with us Section
const WorkWithUsSection = {

    init() {
        ScrollController.registerSection('work-with-us-1', {
            onEnter: () => this.onEnter1(),

            onScrollAttempt: () => true
        });

        ScrollController.registerSection('work-with-us-2', {
            onEnter: () => this.onEnter2(),

            onScrollAttempt: () => true
        });

        this.initCtaButton();
    },

    initCtaButton() {
        const btn = document.getElementById('ctaButton');
        if (!btn) return;
        // On mobile (no hover state), tapping the div opens email.
        // On desktop, inner <a> tags handle their own navigation.
        btn.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            // On desktop, clicking the button background (outside the links) does nothing.
            // On mobile, the hover layer is hidden so any tap opens email.
            const hoverLayer = btn.querySelector('.cta-hover');
            if (hoverLayer && getComputedStyle(hoverLayer).display === 'none') {
                window.location.href = 'mailto:hello@pleasurestates.com';
            }
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = 'mailto:hello@pleasurestates.com';
            }
        });
    },

    onEnter1() {
        const headline = document.querySelector('#work-with-us-1 .work-with-us-headline');
        if (headline) gsap.set(headline, { opacity: 1 });
    },

    onEnter2() {
        const headline = document.querySelector('#work-with-us-2 .work-with-us-headline');
        const paragraphs = document.querySelectorAll('#work-with-us-2 .contact-line');

        if (headline) gsap.set(headline, { opacity: 1 });
        gsap.set(paragraphs, { opacity: 1 });
    }
};
