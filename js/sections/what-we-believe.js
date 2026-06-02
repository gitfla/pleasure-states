// What we believe Section
const WhatWeBelieveSection = {

    init() {
        ScrollController.registerSection('what-we-believe', {
            onEnter: () => this.onEnter(),
            onLeave: () => {},
            onScrollAttempt: () => true
        });
    },

    onEnter() {
        const paragraphs = document.querySelectorAll('.philosophy-paragraph');

        // Restore last paragraph text if it was previously split into word spans
        const lastParagraph = paragraphs[6];
        if (lastParagraph && lastParagraph.dataset.originalText) {
            lastParagraph.textContent = lastParagraph.dataset.originalText;
        }

        gsap.set(paragraphs, { opacity: 1 });
    }
};
