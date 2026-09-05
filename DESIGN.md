# UI Design Reference

This document describes the layout and visual language currently implemented in the portfolio. Use it as a reference when extending the UI. Values come from the local styles and page markup; this is a source-based reference, not a browser rendering audit.

## Visual direction

The interface resembles an industrial document with subtle instrument-panel details: warm paper, near-black ink, fine rules, numbered sections, registration marks, and compact system labels. Large editorial headings give the content hierarchy; dense metadata supplies the engineering character.

Keep surfaces flat and corners square. Use borders, spacing, and typography to group content. Reserve oxide orange-red for emphasis, labels, active states, and data visualization. Background grids and hatching should remain faint enough that text dominates.

## Color system

Shared tokens live in `src/styles/home.css`. Dark mode overrides the same variables through `:root[data-theme="dark"]`.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--paper` | `#e7e3d6` | `#14150f` | Page background |
| `--paper-2` | `#efece1` | `#1c1d15` | Framed surfaces, galleries, footer |
| `--panel` | `#e0dbcb` | `#101109` | Alternate section background |
| `--ink` | `#16150f` | `#ece8da` | Headings, primary text, solid controls |
| `--ink-soft` | `#3b3a30` | `#c4c1b2` | Supporting text |
| `--muted` | `#625f52` | `#8f8c7c` | Secondary labels |
| `--faint` | `#686456` | `#8b8879` | Quiet indicators and navigation numbers |
| `--accent` | `#a43b17` | `#db6334` | Accent text and active signals |
| `--accent-soft` | `#c8643f` | `#e88a5c` | Accent highlights |
| `--line` | `rgba(22, 21, 15, 0.18)` | `rgba(236, 232, 218, 0.16)` | Internal dividers |
| `--line-strong` | `rgba(22, 21, 15, 0.36)` | `rgba(236, 232, 218, 0.34)` | Outer frames and section boundaries |

The page background uses a 64px square grid. Hero surfaces add diagonal hatching at 9px intervals; alternate sections use 11px intervals. Subtle radial gradients provide a paper-like vignette. Reuse the existing surface tokens so these treatments adapt to both themes.

The saved theme takes precedence over the operating system preference. The initial theme is resolved before first paint; the toggle persists the selection. The theme button shows the icon for the destination theme.

## Typography

Use **Geist** for display headings, prominent numbers, and selected descriptive paragraphs. Use **Geist Mono** for the body default, navigation, buttons, labels, captions, and technical metadata. Both families are loaded in `src/layouts/Layout.astro` with system fallbacks.

| Element | Family | Size | Treatment |
| --- | --- | --- | --- |
| Body default | Geist Mono | `16px` | Line height `1.65` |
| Hero title | Geist | `clamp(2.6rem, 8vw, 6.6rem)` | Weight `600`, line height `0.98`, tracking `-0.03em` |
| Section title | Geist | `clamp(2rem, 5vw, 4.2rem)` | Weight `600`, line height `1`, tracking `-0.03em` |
| Featured project title | Geist | `clamp(2.7rem, 7vw, 5.5rem)` | Weight `600`, line height `0.92`, tracking `-0.04em` |
| Metric value | Geist | `clamp(2rem, 4vw, 2.8rem)` | Weight `600`, line height `1` |
| Supporting copy | Geist or Geist Mono | Usually `0.88–1.15rem` | Line height around `1.65–1.7` |
| Labels and captions | Geist Mono | Usually `0.68–0.78rem` | Uppercase, positive tracking |

Constrain long text to readable measures: hero supporting copy is `56ch`, section descriptions `58ch`. The main hero title is limited to `16ch` on desktop, with explicit line spans. Emphasis within the hero uses a slow animated gradient drawn from the accent palette.

## Layout and spacing

- Center primary content within `--max: 1180px`.
- Use `--pad: clamp(1.25rem, 4vw, 3rem)` for horizontal gutters.
- Keep full-width alternate sections aligned to the same inner content using `--content-max: calc(var(--max) - (2 * var(--pad)))`.
- Give standard sections `clamp(3.5rem, 8vw, 7rem)` vertical padding.
- Separate section headings from content with `clamp(2.5rem, 5vw, 4rem)`.
- Use fluid card padding, generally between `1.25rem` and `3rem`, and compact control gaps around `0.45–0.75rem`.
- Build adjacent card groups with shared 1px dividers. Featured project blocks use larger gaps of `clamp(2rem, 5vw, 4rem)`.

### Page structure

The homepage flows through a sticky header, framed hero, three metrics, Experience, Selected projects, Capabilities, About, contact, and a system-style footer. Projects and About use alternate full-width surfaces. Number badges establish the section sequence.

The services page reuses the hero and section system for offer options, suitable tasks, proof, process, and contact. Offer cards form a two-column comparison; the primary offer inverts the paper and ink colors. Additional offers appear in horizontal rows beneath them.

The project detail page reuses the frame, metrics, case cards, and proof link. Its scoped styles include a larger hero title, additional top spacing, a non-sticky header, and an accent-bordered callout. These are page-specific variants, not global defaults.

## Components

