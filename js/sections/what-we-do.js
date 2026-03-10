// What We Do Section
const WhatWeDoSection = {
    typingTimeline: null,
    isTyping: false,
    textContent: `We name things.

We write things.

We design the strategy behind things.

We help good ideas become clear ideas.

We give shape to the stuff people feel but can't explain.

We turn research into direction, not decks.

We build brand worlds people want to live in.

We help tired things feel alive again.

We think fast when we need to.

We work slow when it matters.

We plug into your team or bring our own.

We're a practice.
With a network. With taste. With teeth.`,

    init() {
        ScrollController.registerSection('what-we-do', {
            onEnter: () => this.onEnter(),
            onLeave: () => this.onLeave(),
            onAfterLeave: () => this.resetState(),
            onScrollAttempt: (direction) => this.onScrollAttempt(direction)
        });
    },

    onEnter() {
        console.log('WhatWeDoSection: onEnter() called');
        // Start typing effect
        this.startTyping();
    },

    startTyping() {
        console.log('WhatWeDoSection: startTyping() called');
        this.isTyping = true;

        const typingContainer = document.getElementById('typingContent');
        const textBox = document.getElementById('typingTextBox');

        console.log('WhatWeDoSection: typingContainer:', typingContainer);
        console.log('WhatWeDoSection: textBox:', textBox);

        typingContainer.textContent = ''; // Clear previous content
        gsap.set(typingContainer, { opacity: 1 }); // Reset opacity in case it was faded out

        const chars = this.textContent.split('');
        const charsPerSecond = 30;
        const delayPerChar = 1 / charsPerSecond;

        this.typingTimeline = gsap.timeline({
            onComplete: () => this.onTypingComplete()
        });

        let currentText = '';

        chars.forEach((char, index) => {
            this.typingTimeline.call(() => {
                currentText += char;
                typingContainer.textContent = currentText;

                // Auto-scroll text box if content overflows
                if (typingContainer.scrollHeight > textBox.clientHeight) {
                    textBox.scrollTop = typingContainer.scrollHeight - textBox.clientHeight;
                }
            }, [], delayPerChar * index);
        });
    },

    onTypingComplete() {
        this.isTyping = false;

        // Auto-advance after brief delay
        setTimeout(() => {
            ScrollController.advanceToNext();
        }, 1000);
    },

    onScrollAttempt(direction) {
        if (this.isTyping) {
            // User scrolled during typing - interrupt
            this.stopTyping();

            // Fade out text
            const typingContainer = document.getElementById('typingContent');
            gsap.to(typingContainer, {
                opacity: 0,
                duration: 0.3
            });
        }
    },

    stopTyping() {
        if (this.typingTimeline) {
            this.typingTimeline.kill();
            this.isTyping = false;
        }
    },

    onLeave() {
        // Stop typing animation when leaving section
        this.stopTyping();
    },

    resetState() {
        // Reset visual state after transition completes
        const typingContainer = document.getElementById('typingContent');
        if (typingContainer) {
            typingContainer.textContent = '';
            gsap.set(typingContainer, { opacity: 1 });
        }
    }
};
