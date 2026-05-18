// Work with us Section
const WorkWithUsSection = {

    init() {
        ScrollController.registerSection('work-with-us-1', {
            onEnter: () => this.onEnter1(),
            onLeave: () => {},
            onScrollAttempt: () => true
        });

        ScrollController.registerSection('work-with-us-2', {
            onEnter: () => this.onEnter2(),
            onLeave: () => {},
            onScrollAttempt: () => true
        });

        this.initDrag();
    },

    onEnter1() {
        const headline = document.querySelector('#work-with-us-1 .work-with-us-headline');
        if (headline) gsap.set(headline, { opacity: 1 });
    },

    onEnter2() {
        const headline = document.querySelector('#work-with-us-2 .work-with-us-headline');
        const paragraphs = document.querySelectorAll('#work-with-us-2 .contact-line');
        const ctaButton = document.getElementById('ctaButton');

        if (headline) gsap.set(headline, { opacity: 1 });
        gsap.set(paragraphs, { opacity: 1 });

        if (ctaButton) {
            gsap.set(ctaButton, { opacity: 1, pointerEvents: 'auto' });
            ScrollController.ctaButtonShown = true;
        }
    },

    initDrag() {
        if (!window.matchMedia('(min-width: 769px)').matches) return;

        const btn = document.getElementById('ctaButton');
        if (!btn) return;

        let startX, startY, originLeft, originTop, dragging = false, moved = false;

        btn.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;

            // Convert CSS right/bottom to left/top on first drag
            if (btn.style.left === '') {
                const rect = btn.getBoundingClientRect();
                btn.style.left = rect.left + 'px';
                btn.style.top = rect.top + 'px';
                btn.style.right = 'auto';
                btn.style.bottom = 'auto';
            }

            originLeft = parseFloat(btn.style.left);
            originTop = parseFloat(btn.style.top);
            startX = e.clientX;
            startY = e.clientY;
            dragging = true;
            moved = false;

            btn.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        btn.addEventListener('pointermove', (e) => {
            if (!dragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (!moved && Math.abs(dx) + Math.abs(dy) > 4) {
                moved = true;
                btn.classList.add('is-dragging');
            }

            if (moved) {
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const w = btn.offsetWidth;
                const h = btn.offsetHeight;

                const newLeft = Math.min(Math.max(originLeft + dx, 0), vw - w);
                const newTop = Math.min(Math.max(originTop + dy, 0), vh - h);

                btn.style.left = newLeft + 'px';
                btn.style.top = newTop + 'px';
            }
        });

        const onRelease = (e) => {
            if (!dragging) return;
            dragging = false;
            btn.classList.remove('is-dragging');

            if (moved) {
                btn.addEventListener('click', (ce) => ce.preventDefault(), { once: true });
            }
        };

        btn.addEventListener('pointerup', onRelease);
        btn.addEventListener('pointercancel', onRelease);
        window.addEventListener('pointerup', onRelease);
        document.addEventListener('pointerleave', onRelease);
    }
};
