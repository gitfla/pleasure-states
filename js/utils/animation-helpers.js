// Reusable animation patterns
const AnimationHelpers = {
    // Get animation config based on ScrollController settings (Mod 3)
    // Returns from/to objects for GSAP animations with optional vertical animation
    getAnimationFromTo() {
        const enableVertical = ScrollController?.config?.enableVerticalAnimation ?? true;

        return {
            from: {
                opacity: 0,
                ...(enableVertical ? { y: 20 } : {})
            },
            to: {
                opacity: 1,
                ...(enableVertical ? { y: 0 } : {}),
                duration: 0.8,
                ease: 'power2.out'
            }
        };
    },

    // Text reveal: Fade + slide up
    revealText(element, delay = 0) {
        return gsap.fromTo(element,
            {
                opacity: 0,
                y: 30,
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: delay,
                ease: 'power2.out'
            }
        );
    },

    // Typing effect
    typeText(targetElement, text, charsPerSecond = 30, onComplete = null) {
        const chars = text.split('');
        const delayPerChar = 1 / charsPerSecond;
        let currentText = '';

        const timeline = gsap.timeline({
            onComplete: onComplete
        });

        chars.forEach((char, index) => {
            timeline.call(() => {
                currentText += char;
                targetElement.textContent = currentText;
            }, [], delayPerChar * index);
        });

        return timeline; // Return for external control
    },

    // Fade out
    fadeOut(element, duration = 0.5, onComplete = null) {
        return gsap.to(element, {
            opacity: 0,
            duration: duration,
            ease: 'power2.inOut',
            onComplete: onComplete
        });
    },

    // Sequential reveals (for multiple elements)
    revealSequence(elements, stagger = 0.3) {
        return gsap.fromTo(elements,
            {
                opacity: 0,
                y: 30,
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: stagger,
                ease: 'power2.out'
            }
        );
    }
};
