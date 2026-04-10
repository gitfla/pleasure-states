// Viewport Precision Utility
// Sets --app-h-js / --app-w-js on :root using the visualViewport API.
// These are used by precision-critical elements (splash, mobile menu, debug grid)
// that must be pixel-locked to the actual visible viewport on iOS browsers.
// Standard sections use the CSS dvh baseline (--app-h) instead.

function updateViewportPrecisionVars() {
    if (!window.matchMedia('(max-width: 768px)').matches) {
        document.documentElement.style.removeProperty('--app-h-js');
        document.documentElement.style.removeProperty('--app-w-js');
        return;
    }
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    const w = vv ? vv.width : window.innerWidth;
    document.documentElement.style.setProperty('--app-h-js', h + 'px');
    document.documentElement.style.setProperty('--app-w-js', w + 'px');
}

updateViewportPrecisionVars();
window.visualViewport?.addEventListener('resize', updateViewportPrecisionVars);
window.addEventListener('orientationchange', updateViewportPrecisionVars);
window.addEventListener('resize', updateViewportPrecisionVars);
// No scroll listeners — toolbar show/hide is handled by visualViewport resize.
