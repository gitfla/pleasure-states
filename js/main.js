// Mobile video autoplay helper — explicitly calls .play() on visible mobile videos
// with retry on first user interaction (required for iOS Safari / Android Chrome)
function initMobileVideoAutoplay() {
    if (window.innerWidth > 768) return;

    const videos = document.querySelectorAll(
        '.splash-video, .what-we-do-video-container video, #work-with-us-1 .work-with-us-image-container video'
    );

    const failedVideos = [];

    videos.forEach(video => {
        // Set muted via JS property (some browsers check property, not attribute)
        video.muted = true;

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                failedVideos.push(video);
            });
        }
    });

    // Retry handler fires on first user interaction, by which time
    // the async .catch() callbacks above have populated failedVideos
    const retryAll = () => {
        failedVideos.forEach(v => {
            v.muted = true;
            v.play().catch(() => {});
        });
    };
    document.addEventListener('touchstart', retryAll, { once: true });
    document.addEventListener('click', retryAll, { once: true });

}

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

    // On mobile, remove sources from videos that are CSS-hidden to prevent unnecessary downloads
    if (window.innerWidth <= 768) {
        document.querySelectorAll(
            '.philosophy-video-container video, #work-with-us-2 .work-with-us-image-container video'
        ).forEach(video => {
            video.removeAttribute('autoplay');
            video.removeAttribute('preload');
            video.src = '';
            video.querySelectorAll('source').forEach(s => s.remove());
            video.load(); // Reset after removing sources
        });
    }

    // Explicitly play visible mobile videos (after hidden ones are stripped)
    initMobileVideoAutoplay();

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

    // Resume videos after returning from another app (mobile suspends media on background)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        document.querySelectorAll('video').forEach(v => {
            if (v.muted && v.paused) v.play().catch(() => {});
        });
    });
});
