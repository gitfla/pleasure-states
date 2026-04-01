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
        console.log('[SPLASH] ========================================');
        console.log('[SPLASH] playAnimation() called');
        console.log('[SPLASH] Window dimensions:', window.innerWidth, 'x', window.innerHeight);

        const isMobile = window.innerWidth <= 768;
        console.log('[SPLASH] isMobile:', isMobile);

        const images = document.querySelectorAll('.splash-image');
        const tagline = document.querySelector('.splash-tagline');
        const splashSection = document.getElementById('splash');

        console.log('[SPLASH] Found', images.length, 'image elements');
        console.log('[SPLASH] Elements:', {
            tagline: !!tagline,
            splashSection: !!splashSection
        });

        if (!isMobile && images.length === 0) {
            console.error('[SPLASH] No .splash-image elements found!');
            return;
        }

        if (isMobile) {
            console.log('[SPLASH] Taking MOBILE path');
            // Mobile: Animate CSS-generated logo and tagline
            this.startMobileTimeline(splashSection, tagline);
        } else {
            console.log('[SPLASH] Taking DESKTOP path');
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
        console.log('[MOBILE SPLASH] ========================================');
        console.log('[MOBILE SPLASH] startMobileTimeline() called');
        console.log('[MOBILE SPLASH] Timing constants:', {
            ELEMENT_FADE_DURATION: this.ELEMENT_FADE_DURATION,
            ELEMENT_DELAY: this.ELEMENT_DELAY,
            FINAL_DELAY_MS: this.FINAL_DELAY_MS
        });

        const mobileTagline = document.querySelector('.mobile-splash-tagline');
        const mobileArrow = document.querySelector('.mobile-splash-arrow');

        console.log('[MOBILE SPLASH] Elements found:', {
            splashSection: !!splashSection,
            mobileTagline: !!mobileTagline,
            mobileArrow: !!mobileArrow
        });

        // Get viewport and computed values
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Calculate gutter in pixels (3.33vh)
        const gutterPx = viewportHeight * 0.0333; // 3.33vh

        // Calculate cell height
        const cellHeightPx = (viewportHeight - (8 * gutterPx)) / 7;

        console.log('[MOBILE SPLASH] Viewport:', {
            width: viewportWidth,
            height: viewportHeight
        });

        console.log('[MOBILE SPLASH] CSS Variables:', {
            gutterVh: '3.33vh',
            gutterPx: gutterPx,
            cellHeightPx: cellHeightPx,
            totalGutterSpace: 8 * gutterPx,
            totalCellSpace: 7 * cellHeightPx
        });

        // Calculate expected positions
        const logoExpectedTop = gutterPx + (cellHeightPx / 2);
        const taglineExpectedBottom = gutterPx + (cellHeightPx / 2);

        console.log('[MOBILE SPLASH] Expected positions:', {
            logoTop: logoExpectedTop + 'px (gutter + cellHeight/2)',
            taglineBottom: taglineExpectedBottom + 'px (gutter + cellHeight/2)',
            arrowBottom: (gutterPx / 2) + 'px'
        });

        // Get actual positions and dimensions
        if (splashSection) {
            const beforeStyle = window.getComputedStyle(splashSection, '::before');
            console.log('[MOBILE SPLASH] Logo ::before computed styles:', {
                top: beforeStyle.top,
                left: beforeStyle.left,
                width: beforeStyle.width,
                height: beforeStyle.height,
                opacity: beforeStyle.opacity,
                backgroundImage: beforeStyle.backgroundImage
            });
        }

        if (mobileTagline) {
            const taglineRect = mobileTagline.getBoundingClientRect();
            const taglineStyle = window.getComputedStyle(mobileTagline);

            // Calculate expected position
            const cellHeight = (viewportHeight - (8 * gutterPx)) / 7;
            const expectedBottom = gutterPx + (cellHeight / 2);
            const expectedTop = viewportHeight - expectedBottom;

            console.log('[MOBILE SPLASH] Tagline positioning analysis:', {
                viewport: {
                    height: viewportHeight,
                    width: viewportWidth
                },
                calculations: {
                    gutterPx: gutterPx,
                    cellHeight: cellHeight,
                    expectedBottom: expectedBottom + 'px (from bottom)',
                    expectedTop: expectedTop + 'px (from top)'
                },
                actualCSS: {
                    bottom: taglineStyle.bottom,
                    top: taglineStyle.top,
                    left: taglineStyle.left,
                    transform: taglineStyle.transform
                },
                actualPosition: {
                    top: taglineRect.top,
                    bottom: taglineRect.bottom,
                    left: taglineRect.left,
                    right: taglineRect.right,
                    width: taglineRect.width,
                    height: taglineRect.height
                },
                visibility: {
                    visibleInViewport: taglineRect.bottom > 0 && taglineRect.top < viewportHeight,
                    topInView: taglineRect.top >= 0 && taglineRect.top < viewportHeight,
                    bottomInView: taglineRect.bottom > 0 && taglineRect.bottom <= viewportHeight,
                    completelyVisible: taglineRect.top >= 0 && taglineRect.bottom <= viewportHeight
                }
            });
        }

        if (mobileArrow) {
            const arrowRect = mobileArrow.getBoundingClientRect();
            const arrowStyle = window.getComputedStyle(mobileArrow);
            console.log('[MOBILE SPLASH] Arrow element:', {
                bottom: arrowStyle.bottom,
                right: arrowStyle.right,
                width: arrowStyle.width,
                height: arrowStyle.height,
                opacity: arrowStyle.opacity,
                boundingRect: {
                    top: arrowRect.top,
                    bottom: arrowRect.bottom,
                    left: arrowRect.left,
                    right: arrowRect.right
                },
                visibleInViewport: arrowRect.bottom > 0 && arrowRect.top < viewportHeight
            });
        }

        this.timeline = gsap.timeline({
            onStart: () => {
                console.log('[MOBILE SPLASH] ⏱️ Timeline started at', performance.now().toFixed(2) + 'ms');
            },
            onUpdate: () => {
                // Log progress every 10%
                const progress = this.timeline.progress();
                if (progress > 0 && progress % 0.1 < 0.01) {
                    console.log('[MOBILE SPLASH] ⏱️ Timeline progress:', (progress * 100).toFixed(0) + '%');
                }
            },
            onComplete: () => {
                console.log('[MOBILE SPLASH] ⏱️ Timeline completed at', performance.now().toFixed(2) + 'ms');
                this.onAnimationComplete();
            }
        });

        // Show logo (::before pseudo-element via class)
        // Start after initial delay
        this.timeline.call(() => {
            const beforeOpacity = window.getComputedStyle(splashSection, '::before').opacity;
            console.log('[MOBILE SPLASH] 🎨 LOGO: Adding logo-visible class');
            console.log('[MOBILE SPLASH] 🎨 LOGO: Opacity BEFORE class:', beforeOpacity);
            console.log('[MOBILE SPLASH] 🎨 LOGO: Time:', performance.now().toFixed(2) + 'ms');

            splashSection.classList.add('logo-visible');

            // Check every 100ms for 1 second to see opacity transition
            let checks = 0;
            const checkInterval = setInterval(() => {
                checks++;
                const currentOpacity = window.getComputedStyle(splashSection, '::before').opacity;
                console.log(`[MOBILE SPLASH] 🎨 LOGO: Opacity check ${checks}: ${currentOpacity}`);

                if (checks >= 10) {
                    clearInterval(checkInterval);
                    console.log('[MOBILE SPLASH] 🎨 LOGO: Final opacity:', currentOpacity);
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
                        console.log('[MOBILE SPLASH] 📝 TAGLINE: Animation started');
                        console.log('[MOBILE SPLASH] 📝 TAGLINE: Time:', performance.now().toFixed(2) + 'ms');
                        console.log('[MOBILE SPLASH] 📝 TAGLINE: Initial opacity:', window.getComputedStyle(mobileTagline).opacity);
                    },
                    onUpdate: function() {
                        // Log opacity during animation (throttled)
                        if (this.progress() % 0.25 < 0.1) {
                            console.log('[MOBILE SPLASH] 📝 TAGLINE: Progress:', (this.progress() * 100).toFixed(0) + '%, Opacity:', window.getComputedStyle(mobileTagline).opacity);
                        }
                    },
                    onComplete: () => {
                        const finalOpacity = window.getComputedStyle(mobileTagline).opacity;
                        console.log('[MOBILE SPLASH] 📝 TAGLINE: Animation completed');
                        console.log('[MOBILE SPLASH] 📝 TAGLINE: Time:', performance.now().toFixed(2) + 'ms');
                        console.log('[MOBILE SPLASH] 📝 TAGLINE: Final opacity:', finalOpacity);
                        console.log('[MOBILE SPLASH] 📝 TAGLINE: Text content:', mobileTagline.textContent);
                    }
                },
                `+=${this.ELEMENT_FADE_DURATION + this.ELEMENT_DELAY}` // Logo fade duration + delay
            );
        } else {
            console.warn('[MOBILE SPLASH] ⚠️ Mobile tagline element not found!');
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
                        console.log('[MOBILE SPLASH] ➡️ ARROW: Animation started');
                        console.log('[MOBILE SPLASH] ➡️ ARROW: Time:', performance.now().toFixed(2) + 'ms');
                    },
                    onComplete: () => {
                        const finalOpacity = window.getComputedStyle(mobileArrow).opacity;
                        console.log('[MOBILE SPLASH] ➡️ ARROW: Animation completed');
                        console.log('[MOBILE SPLASH] ➡️ ARROW: Time:', performance.now().toFixed(2) + 'ms');
                        console.log('[MOBILE SPLASH] ➡️ ARROW: Final opacity:', finalOpacity);
                    }
                },
                '<' // Same time as tagline
            );
        } else {
            console.warn('[MOBILE SPLASH] ⚠️ Mobile arrow element not found!');
        }

        console.log('[MOBILE SPLASH] Timeline setup complete');
        console.log('[MOBILE SPLASH] ========================================');
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
                duration: this.ELEMENT_FADE_DURATION,
                ease: 'power2.out',
                onStart: () => console.log('[PERF] PLEASURE animation started at', performance.now().toFixed(2) + 'ms'),
                onComplete: () => console.log('[PERF] PLEASURE animation completed at', performance.now().toFixed(2) + 'ms')
            },
            `+=${this.ELEMENT_DELAY}`
        );

        // "STATES" image appears
        this.timeline.fromTo(images[1],
            { opacity: 0 },
            {
                opacity: 1,
                duration: this.ELEMENT_FADE_DURATION,
                ease: 'power2.out',
                onStart: () => console.log('[PERF] STATES animation started at', performance.now().toFixed(2) + 'ms'),
                onComplete: () => console.log('[PERF] STATES animation completed at', performance.now().toFixed(2) + 'ms')
            },
            `+=${this.ELEMENT_DELAY}`
        );

        // "PLEASURE IS SERIOUS BUSINESS" appears
        if (tagline) {
            this.timeline.fromTo(tagline,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: this.ELEMENT_FADE_DURATION,
                    ease: 'power2.out',
                    onStart: () => console.log('[PERF] Tagline animation started at', performance.now().toFixed(2) + 'ms'),
                    onComplete: () => console.log('[PERF] Tagline animation completed at', performance.now().toFixed(2) + 'ms')
                },
                `+=${this.ELEMENT_DELAY}`
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
