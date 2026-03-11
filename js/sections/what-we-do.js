// What We Do Section
const WhatWeDoSection = {
    typingTimeline: null,
    isTyping: false,
    hasAutoAdvanced: false,
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
            onEnter: (hasAnimated) => this.onEnter(hasAnimated),
            onLeave: () => this.onLeave(),
            onScrollAttempt: (direction) => this.onScrollAttempt(direction)
        });
    },

    onEnter(hasAnimated) {
        console.log('WhatWeDoSection: onEnter() called, hasAnimated:', hasAnimated);
        if (hasAnimated) {
            // Section was already animated - show final state immediately
            this.showFinalState();
        } else {
            // First visit - play typing animation
            this.startTyping();
        }
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

        // Split by whitespace while preserving spaces and newlines
        const parts = this.textContent.split(/(\s+)/);
        const wordsPerSecond = 8; // Adjust speed for word-by-word
        const delayPerWord = 1 / wordsPerSecond;

        this.typingTimeline = gsap.timeline({
            onComplete: () => this.onTypingComplete()
        });

        let currentText = '';

        parts.forEach((part, index) => {
            this.typingTimeline.call(() => {
                currentText += part;
                typingContainer.textContent = currentText;

                // Auto-scroll text box if content overflows
                if (typingContainer.scrollHeight > textBox.clientHeight) {
                    textBox.scrollTop = typingContainer.scrollHeight - textBox.clientHeight;
                }
            }, [], delayPerWord * index);
        });
    },

    onTypingComplete() {
        this.isTyping = false;

        // Only auto-advance on first visit
        if (!this.hasAutoAdvanced) {
            this.hasAutoAdvanced = true;
            setTimeout(() => {
                ScrollController.advanceToNext();
            }, 1000);
        }
    },

    onScrollAttempt(direction) {
        if (this.isTyping) {
            // User scrolled during typing - stop and skip to final state
            this.stopTyping();
            this.showFinalState();
        }
    },

    stopTyping() {
        if (this.typingTimeline) {
            this.typingTimeline.kill();
            this.isTyping = false;
        }
    },

    showFinalState() {
        // Set typing content to full text immediately
        const typingContainer = document.getElementById('typingContent');
        if (typingContainer) {
            typingContainer.textContent = this.textContent;
            gsap.set(typingContainer, { opacity: 1 });
        }
    },

    onLeave() {
        // Stop typing animation when leaving section
        this.stopTyping();
    }
};
