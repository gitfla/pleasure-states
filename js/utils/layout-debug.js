// Layout Debug Helper
const LayoutDebug = {
    init() {
        console.log('=== LAYOUT DEBUG ===');
        this.logViewportSize();
        this.logCSSVariables();
        this.logSectionDimensions();
        this.logGridDimensions();

        // Re-log on resize
        window.addEventListener('resize', () => {
            console.log('\n=== RESIZE EVENT ===');
            this.logViewportSize();
            this.logCSSVariables();
        });
    },

    logViewportSize() {
        console.log('Viewport:', {
            width: window.innerWidth + 'px',
            height: window.innerHeight + 'px'
        });
    },

    logCSSVariables() {
        // Create a temporary element to compute variable values
        const temp = document.createElement('div');
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        document.body.appendChild(temp);

        const vars = [
            'frame-width', 'frame-height', 'cell-width', 'cell-height',
            'gutter', 'col-band-1', 'col-band-2', 'col-band-3-fg', 'nav-strip'
        ];

        const computed = {};
        vars.forEach(varName => {
            temp.style.width = `var(--${varName})`;
            const width = getComputedStyle(temp).width;
            computed[varName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = width;
        });

        document.body.removeChild(temp);
        console.log('CSS Variables (computed):', computed);
    },

    logSectionDimensions() {
        const section = document.querySelector('.section');
        if (section) {
            const rect = section.getBoundingClientRect();
            const style = getComputedStyle(section);
            console.log('Section Element:', {
                width: style.width,
                height: style.height,
                actualWidth: rect.width + 'px',
                actualHeight: rect.height + 'px',
                top: style.top,
                left: style.left
            });
        }
    },

    logGridDimensions() {
        const grid = document.querySelector('.section-grid');
        if (grid) {
            const rect = grid.getBoundingClientRect();
            const style = getComputedStyle(grid);

            // Parse grid template columns to see total width
            const columns = style.gridTemplateColumns.split(' ').map(v => parseFloat(v));
            const totalColumnWidth = columns.reduce((sum, val) => sum + val, 0);

            console.log('Grid Element:', {
                width: style.width,
                height: style.height,
                actualWidth: rect.width + 'px',
                actualHeight: rect.height + 'px',
                position: {
                    top: rect.top + 'px',
                    left: rect.left + 'px',
                    right: rect.right + 'px',
                    bottom: rect.bottom + 'px'
                },
                gridTemplateColumns: style.gridTemplateColumns,
                totalColumnWidth: totalColumnWidth + 'px',
                gridTemplateRows: style.gridTemplateRows
            });

            console.log('Grid vs Viewport Gap:', {
                horizontalGap: (window.innerWidth - totalColumnWidth) + 'px',
                verticalGap: (window.innerHeight - rect.height) + 'px'
            });
        }
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LayoutDebug.init());
} else {
    LayoutDebug.init();
}
