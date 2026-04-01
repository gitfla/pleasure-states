// Mobile Menu Controller
const MobileMenuController = {
    init() {
        console.log('[MOBILE MENU] ========================================');
        console.log('[MOBILE MENU] Initializing mobile menu');
        console.log('[MOBILE MENU] Window width:', window.innerWidth);

        // Check if we're on mobile
        if (window.innerWidth > 768) {
            console.log('[MOBILE MENU] Desktop detected, skipping mobile menu init');
            return; // Don't initialize on desktop
        }

        const menuToggle = document.getElementById('mobileMenuToggle');
        const menuOverlay = document.getElementById('mobileMenuOverlay');
        const menuClose = document.getElementById('mobileMenuClose');
        const menuItems = document.querySelectorAll('.mobile-menu-item');

        console.log('[MOBILE MENU] Elements found:', {
            menuToggle: !!menuToggle,
            menuOverlay: !!menuOverlay,
            menuClose: !!menuClose,
            menuItems: menuItems.length
        });

        if (!menuToggle || !menuOverlay || !menuClose) {
            console.error('[MOBILE MENU] Mobile menu elements not found');
            return;
        }

        console.log('[MOBILE MENU] Menu toggle initial state:', {
            opacity: window.getComputedStyle(menuToggle).opacity,
            display: window.getComputedStyle(menuToggle).display,
            classes: menuToggle.className
        });

        // Open menu
        menuToggle.addEventListener('click', () => {
            this.openMenu();
        });

        // Close menu
        menuClose.addEventListener('click', () => {
            this.closeMenu();
        });

        // Handle menu item clicks
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetSectionId = e.target.dataset.target;
                console.log('Mobile menu clicked:', targetSectionId);

                // Special handling for work-with-us - go to part 2
                let searchId = targetSectionId;
                if (targetSectionId === 'work-with-us') {
                    searchId = 'work-with-us-2';
                }

                // Find target section
                const targetSection = ScrollController.sections.find(s => s.id === searchId);

                console.log('Found section:', targetSection ? targetSection.id : 'NOT FOUND');

                if (targetSection) {
                    // Close menu
                    this.closeMenu();

                    // Navigate to section
                    setTimeout(() => {
                        ScrollController.unlockScroll();
                        ScrollController.goToSection(targetSection.index);
                    }, 400); // Wait for menu close animation
                } else {
                    console.error('Mobile menu: Could not find section with id:', searchId);
                }
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
                this.closeMenu();
            }
        });

        // Listen for section changes to show/hide menu toggle
        this.updateMenuVisibility();
    },

    updateMenuVisibility() {
        // Called when section changes
        const currentSection = ScrollController.currentSection;
        const menuToggle = document.getElementById('mobileMenuToggle');

        console.log('[MOBILE MENU] updateMenuVisibility called');
        console.log('[MOBILE MENU] Current section index:', currentSection);

        if (menuToggle) {
            // Show menu on all sections except splash (index 0)
            if (currentSection > 0) {
                console.log('[MOBILE MENU] Showing menu toggle (section > 0)');
                menuToggle.classList.add('visible');
                console.log('[MOBILE MENU] Menu toggle state after show:', {
                    opacity: window.getComputedStyle(menuToggle).opacity,
                    classes: menuToggle.className
                });
            } else {
                console.log('[MOBILE MENU] Hiding menu toggle (section = 0)');
                menuToggle.classList.remove('visible');
            }
        } else {
            console.warn('[MOBILE MENU] Menu toggle element not found in updateMenuVisibility');
        }
    },

    openMenu() {
        const menuOverlay = document.getElementById('mobileMenuOverlay');
        const menuToggle = document.getElementById('mobileMenuToggle');

        if (menuOverlay) {
            menuOverlay.classList.add('active');
        }

        // Optionally hide the toggle while menu is open
        if (menuToggle) {
            menuToggle.style.opacity = '0';
            menuToggle.style.pointerEvents = 'none';
        }
    },

    closeMenu() {
        const menuOverlay = document.getElementById('mobileMenuOverlay');
        const menuToggle = document.getElementById('mobileMenuToggle');

        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }

        // Show toggle again
        if (menuToggle) {
            menuToggle.style.opacity = '1';
            menuToggle.style.pointerEvents = 'auto';
        }
    }
};
