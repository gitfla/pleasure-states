You are working in an existing local website codebase.

Your task is to analyze the current implementation first, then refactor the desktop CSS/layout system so the site matches a strict art-directed modular grid from the designer.

Important constraints:
- The site already works functionally.
- Do NOT rebuild the app unnecessarily.
- Preserve existing content, structure, and interactions wherever possible.
- Focus on correcting layout, spacing, alignment, typography, section composition, nav strip layout, and button sizing/placement.
- Desktop first. Do not solve mobile in this pass, but do not block a future clean mobile implementation.
- Before making major edits, inspect the current architecture and explain the plan briefly.
- Then implement directly.

================================
DESIGN SYSTEM REFERENCE
================================

Reference desktop artboard:
- Width: 1728px
- Height: 1117px

Base grid:
- 6 horizontal cells
- 7 vertical rows
- Gutter size: 25px horizontally and vertically
- Cell size: 245px wide x 131px high

Vertical grid math:
- 7 rows x 131 = 917
- 8 gutters x 25 = 200
- Total = 1117

Use this as the desktop coordinate system.

================================
CRITICAL HORIZONTAL GRID LOGIC
================================

The earlier confusion was about gutters. Use THIS corrected model:

There are 3 main columns, but the third/rightmost column is asymmetrical.

Column 1:
- left gutter = 25
- cell = 245
- inner gutter = 25
- cell = 245
- right gutter = 25
- total = 565px

Column 2:
- same as column 1
- total = 565px

Column 3 FOREGROUND CONTENT:
- left gutter = 25
- cell = 245
- inner gutter = 25
- cell = 245
- NO right outer gutter
- total = 540px

Column 3 BACKGROUND MEDIA:
- same 540px base
- plus nav strip = 55px
- total = 595px

This is important:
- The rightmost column does NOT have a right outer gutter.
- Instead, the nav/utility strip occupies that side.
- Therefore the rightmost media width being ~595px is correct.

Double gutter logic:
- Between column 1 and column 2 there is a double gutter: 25 + 25 = 50px
- Between column 2 and column 3 there is a double gutter: 25 + 25 = 50px

Keep these double gutters explicit in the implementation.

Useful width concepts:
- One inner content span = cell + gutter + cell = 245 + 25 + 245 = 515px
- This is the correct one-column usable content width
- If a note says 516px, treat it as equivalent rounding

Do NOT use the earlier mistaken assumption that all 3 columns are symmetrical 565px bands.
Only columns 1 and 2 are symmetrical.
Column 3 is asymmetrical: 540px foreground / 595px media.

A 3px discrepancy in total width should be treated as rounding / measurement tolerance.
Do not introduce hacks for tiny mismatches.

================================
SECTION BEHAVIOR MODES
================================

There are two layout modes:

1) STANDARD SCREENS
Applies to:
- What We Believe
- What We Do
- Work With Us

Rules:
- Foreground text aligns to the 3-column foreground system
- Nav strip stays reserved on the right
- Nav items remain inside the right strip and must not wrap
- Rightmost media extends through the nav strip to the full 595px width
- Foreground text in the rightmost column uses 540px, not 595px

2) SPLASH SCREEN
Rules:
- There is no active nav/scroll reservation for foreground content
- The text “Pleasure is serious business” may visually extend to the right border
- The splash uses the same underlying system, but foreground is allowed to absorb the right utility area
- This is a section-specific override, not a separate design system

================================
TYPOGRAPHY RULES
================================

Implement these as desktop reference values, then convert to fluid/clamped values where appropriate.

Splash:
- “Pleasure is serious business”
- font size: 31px

Splash additional note:
- “Pleasure” and “States” align gutter-to-gutter

What We Believe:
- font size: 29px
- line height: 30px

What We Do:
- font size: 118px
- line height: 87%
- letter spacing: -2

Work With Us:
- font size: 29px
- line height: 30px

“Based Wherever”:
- font size: 118px
- line height: 87%
- letter spacing: -6

Button text:
- “Follow the Feeling”
- font size: 31px
- bold

Menu items:
- font size: 18px
- bold
- spacing between items: 5px
- right aligned
- vertically centered
- must never wrap

Paragraph spacing:
- natural line spacing
- one extra line between paragraphs

================================
BUTTON RULES
================================