| Component | Visual and layout rules |
| --- | --- |
| Header | Full-width sticky bar, translucent paper background, 10px backdrop blur, strong bottom rule. Brand left, numbered navigation, actions right. |
| Brand | 28px square ink block beside uppercase monospace text. |
| Navigation | Compact uppercase links. Hover and active states invert to ink background and paper text; active numbers use the soft accent. |
| Mobile menu | Native disclosure with a bordered summary and plus/minus indicator. Expanded links sit in a framed paper panel with a hard offset shadow. |
| Buttons | Square corners, 1px ink border, uppercase monospace text, normally at least 42px high. Solid and ghost variants swap fill and text on hover. |
| Theme toggle | 38px square outlined button containing a 16px sun or moon icon. |
| Hero frame | Strong 1px border, hatched surface, four 10px corner registration marks, accent eyebrow, large title, left-ruled supporting copy, grouped actions. |
| Metrics | Shared bordered grid, large sans-serif values above small uppercase labels. Homepage uses three columns. |
| Section heading | Small outlined number badge, large title, optional constrained description. |
| Featured project | Framed two-column introduction and details, separated by a vertical rule; screenshot gallery beneath. Metadata and technology tags use monospace. |
| Screenshot gallery | Two columns with 1px separators, images at `1586 / 992` aspect ratio, ruled uppercase captions. Hover applies a small zoom and color adjustment. |
| Case grids | Two columns by default; recent experience and additional projects use three. Cards share borders and pair metadata with a title and description. |
| GitHub activity | Framed panel with split introductory copy, horizontally scrollable calendar, and a ruled footer link. Calendar cells are 12px with 4px gaps and 1px corner radii; intensity progresses toward the theme accent. |
| About | Prominent introductory statement followed by three bordered information cells. |
| Contact | Large underlined email, adjacent copy button, and outlined secondary links. Email and underline turn accent on hover; copied state inverts the button. |
| Service proof | Full-width bordered link with description and compact status badge. Hover inverts the surface. |
| Process | Ordered ruled rows with a narrow number column and a wider explanation column. |
| Footer | Full-width paper surface with an ink top border, wrapping uppercase metadata, links, and accent clock text. |

Use actual product screenshots from `public/images/` for project evidence. Preserve the technical-document presentation with captions and borders. Icons should be simple, small, and consistent with the square controls; arrows and geometric marks complement the monospace labels.

## Responsive behavior

| Breakpoint | Implemented changes |
| --- | --- |
| `880px` and below | Homepage desktop navigation becomes a disclosure menu. Featured project bodies, case grids, earlier career, and About cells stack. Activity introduction becomes one column. |
| `520px` and below | Brand name hides; controls and hero spacing tighten. Hero title becomes `clamp(2.05rem, 9vw, 2.5rem)`. Homepage metrics retain three compact columns. Hero actions share the row. Gallery becomes a horizontal snap scroller with 88% width slides. Contact and footer stack. |
| Services: `900px` | Hide desktop navigation and brand name. |
| Services: `700px` | Stack offer cards, additional offers, and proof cards; hero metrics use two columns; process number column narrows. |
| Services: `460px` | Hero metrics use one column; header action text and padding shrink. |
| Project detail: `900px` / `640px` | Method cards stack at 900px; hero top spacing decreases at 640px. |

The base layout sets a minimum width of 320px. Preserve local horizontal scrolling for galleries and the activity calendar. Long email text can wrap with `overflow-wrap: anywhere`.

## Interaction and motion

Controls generally transition color and background over `0.18–0.2s`; theme surfaces transition over `0.3s`. Reveal elements use a `20px` upward entrance over `0.7s`, with optional `90ms` stagger increments. A fixed 3px progress bar tracks page scrolling.

The homepage includes a terminal-style boot overlay, cursor spotlight, title scramble, and pulsing active indicators. The boot overlay can be dismissed by a key press or click. These effects reinforce the visual theme and should remain secondary to reading and navigation.

Preserve the existing reduced-motion handling: skip the boot sequence, disable CSS animations, remove reveal motion, and use non-smooth scrolling. Keep content visible in the baseline HTML before JavaScript enhancement.

## Accessibility and extension guidance

- Preserve semantic headings, links, buttons, and the native mobile disclosure.
- Retain the visible accent focus outline: `2px` with `3px` offset for links, buttons, and summaries.
- Keep decorative registration marks hidden from assistive technology, and retain accessible labels and state attributes on controls.
- Pair color with text or shape for status and selection.
- Reuse shared tokens and component classes; keep page-specific overrides scoped to their page or stylesheet.
- Maintain readable copy, clear hierarchy, restrained textures, and square geometry when adding sections.
- For future UI changes, check both themes and widths around the relevant breakpoints, plus keyboard navigation and reduced motion. This document does not establish contrast or accessibility conformance.

## Source map

- `src/styles/home.css`: shared tokens, typography, layout, components, effects, and homepage breakpoints.
- `src/styles/services.css`: service offers, proof cards, process rows, and service breakpoints.
- `src/layouts/Layout.astro`: fonts, base document styling, and initial theme selection.
- `src/pages/index.astro`: homepage composition and content hierarchy.
- `src/pages/services.astro`: services page composition.
- `src/pages/projects/hyperliquid-paper-bot.astro`: project page composition and scoped overrides.
- `src/components/GitHubActivity.tsx`: calendar geometry and theme palette.
- `src/scripts/home/`: theme switching, navigation state, contact feedback, and motion behavior.
