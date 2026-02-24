// Main Entry Point - Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize scroll controller first (master orchestrator)
    ScrollController.init();

    // Initialize all sections
    SplashSection.init();
    PhilosophySection.init();
    WhatWeDoSection.init();
    ContactSection.init();

    // Initialize menu
    MenuController.init();

    // Log ready state
    console.log('Pleasure States initialized');
    console.log('Sections:', ScrollController.sections.length);
});
