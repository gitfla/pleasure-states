// Logo visibility handler - updated to work with scroll controller
function updateLogoVisibility(sectionIndex) {
    const logo = document.getElementById('siteLogo');
    if (!logo) return;

    // Show logo on all sections except splash (index 0)
    if (sectionIndex > 0) {
        logo.classList.add('visible');
    } else {
        logo.classList.remove('visible');
    }

    // Also update mobile menu visibility
    if (typeof MobileMenuController !== 'undefined' && MobileMenuController.updateMenuVisibility) {
        MobileMenuController.updateMenuVisibility();
    }
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

    // Initialize menu (desktop and mobile)
    MenuController.init();
    if (typeof MobileMenuController !== 'undefined') {
        MobileMenuController.init();
    }

    // Start the experience (triggers splash animation)
    ScrollController.start();

    // Log ready state
    console.log('=== Pleasure States initialized ===');
    console.log('Sections:', ScrollController.sections.length);
});
