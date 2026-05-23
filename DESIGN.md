# Design

## Theme

Multi-theme system built on next-themes. Themes are complete visual re-skins that change the emotional tone while keeping layout stable. Current themes: default (light), dark, tech, pastel (少女/可爱). Themes are applied via CSS custom properties scoped to a class on `<html>`.

## Color

OKLCH-based palette generation. Each theme defines:
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

Color strategy per theme:
- **default / light**: Restrained. Warm off-white background, near-black text, minimal accent via orange selection.
- **dark**: Restrained. Near-black background, light gray text, muted surface tones.
- **tech**: Committed. Deep navy/indigo background, cyan/teal accent, subtle grid patterns.
- **pastel**: Full palette. Soft lavender/pink background, deeper purple/plum text, warm peach accents.

## Typography

- Sans: Inter / system-ui stack
- Serif/Display: Playfair Display, Noto Serif SC
- Mono: DM Mono

## Components

Uses shadcn/ui component architecture. Theme variables map directly to Tailwind v4 `@theme` custom properties.

## Motion

- Theme transitions: smooth color transitions on `--color-*` properties (transition-colors duration-300 ease-out).
- Toggle interaction: scale press feedback, icon rotation.

## Theme Switcher UI

Floating action button (FAB) in bottom-right corner. Opens a popover/panel with theme cards (icon + name). Selected state indicated with ring. Position fixed, z-50, safe-area padding.
