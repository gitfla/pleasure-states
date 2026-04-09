// Mobile Menu Controller
const MobileMenuController = {
    init() {

        // Check if we're on mobile
        if (window.innerWidth > 768) {
            return; // Don't initialize on desktop
        }

        const menuToggle = document.getElementById('mobileMenuToggle');
        const menuOverlay = document.getElementById('mobileMenuOverlay');
        const menuClose = document.getElementById('mobileMenuClose');
        const menuItems = document.querySelectorAll('.mobile-menu-item');

        if (!menuToggle || !menuOverlay || !menuClose) {
            return;
        }

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

                // Special handling for work-with-us - go to part 2
                let searchId = targetSectionId;
                if (targetSectionId === 'work-with-us') {
                    searchId = 'work-with-us-2';
                }

                // Find target section
                const targetSection = ScrollController.sections.find(s => s.id === searchId);

                if (targetSection) {
                    // Close menu
                    this.closeMenu();

                    // Navigate to section
                    setTimeout(() => {
                        ScrollController.unlockScroll();
                        ScrollController.goToSection(targetSection.index);
                    }, 400); // Wait for menu close animation
                } else {
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

        if (menuToggle) {
            // Show menu on all sections except splash (index 0)
            if (currentSection > 0) {
                menuToggle.classList.add('visible');
            } else {
                menuToggle.classList.remove('visible');
            }
        } else {
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
