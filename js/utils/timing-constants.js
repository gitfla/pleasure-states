// Global Animation Timing Constants
// These values are used across all sections and components for consistency
// All sections should reference these base constants to ensure visual consistency

const TimingConstants = {
    // DELAYS (time before things happen, in seconds)
    DELAY_SHORT: 0.6,               // Quick delay between sequential items
    DELAY_MEDIUM: 1.2,              // Standard pause (initial delays, between sections, auto-advance)
    DELAY_LONG: 2.5,                // Extended pause (splash final delay)

    // FADE DURATIONS (how long transitions take, in seconds)
    FADE_PARAGRAPH: 0.6,            // Standard content fade-in (also used for final states)
    FADE_WORD: 0.2,                 // Individual word fade-in

    // SPECIAL
    WORD_INSTANT_DELAY: 0.1,        // Essentially instant between words (no delay)

    // SECTION TRANSITIONS
    SECTION_TRANSITION_DURATION: 1.2, // Page transition duration (in seconds)
};