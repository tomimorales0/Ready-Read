## Packages
pdfjs-dist | PDF parsing for reading documents
framer-motion | Smooth transitions and animations
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-sans)"],
  display: ["var(--font-display)"],
  mono: ["var(--font-mono)"],
}
Client-side only architecture using localStorage.
PDF worker configuration required in main entry or component.
Music files assumed to be in public/music/.
