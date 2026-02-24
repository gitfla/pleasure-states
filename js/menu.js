// Navigation Menu Controller
const MenuController = {
    init() {
        const menuItems = document.querySelectorAll('.menu-item');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetSectionId = e.target.dataset.target;
                const targetSection = ScrollController.sections.find(s => s.id === targetSectionId);

                if (targetSection) {
                    // Unlock scroll if splash screen is blocking
                    ScrollController.unlockScroll();
                    ScrollController.goToSection(targetSection.index);
                }
            });
        });
    }
};
