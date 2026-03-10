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

        // Track active section on scroll
        this.trackActiveSection();
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
    },

    trackActiveSection() {
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('.section');
            const scrollPosition = window.scrollY + window.innerHeight / 2;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    const sectionId = section.getAttribute('data-section');
                    this.updateActiveMenuItem(sectionId);
                }
            });
        });
    }
};
