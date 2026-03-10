// Navigation Menu Controller
const MenuController = {
    init() {
        const menuItems = document.querySelectorAll('.menu-item');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetSectionId = e.target.dataset.target;
                console.log('Menu clicked:', targetSectionId);

                const targetSection = ScrollController.sections.find(s => s.id === targetSectionId);
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
        menuItems.forEach(item => {
            if (item.dataset.target === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
};
