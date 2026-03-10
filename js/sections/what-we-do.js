// What We Do Section
const WhatWeDoSection = {
    typingTimeline: null,
    isTyping: false,
    textContent: `We craft experiences that transform how people engage with the world around them.

Our work spans digital and physical spaces, creating immersive environments that tell stories, evoke emotions, and inspire action.

From interactive installations to web experiences, we blend creativity with technology to push boundaries and explore new possibilities.

We believe that the best work emerges from collaboration, curiosity, and a willingness to experiment with the unexpected.

Each project is an opportunity to discover something new—about our craft, our clients, and ourselves.`,

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
