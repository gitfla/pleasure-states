// Lazy load and manage video playback
// (For MVP Phase 1, we're using CSS gradients, but this will be useful in Phase 3)
const VideoLoader = {
    // Load videos marked with data-lazy-load
    loadLazyVideos(container) {
        const videos = container.querySelectorAll('video[data-lazy-load]');
        videos.forEach(video => {
            // Only load if not already loaded
            if (!video.dataset.loaded) {
                video.load();
                video.dataset.loaded = 'true';

                // Play when ready
                video.addEventListener('canplay', () => {
                    video.play().catch(err => {
                    });
                }, { once: true });
            }
        });
    },

    // Pause videos in container
    pauseVideos(container) {
        const videos = container.querySelectorAll('video');
        videos.forEach(video => video.pause());
    },

    // Play videos in container
    playVideos(container) {
        const videos = container.querySelectorAll('video');
        videos.forEach(video => {
            video.play().catch(err => {
            });
        });
    }
};
