{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0  Modular Grid System Implementation Plan\
\
 Overview\
\
 Refactor the Pleasure States website from fluid viewport-based sizing to\
 a precise modular grid system based on a 1728\'d71117px reference artboard.\
 The grid scales proportionally with the viewport while maintaining\
 precise alignment.\
\
 Key Principle: All existing animations, scroll behavior, and mask-lifting\
  effects remain intact. Only layout and sizing change.\
\
 ---\
 Grid System Specifications\
\
 Reference Grid\
\
 - Artboard: 1728px \'d7 1117px\
 - Grid: 6 columns \'d7 7 rows\
 - Cell: 245px (w) \'d7 131px (h)\
 - Gutter: 25px (horizontal and vertical)\
\
 Column Bands\
\
 - Column 1: 565px (gutter + cell + gutter + cell + gutter)\
 - Column 2: 565px (same as column 1)\
 - Column 3 Foreground: 540px (cell + gutter + cell + gutter)\
 - Column 3 Media: 595px (540px + 55px nav strip)\
 - Nav Strip: 55px (right edge)\
\
 Fluid Scaling Strategy\
\
 All dimensions scale proportionally with viewport using clamp():\
 - Cell width: clamp(120px, 14.18vw, 245px) where 245/1728 = 14.18%\
 - Cell height: clamp(80px, 11.73vh, 131px) where 131/1117 = 11.73%\
 - Gutter: clamp(12px, 1.45vw, 25px) where 25/1728 = 1.45%\
\
 ---\
 CSS Custom Properties (css/variables.css)\
\
 :root \{\
     /* Frame dimensions */\
     --frame-width: clamp(320px, 100vw, 1728px);\
     --frame-height: clamp(568px, 100vh, 1117px);\
\
     /* Grid units */\
     --cell-width: clamp(120px, 14.18vw, 245px);\
     --cell-height: clamp(80px, 11.73vh, 131px);\
     --gutter: clamp(12px, 1.45vw, 25px);\
\
     /* Column bands (derived from cells + gutters) */\
     --col-band-1: calc(var(--gutter) + var(--cell-width) + var(--gutter)\
 + var(--cell-width) + var(--gutter));\
     --col-band-2: calc(var(--cell-width) + var(--gutter) +\
 var(--cell-width) + var(--gutter));\
     --col-band-3-fg: calc(var(--cell-width) + var(--gutter) +\
 var(--cell-width) + var(--gutter));\
     --nav-strip: clamp(25px, 3.18vw, 55px);\
     --col-band-3-media: calc(var(--col-band-3-fg) + var(--nav-strip));\
\
     /* Inner widths */\
     --inner-width-2col: calc(var(--cell-width) + var(--gutter) +\
 var(--cell-width));\
\
     /* Typography (proportional scaling) */\
     --font-splash-tagline: clamp(16px, 1.79vw, 31px);\
     --font-believe-body: clamp(15px, 1.68vw, 29px);\
     --font-believe-line-height: clamp(16px, 1.74vw, 30px);\
     --font-what-we-do: clamp(60px, 6.83vw, 118px);\
     --font-what-we-do-line-height: 0.87;\
     --font-what-we-do-letter-spacing: -2px;\
     --font-work-with-us-headline: clamp(60px, 6.83vw, 118px);\
     --font-work-with-us-body: clamp(15px, 1.68vw, 29px);\
     --font-button: clamp(16px, 1.79vw, 31px);\
     --font-menu: clamp(10px, 1.04vw, 18px);\
     --font-menu-spacing: clamp(3px, 0.29vw, 5px);\
\
     /* Buttons */\
     --button-width: var(--inner-width-2col);\
     --button-height: clamp(35px, 3.99vw, 69px);\
     --button-radius: clamp(14px, 1.56vw, 27px);\
 \}\
\
 Remove: --section-height, --column-gap, --grid-3-col, --grid-splash,\
 generic font-size tokens\
\
 ---\
 Base Grid System (css/layout.css)\
\
 Section Container\
\
 .section \{\
     width: var(--frame-width);\
     height: var(--frame-height);\
\
     /* Center on viewport */\
     position: fixed;\
     top: 50%;\
     left: 50%;\
     transform: translate(-50%, -50%);\
\
     overflow: hidden;\
 \}\
\
 Grid Templates\
\
 Base Grid:\
 .section-grid \{\
     display: grid;\
     width: 100%;\
     height: 100%;\
     grid-template-rows: repeat(7, var(--cell-height));\
     column-gap: 0;\
     row-gap: 0;\
 \}\
\
 Splash (3 columns, nav absorbed):\
 .splash-grid \{\
     grid-template-columns:\
         var(--col-band-1)\
         var(--col-band-2)\
         var(--col-band-3-media);\
 \}\
\
 Standard Sections (3 columns + nav strip track):\
 .philosophy-grid, .what-we-do-grid, .work-with-us-grid \{\
     grid-template-columns:\
         var(--col-band-1)\
         var(--col-band-2)\
         var(--col-band-3-fg)\
         var(--nav-strip);\
 \}\
\
 ---\
 Section-Specific Grid Alignment\
\
 Foreground vs Media Rules\
\
 Foreground content (text, white panels):\
 - Stops before nav strip\
 - Example: grid-column: 3 (not 3 / 5)\
\
 Media content (videos, images):\
 - Extends into nav strip\
 - Example: grid-column: 2 / 5 or 3 / 5\
\
 Splash Section (css/sections/splash.css)\
\
 .splash-white-column \{\
     grid-column: 1;\
     grid-row: 1 / -1;\
 \}\
\
 .splash-video-wrapper \{\
     grid-column: 2 / 4;  /* Spans columns 2 and 3 */\
     grid-row: 1 / -1;\
 \}\
\
 .splash-tagline \{\
     font-size: var(--font-splash-tagline);\
     padding-right: var(--gutter);\
 \}\
\
 What We Believe (css/sections/what-we-believe.css)\
\
 .philosophy-text-container \{\
     grid-column: 1;\
     grid-row: 1 / -1;\
     padding: calc(var(--gutter) * 8) var(--gutter) var(--gutter);\
 \}\
\
 .philosophy-paragraph \{\
     font-size: var(--font-believe-body);\
     line-height: var(--font-believe-line-height);\
     margin-bottom: calc(var(--gutter) * 0.72);\
 \}\
\
 .philosophy-video-container:nth-of-type(2) \{\
     grid-column: 2 / 4;  /* Band 2, stops before nav */\
 \}\
\
 .philosophy-video-container:nth-of-type(3) \{\
     grid-column: 3 / 5;  /* Band 3 + nav (media extends) */\
 \}\
\
 What We Do (css/sections/what-we-do.css)\
\
 .what-we-do-video-container \{\
     grid-column: 1 / 4;  /* Band 1, extends into nav */\
 \}\
\
 .what-we-do-text-wrapper \{\
     grid-column: 2 / 4;  /* Bands 2 + 3, stops before nav */\
     background-color: #fff;\
 \}\
\
 .typing-content \{\
     font-size: var(--font-what-we-do);\
     line-height: var(--font-what-we-do-line-height);\
     letter-spacing: var(--font-what-we-do-letter-spacing);\
 \}\
\
 Work With Us (css/sections/work-with-us.css)\
\
 .work-with-us-image-container \{\
     grid-column: 1 / 4;  /* Bands 1 + 2, extends into nav */\
     padding: calc(var(--gutter) * 4) var(--gutter);\
 \}\
\
 .work-with-us-headline \{\
     font-size: var(--font-work-with-us-headline);\
     line-height: var(--font-what-we-do-line-height);\
     letter-spacing: -6px;\
 \}\
\
 .work-with-us-text-container \{\
     grid-column: 3;  /* Band 3 only (foreground) */\
     background-color: #fff;\
     padding: calc(var(--gutter) * 8) var(--gutter) var(--gutter);\
 \}\
\
 .contact-cta \{\
     width: 100%;\
     max-width: var(--button-width);\
     height: var(--button-height);\
     border-radius: var(--button-radius);\
     font-size: var(--font-button);\
 \}\
\
 ---\
 Navigation Menu (css/components/menu.css)\
\
 .main-menu \{\
     position: fixed;\
     top: calc(var(--gutter) * 2);\
     right: 0;\
     width: var(--nav-strip);\
     z-index: var(--z-menu);\
 \}\
\
 .menu-item \{\
     font-size: var(--font-menu);\
     font-weight: 700;\
     letter-spacing: var(--font-menu-spacing);\
     padding: calc(var(--gutter) * 0.15) var(--gutter);\
     text-align: right;\
 \}\
\
 ---\
 Preserved Functionality\
\
 Mask-Lifting Scroll Effect\
\
 - Status: COMPLETELY PRESERVED\
 - Fixed positioning and z-index unchanged\
 - GSAP translateY() animations work identically\
 - Transform centering combines with GSAP's y property automatically\
 - No JavaScript changes needed\
\
 GSAP Animations\
\
 - Status: COMPLETELY PRESERVED\
 - All animations (splash reveals, typing, paragraph reveals) target\
 opacity/transform properties\
 - Layout changes don't affect animation logic\
 - No JavaScript changes needed\
\
 Scroll Controller\
\
 - Status: COMPLETELY PRESERVED\
 - Layout-agnostic implementation\
 - No JavaScript changes needed\
\
 ---\
 Implementation Sequence\
\
 Phase 1: Foundation\
\
 1. Update css/variables.css - Add all modular grid tokens\
 2. Update css/layout.css - Base grid system and templates\
\
 Phase 2: Sections\
\
 3. Update css/sections/splash.css\
 4. Update css/sections/what-we-believe.css\
 5. Update css/sections/what-we-do.css\
 6. Update css/sections/work-with-us.css\
\
 Phase 3: Components\
\
 7. Update css/components/menu.css\
 8. Update css/components/typography.css\
\
 Phase 4: Validation\
\
 9. Test at 1728px, 1200px, and 320px viewports\
 10. Verify all animations still work\
 11. Cross-browser testing\
\
 ---\
 Critical Files\
\
 1. css/variables.css - Core grid tokens (foundation)\
 2. css/layout.css - Base grid implementation\
 3. css/sections/splash.css - Test pattern first\
 4. css/sections/what-we-believe.css - Foreground/media separation example\
 5. css/components/menu.css - Nav strip validation\
\
 ---\
 Key Technical Decisions\
\
 Section Centering: Use transform: translate(-50%, -50%) for centering.\
 GSAP's y property combines with this automatically.\
\
 Button Width: Use width: 100%; max-width: var(--button-width) to fill\
 container while respecting reference width.\
\
 Nav Strip: Dedicated grid track in standard sections, absorbed into\
 column 3 width in splash section.\
}