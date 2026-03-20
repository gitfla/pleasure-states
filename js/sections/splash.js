// Splash Section
const SplashSection = {
    timeline: null,
    hasAutoAdvanced: false,

    initVideo() {
        const video = document.querySelector('.splash-video');
        const poster = document.querySelector('.splash-video-poster');

        if (!video || !poster) {
            console.error('[VIDEO] Video or poster not found');
            return;
        }

        console.log('[VIDEO] Initiating aggressive preload');

        // Explicitly start loading the video
        video.load();

        const startPlayback = () => {
            console.log('[VIDEO] canplaythrough fired - video fully buffered');

            // Reset to start
            video.currentTime = 0;

            video.play()
                .then(() => {
                    console.log('[VIDEO] Playback started, waiting before reveal');

                    // Wait 120ms after playback starts
                    setTimeout(() => {
                        console.log('[VIDEO] Revealing video');

                        // Reveal video (fades in on top of poster)
                        video.classList.add('visible');

                    }, 120);
                })
                .catch(err => {
                    console.error('[VIDEO] Autoplay prevented:', err);
                    // Fallback: show video immediately if autoplay blocked
                    video.classList.add('visible');
                });
        };

        // Wait for canplaythrough (stronger guarantee than canplay)
        if (video.readyState >= 4) {
            console.log('[VIDEO] Already fully buffered (readyState:', video.readyState, ')');
            startPlayback();
        } else {
            console.log('[VIDEO] Waiting for canplaythrough event');
            video.addEventListener('canplaythrough', startPlayback, { once: true });
        }
    },

    init() {
        console.log('SplashSection: init() called');

        // Initialize video poster crossfade
        this.initVideo();

        // Wait for images to load before sizing
        const pleasureImage = document.querySelector('.splash-image[data-line="1"]');
        const statesImage = document.querySelector('.splash-image[data-line="2"]');

        const imagesLoaded = Promise.all([
            new Promise(resolve => {
                if (pleasureImage.complete) resolve();
                else pleasureImage.onload = resolve;
            }),
            new Promise(resolve => {
                if (statesImage.complete) resolve();
                else statesImage.onload = resolve;
            })
        ]);

        // Store promise for later use, don't call sizing here
        // (playAnimation will call it when needed)
        this.imagesLoaded = imagesLoaded;

        // Register with scroll controller
        ScrollController.registerSection('splash', {
            onEnter: (hasAnimated) => this.onEnter(hasAnimated),
            onLeave: () => this.cleanup(),
            onScrollAttempt: () => {
                // Ignore scroll attempts during splash
                // Scrolling is blocked by controller
            }
        });

        // Resize handler
        this.resizeHandler = () => {
            if (this.isActive) {
                this.sizeAndPositionImages();
            }
        };
        window.addEventListener('resize', this.resizeHandler);
    },

    onEnter(hasAnimated) {
        console.log('SplashSection: onEnter() called, hasAnimated:', hasAnimated);
        this.isActive = true;
        if (hasAnimated) {
            // Section was already animated - show final state immediately
            this.showFinalState();
        } else {
            // First visit - play animation
            this.playAnimation();
        }
    },

    sizeAndPositionImages() {
        const startTime = performance.now();
        console.log('[PERF] sizeAndPositionImages() started at', startTime.toFixed(2) + 'ms');

        const pleasureImage = document.querySelector('.splash-image[data-line="1"]');
        const statesImage = document.querySelector('.splash-image[data-line="2"]');
        const tagline = document.querySelector('.splash-tagline');

        if (!pleasureImage || !statesImage || !tagline) {
            console.error('Cannot find images or tagline');
            return;
        }

        // Get column 1 width (from computed CSS or direct measurement)
        const column1 = document.querySelector('.splash-white-column');
        if (!column1) {
            console.error('Cannot find column1 element');
            return;
        }

        const column1Width = column1.getBoundingClientRect().width;
        if (!column1Width || column1Width === 0) {
            console.error('Column1 has no width yet, delaying sizing');
            requestAnimationFrame(() => this.sizeAndPositionImages());
            return;
        }

        // Get gutter value (create temp element to get computed value of CSS variable)
        const temp = document.createElement('div');
        temp.style.visibility = 'hidden';
        temp.style.width = 'var(--gutter)';
        document.body.appendChild(temp);
        const gutterValue = parseFloat(getComputedStyle(temp).width);
        document.body.removeChild(temp);

        if (isNaN(gutterValue)) {
            console.error('Cannot parse gutter value');
            return;
        }

        // Calculate PLEASURE dimensions (THE ANCHOR)
        const pleasureTargetWidth = column1Width - (2 * gutterValue);

        if (!pleasureImage.naturalWidth || !pleasureImage.naturalHeight) {
            console.error('PLEASURE image dimensions not available yet');
            requestAnimationFrame(() => this.sizeAndPositionImages());
            return;
        }

        const pleasureAspectRatio = pleasureImage.naturalWidth / pleasureImage.naturalHeight;
        const pleasureHeight = pleasureTargetWidth / pleasureAspectRatio;

        // Apply max-height constraint (e.g., 40vh as safety)
        const maxHeight = window.innerHeight * 0.4; // 40vh
        const finalPleasureHeight = Math.min(pleasureHeight, maxHeight);
        const finalPleasureWidth = finalPleasureHeight * pleasureAspectRatio;

        console.log('PLEASURE sizing:', {
            targetWidth: pleasureTargetWidth,
            aspectRatio: pleasureAspectRatio,
            calculatedHeight: pleasureHeight,
            finalHeight: finalPleasureHeight,
            finalWidth: finalPleasureWidth
        });

        // Set PLEASURE dimensions
        pleasureImage.style.width = finalPleasureWidth + 'px';
        pleasureImage.style.height = finalPleasureHeight + 'px';

        // Calculate STATES dimensions (MATCHES PLEASURE HEIGHT)
        if (!statesImage.naturalWidth || !statesImage.naturalHeight) {
            console.error('STATES image dimensions not available yet');
            requestAnimationFrame(() => this.sizeAndPositionImages());
            return;
        }

        const statesAspectRatio = statesImage.naturalWidth / statesImage.naturalHeight;
        const statesHeight = finalPleasureHeight; // Force match
        const statesWidth = statesHeight * statesAspectRatio;

        console.log('STATES sizing:', {
            aspectRatio: statesAspectRatio,
            height: statesHeight,
            width: statesWidth
        });

        // Set STATES dimensions
        statesImage.style.width = statesWidth + 'px';
        statesImage.style.height = statesHeight + 'px';

        // Force synchronous layout calculation
        // This ensures all sizing is done before we continue
        pleasureImage.offsetHeight; // Force reflow
        statesImage.offsetHeight;

        // Position tagline to align bottom with images
        const pleasureRect = pleasureImage.getBoundingClientRect();
        const statesRect = statesImage.getBoundingClientRect();
        const taglineRect = tagline.getBoundingClientRect();

        // Use PLEASURE bottom as reference (should match STATES)
        const imageBottom = pleasureRect.bottom;
        const newTaglineTop = imageBottom - taglineRect.height;

        console.log('Positioning tagline:', {
            pleasureBottom: pleasureRect.bottom,
            statesBottom: statesRect.bottom,
            taglineHeight: taglineRect.height,
            newTop: newTaglineTop
        });

        tagline.style.top = newTaglineTop + 'px';
        tagline.style.transform = 'none';

        // Force another reflow to ensure tagline is positioned
        tagline.offsetHeight;

        // Verify alignment
        const updatedTaglineRect = tagline.getBoundingClientRect();
        const diff = updatedTaglineRect.bottom - imageBottom;
        console.log('Alignment check:', diff === 0 ? '✓ ALIGNED' : `✗ Off by ${diff}px`);

        const endTime = performance.now();
        console.log('[PERF] sizeAndPositionImages() completed in', (endTime - startTime).toFixed(2) + 'ms');
    },

    playAnimation() {
        console.log('SplashSection: playAnimation() called');
        const images = document.querySelectorAll('.splash-image');
        const tagline = document.querySelector('.splash-tagline');
        console.log('SplashSection: Found', images.length, 'image elements');

        if (images.length === 0) {
            console.error('SplashSection: No .splash-image elements found!');
            return;
        }

        // Wait for images to load, then size before animation starts
        if (this.imagesLoaded) {
            this.imagesLoaded.then(() => {
                // Size elements first
                this.sizeAndPositionImages();

                // Wait for compositor to finish layout before starting animation
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.startTimeline(images, tagline);
                    });
                });
            });
        } else {
            // Fallback if imagesLoaded not available
            this.sizeAndPositionImages();
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.startTimeline(images, tagline);
                });
            });
        }
    },

    startTimeline(images, tagline) {

        this.timeline = gsap.timeline({
            onStart: () => console.log('[PERF] Animation timeline started at', performance.now().toFixed(2) + 'ms'),
            onComplete: () => {
                console.log('[PERF] Animation timeline completed at', performance.now().toFixed(2) + 'ms');
                this.onAnimationComplete();
            }
        });

        // "PLEASURE" image appears (with same delay as others)
        this.timeline.fromTo(images[0],
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out',
                onStart: () => console.log('[PERF] PLEASURE animation started at', performance.now().toFixed(2) + 'ms'),
                onComplete: () => console.log('[PERF] PLEASURE animation completed at', performance.now().toFixed(2) + 'ms')
            },
            '+=0.25'
        );

        // "STATES" image appears
        this.timeline.fromTo(images[1],
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out',
                onStart: () => console.log('[PERF] STATES animation started at', performance.now().toFixed(2) + 'ms'),
                onComplete: () => console.log('[PERF] STATES animation completed at', performance.now().toFixed(2) + 'ms')
            },
            '+=0.25'
        );

        // "PLEASURE IS SERIOUS BUSINESS" appears
        if (tagline) {
            this.timeline.fromTo(tagline,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.4,
                    ease: 'power2.out',
                    onStart: () => console.log('[PERF] Tagline animation started at', performance.now().toFixed(2) + 'ms'),
                    onComplete: () => console.log('[PERF] Tagline animation completed at', performance.now().toFixed(2) + 'ms')
                },
                '+=0.25'
            );
        }
    },

    onAnimationComplete() {
        // Splash always auto-advances (not affected by autoAdvanceEnabled flag)
        if (!this.hasAutoAdvanced) {
            this.hasAutoAdvanced = true;
            setTimeout(() => {
                ScrollController.unlockScroll();
                ScrollController.advanceToNext();
            }, 1000);
        }
    },

    showFinalState() {
        // Set all animated elements to their final state immediately
        const images = document.querySelectorAll('.splash-image');
        const tagline = document.querySelector('.splash-tagline');

        // Wait for images to load before sizing
        const doSizing = () => {
            this.sizeAndPositionImages();
            // Set opacity after sizing is complete
            gsap.set(images, { opacity: 1 });
            if (tagline) {
                gsap.set(tagline, { opacity: 1 });
            }
        };

        if (this.imagesLoaded) {
            this.imagesLoaded.then(doSizing);
        } else {
            doSizing();
        }
    },

    cleanup() {
        this.isActive = false;

        // Stop animation when leaving section
        if (this.timeline) {
            this.timeline.kill();
        }

        // Remove resize listener
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
    }
};