The “Follow the Feeling” button belongs inside one foreground content column.

Use:
- width: 515px (516px acceptable if existing implementation rounds that way)
- height: 69px
- border radius: 27px

Important:
- This is a one-column inner content width button
- Do NOT make it a full 565px band

Placement note from designer:
- “bottom of the follow the feeling button starts at the 1/7th from the bottom”

Interpret that as:
- align near the final row boundary in the vertical grid
- verify visually against the existing comp/screens if possible
- prefer grid-consistent placement over literal blind interpretation

================================
NAV / RIGHT UTILITY STRIP
================================

Right strip width:
- 55px

Inside this strip:
- scrollbar approx 7 x 270
- active dash approx 40 x 7
- dash radius 8
- spacing between nav texts 5px

Rules:
- Nav content must never affect the main content grid
- Nav items must never wrap
- This strip is part of the right edge system and replaces the missing right gutter of the third column

================================
IMPLEMENTATION STRATEGY
================================

First inspect the existing codebase and identify:
- global layout wrappers
- section/screen components
- current CSS architecture
- current responsive behavior
- typography definitions
- nav implementation
- button implementation
- whether layout currently relies on absolute positioning
- which files are responsible for desktop layout

Then refactor with these goals:

1. Create reusable layout tokens / variables
Prefer centralized CSS custom properties or the project’s equivalent token system.

Recommended semantic tokens:
- --frame-w
- --frame-h
- --cell-w
- --row-h
- --gutter
- --nav-strip-w
- --col-1-band
- --col-2-band
- --col-3-foreground
- --col-3-media
- --col-inner

Suggested values:
- frame-w: 1728
- frame-h: 1117
- cell-w: 245
- row-h: 131
- gutter: 25
- nav-strip-w: 55
- col-1-band: 565
- col-2-band: 565
- col-3-foreground: 540
- col-3-media: 595
- col-inner: 515

2. Separate FOREGROUND and MEDIA layout logic
This is very important.
Foreground:
- text
- buttons
- logo
Media:
- videos
- images
- background fills

The right column must support:
- 540px foreground behavior
- 595px media behavior

3. Refactor each section against the grid
- Remove arbitrary layout logic where possible
- Align to the modular system
- Preserve composition
- Prefer CSS Grid for macro layout
- Use Flexbox/Grid internally as needed

4. Implement fluid desktop scaling
The desktop should scale proportionally from the 1728x1117 reference.
Use controlled fluid behavior, not a rigid fixed-pixel recreation.

Preferred:
- CSS custom properties
- clamp() for typography and spacing
- a coherent desktop scaling approach with sensible minimums

Avoid:
- pure vw typography with no limits
- random one-off pixel overrides everywhere
- overusing absolute positioning unless a specific visual element truly needs it

5. Preserve future mobile separation
Do not solve mobile now, but do not hardcode the desktop in a way that makes future breakpoint work messy.

================================
HANDLING AMBIGUITY
================================

When notes conflict, prioritize:
1. the corrected grid logic above
2. visual fidelity to the actual comp/screens
3. systematic implementation over hacks

Treat tiny mismatches (like 1–3px) as measurement/rounding tolerance.

================================
EXPECTED OUTPUT
================================

Before major changes:
- Give a brief analysis summary of the current layout architecture
- Explain the refactor plan concisely

Then implement:
- the desktop grid/token system
- corrected section layout
- corrected typography
- corrected nav strip layout
- corrected button width/placement
- corrected right-column foreground/media behavior
- fluid desktop scaling

After implementation:
- briefly summarize what changed
- note any remaining ambiguities or assumptions

================================
SUCCESS CRITERIA
================================

The implementation is successful if:

Grid fidelity:
- columns 1 and 2 read as 565px bands
- column 3 foreground behaves as 540px
- column 3 media behaves as 595px
- double gutters between columns remain explicit

Section fidelity:
- splash can visually extend foreground to the right edge
- standard screens reserve the nav strip

Typography fidelity:
- sizes, line heights, and tracking match the provided notes closely
- nav items do not wrap

Button fidelity:
- button width is one-column inner width (515/516px)
- button height and radius match notes

Responsive fidelity:
- desktop scales proportionally and remains readable

Start by inspecting the current implementation and telling me what files/components/styles you plan to change. Then make the changes.