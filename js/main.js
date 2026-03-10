// Logo visibility handler
function initLogoVisibility() {
    const logo = document.getElementById('siteLogo');
    if (!logo) return;

    // Hide logo initially (on splash)
    logo.classList.remove('visible');

    // Show/hide logo based on scroll position
    window.addEventListener('scroll', () => {
        const splashSection = document.getElementById('splash');
        if (!splashSection) return;

        const splashBottom = splashSection.offsetTop + splashSection.offsetHeight;
        const scrollPosition = window.scrollY;

        if (scrollPosition > splashBottom - 100) {
            logo.classList.add('visible');
        } else {
            logo.classList.remove('visible');
        }
    });
}

// Main Entry Point - Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Pleasure States Initializing ===');

    // Initialize scroll controller first (master orchestrator)
    ScrollController.init();

    // Initialize all sections (registers callbacks with ScrollController)
    SplashSection.init();
    WhatWeBelieveSection.init();
    WhatWeDoSection.init();
    WorkWithUsSection.init();

    // Initialize menu
    MenuController.init();

    // Initialize logo visibility
    initLogoVisibility();

    // Start the experience (triggers splash animation)
    ScrollController.start();

    // Log ready state
    console.log('=== Pleasure States initialized ===');
    console.log('Sections:', ScrollController.sections.length);
});
