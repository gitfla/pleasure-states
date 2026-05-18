// What We Do Section
const WhatWeDoSection = {

    // Gesture tracking for boundary detection
    gestureStartBoundary: { atTop: false, atBottom: false },
    lastWheelTime: 0,
    GESTURE_TIMEOUT: 50,
    gestureHitBoundary: false,

    textContent: `We name things.

We write things.

We design the strategy behind things.

We look beyond the brief.

We make ideas feel inevitable.

We give shape to the stuff people feel but can't explain.

We imagine wildly and build truthfully.

We turn research into action.

We know the people shaping culture before it's obvious.

We build worlds that feel like places you want to live in.

We launch things that weren't there before.

We refresh stories to feel alive again.

We design partnerships that travel far.

We run workshops that crack things open.

We eat together.

We think fast when we need to. We work slow when it matters.

We're not an agency. We're a practice.

With a network. With taste. With teeth.`,

    init() {
        // Populate text immediately so it's visible when section slides in
        const typingContainer = document.getElementById('typingContent');
        if (typingContainer) typingContainer.textContent = this.textContent;

        ScrollController.registerSection('what-we-do', {
            onEnter: () => this.onEnter(),
            onLeave: () => {},
            onScrollAttempt: (direction) => this.onScrollAttempt(direction),
            isAtScrollBoundary: (direction) => this.isAtScrollBoundary(direction)
        });
    },

    onEnter() {
        const textBox = document.getElementById('typingTextBox');
        if (textBox) textBox.scrollTop = 0;
        this.gestureStartBoundary = this.checkCurrentBoundary();
        this.lastWheelTime = 0;
    },

    onScrollAttempt(direction) {
        return true;
    },

    checkCurrentBoundary() {
        const textBox = document.getElementById('typingTextBox');
        const typingContainer = document.getElementById('typingContent');

        if (!textBox || !typingContainer) {
            return { atTop: false, atBottom: false };
        }

        const scrollTop = textBox.scrollTop;
        const scrollHeight = typingContainer.scrollHeight;
        const clientHeight = textBox.clientHeight;

        if (scrollHeight <= clientHeight) {
            return { atTop: true, atBottom: true };
        }

        const atTop = scrollTop === 0;
        const atBottom = scrollTop >= (scrollHeight - clientHeight - 5);

        return { atTop, atBottom };
    },

    isNewGesture() {
        const now = Date.now();
        return (now - this.lastWheelTime) > this.GESTURE_TIMEOUT;
    },

    handleGestureStart() {
        this.gestureStartBoundary = this.checkCurrentBoundary();
        this.gestureHitBoundary = false;
    },

    isAtScrollBoundary(direction) {
        const currentBoundary = this.checkCurrentBoundary();

        if (direction === 1) {
            return this.gestureStartBoundary.atBottom && currentBoundary.atBottom;
        } else {
            return this.gestureStartBoundary.atTop && currentBoundary.atTop;
        }
    }
};
