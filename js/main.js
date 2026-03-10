// Main Entry Point - Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Pleasure States Initializing ===');

    // Initialize scroll controller first (master orchestrator)
    ScrollController.init();

    // Initialize all sections (registers callbacks with ScrollController)
    SplashSection.init();
    PhilosophySection.init();
    WhatWeDoSection.init();
    ContactSection.init();

    // Initialize menu
    MenuController.init();

    // Start the experience (triggers splash animation)
    ScrollController.start();

    // Log ready state
    console.log('=== Pleasure States initialized ===');
    console.log('Sections:', ScrollController.sections.length);
});
