// Navigation Menu Controller
const MenuController = {
    init() {
        const menuItems = document.querySelectorAll('.menu-item');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetSectionId = e.target.dataset.target;
                console.log('Menu clicked:', targetSectionId);

                // Find section by menu target OR by id
                // Use getAttribute as fallback for better browser compatibility
                const targetSection = ScrollController.sections.find(s => {
                    const menuTarget = s.element.dataset.menuTarget || s.element.getAttribute('data-menu-target');
                    return menuTarget === targetSectionId || s.id === targetSectionId;
                });
                console.log('Found section:', targetSection ? targetSection.id : 'NOT FOUND', 'at index:', targetSection ? targetSection.index : 'N/A');

                if (targetSection) {
                    // Unlock scroll if splash screen is blocking
                    ScrollController.unlockScroll();
                    ScrollController.goToSection(targetSection.index);
                } else {
                    console.error('Menu: Could not find section with id:', targetSectionId);
                }
            });
        });
    },

    updateActiveMenuItem(sectionId) {
        const menuItems = document.querySelectorAll('.menu-item');
        const menuIndicator = document.getElementById('menuIndicator');
        let activeItem = null;

        // Get the menu target for this section (or use section ID if no alias)
        const section = ScrollController.sections.find(s => s.id === sectionId);
        const menuTarget = section?.element.dataset.menuTarget || sectionId;

        menuItems.forEach(item => {
            if (item.dataset.target === menuTarget) {
                item.classList.add('active');
                activeItem = item;
            } else {
                item.classList.remove('active');
            }
        });

        // Move indicator to align with active menu item
        if (activeItem && menuIndicator) {
            const menu = document.getElementById('mainMenu');
            const menuRect = menu.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();

            // Calculate responsive indicator height: max(3px, 0.405vw)
            const indicatorHeight = Math.max(3, window.innerWidth * 0.00405);

            // Calculate position relative to menu container
            const topPosition = itemRect.top - menuRect.top + (itemRect.height / 2) - (indicatorHeight / 2); // Center vertically

            menuIndicator.style.top = topPosition + 'px';
        }
    }
};
