// Splash Section
const SplashSection = {
    timeline: null,
    hasAutoAdvanced: false,

    // ANIMATION TIMING CONSTANTS (reference base constants for consistency)
    ELEMENT_FADE_DURATION: TimingConstants.FADE_PARAGRAPH,  // 0.6s - Fade-in duration for images and tagline
    ELEMENT_DELAY: TimingConstants.DELAY_SHORT,             // 0.6s - Delay between element appearances
    FINAL_DELAY_MS: TimingConstants.DELAY_LONG * 1000,     // 2500ms - Delay after animation before auto-advance

    initVideo() {
        const video = document.querySelector('.splash-video');
        const poster = document.querySelector('.splash-video-poster');

        if (!video || !poster) {
            return;
        }

        // Randomly pick one of 3 splash video/poster pairs (desktop or mobile ratio)
        const isMobile = window.innerWidth <= 768;
        const variants = isMobile ? [
            { video: 'resources/splash-m1.mp4', poster: 'resources/splash-m1-poster.jpg' },
            { video: 'resources/splash-m2.mp4', poster: 'resources/splash-m2-poster.jpg' },
            { video: 'resources/splash-m3.mp4', poster: 'resources/splash-m3-poster.jpg' },
        ] : [
            { video: 'resources/splash-d1.mp4', poster: 'resources/splash-d1-poster.jpg' },
            { video: 'resources/splash-d2.mp4', poster: 'resources/splash-d2-poster.jpg' },
            { video: 'resources/splash-d3.mp4', poster: 'resources/splash-d3-poster.jpg' },
        ];
        const picked = window._splashVariant
            ? { video: `resources/${window._splashVariant}.mp4`, poster: `resources/${window._splashVariant}-poster.jpg` }
            : variants[Math.floor(Math.random() * variants.length)];
        poster.src = picked.poster;
        const source = video.querySelector('source');
        if (source) source.src = picked.video;
        else video.src = picked.video;

        // Explicitly start loading the video (ensures buffering for poster crossfade)
        video.load();

        const startPlayback = () => {

            // Reset to start
            video.currentTime = 0;

            // Set muted via JS property (iOS Safari requires this, not just the attribute)
            video.muted = true;

            video.play()
                .then(() => {

                    // Wait 120ms after playback starts
                    setTimeout(() => {

                        // Reveal video (fades in on top of poster)
                        video.classList.add('visible');

                    }, 120);
                })
                .catch(err => {
                    // Fallback: show video immediately if autoplay blocked
                    // Retry on user interaction is handled globally by initMobileVideoAutoplay()
                    video.classList.add('visible');
                });
        };

        // Wait for canplaythrough (stronger guarantee than canplay)
        if (video.readyState >= 4) {
            startPlayback();
        } else {
            video.addEventListener('canplaythrough', startPlayback, { once: true });
        }
    },

    init() {

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

        const pleasureImage = document.querySelector('.splash-image[data-line="1"]');
        const statesImage = document.querySelector('.splash-image[data-line="2"]');
        const tagline = document.querySelector('.splash-tagline');

        if (!pleasureImage || !statesImage || !tagline) {
            return;
        }

        // Get column 1 width (from computed CSS or direct measurement)
        const column1 = document.querySelector('.splash-white-column');
        if (!column1) {
            return;
        }

        const column1Width = column1.getBoundingClientRect().width;
        if (!column1Width || column1Width === 0) {
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
            return;
        }

        // Calculate PLEASURE dimensions (THE ANCHOR)
        const pleasureTargetWidth = column1Width - (2 * gutterValue);

        if (!pleasureImage.naturalWidth || !pleasureImage.naturalHeight) {
            requestAnimationFrame(() => this.sizeAndPositionImages());
            return;
        }

        const pleasureAspectRatio = pleasureImage.naturalWidth / pleasureImage.naturalHeight;
        const pleasureHeight = pleasureTargetWidth / pleasureAspectRatio;

        // Apply max-height constraint (e.g., 40vh as safety)
        const maxHeight = window.innerHeight * 0.4; // 40vh
        const finalPleasureHeight = Math.min(pleasureHeight, maxHeight);
        const finalPleasureWidth = finalPleasureHeight * pleasureAspectRatio;

        // Set PLEASURE dimensions
        pleasureImage.style.width = finalPleasureWidth + 'px';
        pleasureImage.style.height = finalPleasureHeight + 'px';

        // Calculate STATES dimensions (MATCHES PLEASURE HEIGHT)
        if (!statesImage.naturalWidth || !statesImage.naturalHeight) {
            requestAnimationFrame(() => this.sizeAndPositionImages());
            return;
        }

        const statesAspectRatio = statesImage.naturalWidth / statesImage.naturalHeight;
        const statesHeight = finalPleasureHeight; // Force match
        const statesWidth = statesHeight * statesAspectRatio;

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

        tagline.style.top = newTaglineTop + 'px';
        tagline.style.transform = 'none';

        // Force another reflow to ensure tagline is positioned
        tagline.offsetHeight;

        // Verify alignment
        const updatedTaglineRect = tagline.getBoundingClientRect();
        const diff = updatedTaglineRect.bottom - imageBottom;

        const endTime = performance.now();
    },

    playAnimation() {

        const isMobile = window.innerWidth <= 768;

        const images = document.querySelectorAll('.splash-image');
        const tagline = document.querySelector('.splash-tagline');
        const splashSection = document.getElementById('splash');

        if (!isMobile && images.length === 0) {
            return;
        }

        if (isMobile) {
            // Mobile: Animate CSS-generated logo and tagline
            this.startMobileTimeline(splashSection, tagline);
        } else {
            // Desktop: Wait for images to load, then size before animation starts
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
        }
    },

    startMobileTimeline(splashSection, tagline) {

        const mobileTagline = document.querySelector('.mobile-splash-tagline');
        const mobileArrow = document.querySelector('.mobile-splash-arrow');

        // Get viewport and computed values
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Calculate gutter in pixels (3.33vh)
        const gutterPx = viewportHeight * 0.0333; // 3.33vh

        // Calculate cell height
        const cellHeightPx = (viewportHeight - (8 * gutterPx)) / 7;

        // Calculate expected positions
        const logoExpectedTop = gutterPx + (cellHeightPx / 2);
        const taglineExpectedBottom = gutterPx + (cellHeightPx / 2);

        // Get actual positions and dimensions
        if (splashSection) {
            const beforeStyle = window.getComputedStyle(splashSection, '::before');
        }

        if (mobileTagline) {
            const taglineRect = mobileTagline.getBoundingClientRect();
            const taglineStyle = window.getComputedStyle(mobileTagline);

            // Calculate expected position
            const cellHeight = (viewportHeight - (8 * gutterPx)) / 7;
            const expectedBottom = gutterPx + (cellHeight / 2);
            const expectedTop = viewportHeight - expectedBottom;

        }

        if (mobileArrow) {
            const arrowRect = mobileArrow.getBoundingClientRect();
            const arrowStyle = window.getComputedStyle(mobileArrow);
        }

        this.timeline = gsap.timeline({
            onStart: () => {
            },
            onUpdate: () => {
                // Log progress every 10%
                const progress = this.timeline.progress();
                if (progress > 0 && progress % 0.1 < 0.01) {
                }
            },
            onComplete: () => {
                this.onAnimationComplete();
            }
        });

        // Show logo (::before pseudo-element via class)
        // Start after initial delay
        this.timeline.call(() => {
            const beforeOpacity = window.getComputedStyle(splashSection, '::before').opacity;

            splashSection.classList.add('logo-visible');

            // Check every 100ms for 1 second to see opacity transition
            let checks = 0;
            const checkInterval = setInterval(() => {
                checks++;
                const currentOpacity = window.getComputedStyle(splashSection, '::before').opacity;

                if (checks >= 10) {
                    clearInterval(checkInterval);
                }
            }, 100);
        }, null, `+=${this.ELEMENT_DELAY}`);

        // Show tagline - wait for logo fade duration (0.6s from CSS) + delay
        if (mobileTagline) {
            this.timeline.fromTo(mobileTagline,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: this.ELEMENT_FADE_DURATION,
                    ease: 'power2.out',
                    onStart: () => {
                    },
                    onUpdate: function() {
                        // Log opacity during animation (throttled)
                        if (this.progress() % 0.25 < 0.1) {
                        }
                    },
                    onComplete: () => {
                        const finalOpacity = window.getComputedStyle(mobileTagline).opacity;
                    }
                },
                `+=${this.ELEMENT_FADE_DURATION + this.ELEMENT_DELAY}` // Logo fade duration + delay
            );
        } else {
        }

        // Show arrow (same time as tagline)
        if (mobileArrow) {
            this.timeline.fromTo(mobileArrow,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: this.ELEMENT_FADE_DURATION,
                    ease: 'power2.out',
                    onStart: () => {
                    },
                    onComplete: () => {
                        const finalOpacity = window.getComputedStyle(mobileArrow).opacity;
                    }
                },
                '<' // Same time as tagline
            );
        } else {
        }

    },

    startTimeline(images, tagline) {

        // Pre-compute scroll indicator positions (same formula as updateScrollIndicator)
        const scrollIndicator = document.getElementById('scrollIndicator');
        const gutterPx = ScrollController.getGutterPx();
        const scrollBarHeight = Math.max(135, window.innerHeight * 0.2417);
        const topPosition = gutterPx; // what-we-believe position
        const bottomPosition = window.innerHeight - scrollBarHeight - gutterPx; // work-with-us position

        if (scrollIndicator) {
            // Disable CSS top transition so GSAP controls it during splash
            scrollIndicator.style.transition = 'opacity 0.6s ease';
            gsap.set(scrollIndicator, { top: bottomPosition });
        }

        const t0 = performance.now();
        const log = (label) => console.log(`[splash] ${label} @ ${((performance.now() - t0) / 1000).toFixed(2)}s`);

        this.timeline = gsap.timeline({
            onComplete: () => {
                this.onAnimationComplete();
            }
        });

        // "PLEASURE" image appears (with same delay as others)
        this.timeline.fromTo(images[0],
            { opacity: 0 },
            {
                opacity: 1,
                duration: this.ELEMENT_FADE_DURATION,
                ease: 'power2.out',
                onStart: () => log('PLEASURE start'),
                onComplete: () => log('PLEASURE end'),
            },
            `+=${this.ELEMENT_DELAY}`
        );

        // Scroll indicator fades in at same time as PLEASURE
        if (scrollIndicator) {
            this.timeline.to(scrollIndicator,
                {
                    opacity: 1,
                    duration: this.ELEMENT_FADE_DURATION,
                    ease: 'power2.out',
                },
                '<'
            );
        }

        // "STATES" image appears
        this.timeline.fromTo(images[1],
            { opacity: 0 },
            {
                opacity: 1,
                duration: this.ELEMENT_FADE_DURATION,
                ease: 'power2.out',
                onStart: () => log('STATES start'),
                onComplete: () => log('STATES end'),
            },
            `+=${this.ELEMENT_DELAY}`
        );

        // Scroll indicator moves from bottom to top, starting with STATES, arriving when tagline ends
        // Duration = ELEMENT_FADE_DURATION + ELEMENT_DELAY + ELEMENT_FADE_DURATION = 1.8s
        if (scrollIndicator) {
            this.timeline.to(scrollIndicator,
                {
                    top: topPosition,
                    duration: this.ELEMENT_FADE_DURATION + this.ELEMENT_DELAY + this.ELEMENT_FADE_DURATION,
                    ease: 'power1.inOut',
                    onStart: () => log('scrollbar move start'),
                    onComplete: () => log('scrollbar move end'),
                },
                '<'
            );
        }

        // "PLEASURE IS SERIOUS BUSINESS" appears
        // Use absolute time to prevent scrollbar tween (parallel, longer) from pushing tagline later.
        // Absolute time = delay + PLEASURE fade + delay + STATES fade + delay = 3.0s
        const taglineStart = this.ELEMENT_DELAY + this.ELEMENT_FADE_DURATION + this.ELEMENT_DELAY + this.ELEMENT_FADE_DURATION + this.ELEMENT_DELAY;
        if (tagline) {
            this.timeline.fromTo(tagline,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: this.ELEMENT_FADE_DURATION,
                    ease: 'power2.out',
                    onStart: () => log('tagline start'),
                    onComplete: () => log('tagline end'),
                },
                taglineStart
            );
        }
    },

    onAnimationComplete() {
        // Restore full CSS transition on scroll indicator so post-splash section changes animate
        const scrollIndicator = document.getElementById('scrollIndicator');
        if (scrollIndicator) {
            scrollIndicator.style.transition = '';
        }

        // Splash always auto-advances (not affected by autoAdvanceEnabled flag)
        if (!this.hasAutoAdvanced) {
            this.hasAutoAdvanced = true;
            setTimeout(() => {
                ScrollController.unlockScroll();
                ScrollController.advanceToNext();
            }, this.FINAL_DELAY_MS);
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
