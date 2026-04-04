# Design System Document: The Financial Sanctuary

## 1. Overview & Creative North Star
This design system is built upon the philosophy of **"The Financial Sanctuary."** In an industry often defined by anxiety and cluttered data, this system seeks to provide an environment of "Organic Precision." It moves away from the aggressive "fintech-blue" and rigid box-shadows of the past decade, opting instead for deep, tonal layering and editorial-grade typography.

### Breaking the Template
To achieve a high-end, bespoke feel, this system rejects the standard "dashboard" grid. We utilize:
*   **Intentional Asymmetry:** Strategic use of white space (empty breath) to guide the eye toward "Growth" metrics.
*   **Organic Overlaps:** Elements should feel like they are floating in a calm, dark pool, occasionally overlapping to suggest a continuous, living financial ecosystem.
*   **The Deep Focus:** By using a `zinc-950` base (`#131315`), we create a "True Dark" experience where the primary emerald accents don't just sit on top—they glow from within.

---

## 2. Colors & Surface Philosophy

### The Tonal Palette
Our palette is rooted in the earth. The `primary` emeralds represent vitality, while the `tertiary` slates provide the foundation of a sanctuary.
*   **Primary (`#68dba9`):** Used for growth, positive trends, and primary actions.
*   **Secondary/Accent (`#44e2cd`):** Used for goal-tracking and navigational links.
*   **Error (`#ffb4ab`):** Reserved strictly for overspending or critical alerts.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections.
Boundaries must be created through **Background Color Shifts**. For example:
*   A main feed sitting on `surface` (`#131315`) should transition to a `surface-container-low` (`#1c1b1d`) for a side panel.
*   Cards should use `surface-container` (`#201f22`) to sit subtly above the background.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of frosted material. 
1.  **Base:** `surface-dim` / `background` (`#131315`)
2.  **Sectioning:** `surface-container-low`
3.  **Actionable Cards:** `surface-container`
4.  **Floating Modals:** `surface-bright` with a 24px `backdrop-blur`.

### The "Glass & Gradient" Rule
To elevate CTAs, use a subtle **linear gradient** from `primary` (`#68dba9`) to `primary_container` (`#25a475`). This adds a "soul" to the button, mimicking the way light hits a leaf, rather than a flat, synthetic green.

---

## 3. Typography: The Editorial Voice

We use **Manrope** exclusively. Its geometric yet warm apertures provide the "trustworthy" tone required for a sanctuary.

*   **Display (lg/md):** Used for big-picture wealth numbers. These should feel authoritative. Use `primary` or `on-surface` with wide tracking (-0.02em).
*   **Headline (sm/md):** Used for section headers. Combine with `surface-variant` color to create a sophisticated, muted look that doesn't compete with data.
*   **Body (lg/md):** High readability for transaction lists. Never go below `body-sm` (`0.75rem`) for financial data to ensure accessibility.
*   **Label (md/sm):** Use for micro-data or status indicators. Always in All-Caps with +0.05em letter spacing to distinguish from body text.

---

## 4. Elevation & Depth: Tonal Layering

### The Layering Principle
Forget shadows; use **Tonal Lift**. Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural recession. This "carved-out" look feels more premium and integrated than "pasted-on" components.

### Ambient Shadows
If an element *must* float (e.g., a bottom sheet or a floating action button), use a **Tinted Shadow**:
*   **Color:** `#000000` at 12% opacity.
*   **Blur:** 32px to 48px.
*   **Spread:** -4px.
This creates a soft, ambient occlusion rather than a harsh drop shadow.

### The "Ghost Border" Fallback
If a visual separator is required for high-density data, use a **Ghost Border**:
*   `outline-variant` (`#3d4a42`) at **15% opacity**.
This provides a "suggestion" of a boundary that disappears into the sanctuary's atmosphere.

---

## 5. Components

### Buttons
*   **Primary:** Emerald gradient (`primary` to `primary_container`). `xl` roundedness (`1.5rem`). No border.
*   **Secondary:** `surface-container-highest` background with `on-primary-fixed-variant` text.
*   **Tertiary:** Transparent background, `primary` text, no border.

### Input Fields
*   **Style:** Minimalist. No bottom line or box. Use `surface-container-low` as a subtle recessed block. 
*   **Focus State:** Transition the background to `surface-container` and add a 1px "Ghost Border" using `primary`.

### Cards & Lists
*   **Constraint:** Forbid the use of divider lines between list items. 
*   **Solution:** Use 16px or 24px of vertical white space (Spacing Scale). For transaction lists, use alternating tonal shifts (e.g., every second item has a 2% opacity `on-surface` fill).

### The "Growth Spark" (Custom Component)
A micro-chart component using a `secondary` (`#44e2cd`) glow effect behind a line graph to symbolize progress toward a "Financial Sanctuary" goal.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace the Dark:** Use `zinc-950` as the dominant "air" in the room. 
*   **Layer Softly:** Always check if a background color change can replace a border.
*   **Prioritize Manrope:** Use the `headline-lg` scale for emotional "Success" moments (e.g., "Goal Reached").

### Don’t:
*   **Never use Pure White:** Use `on-surface` (`#e5e1e4`) for text to prevent eye strain in dark mode.
*   **No Hard Edges:** Avoid the `none` or `sm` roundedness tokens. This is a sanctuary; use `md` (`0.75rem`) as your absolute minimum.
*   **Don't Over-Color:** If everything is Emerald, nothing is important. Use Emerald for *actions* and *growth*; use Slate/Zinc for *structure*.