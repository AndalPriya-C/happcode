# HappCode: Phase 1 (frontend only)

React + TypeScript + Vite + Tailwind CSS + Monaco Editor, implemented from the Figma file
`QPzgwbdbrBm1KKupTRVLiS` (frames: "Compiler IDE - Cream, Charcoal & Yellow" 1280px, "Compiler IDE - Mobile View" 390px).

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Structure
```
src/
  config/languages.ts      15 languages: Monaco id, file name, runtime label, starter template
  services/execution.ts    ExecutionService contract (the only UI <-> execution boundary)
  services/index.ts        <- Phase 2: swap the mock for the real service here
  mock/                    MOCK ONLY: fabricated run results (clearly labelled in the UI)
  hooks/useIde.ts          all state + actions (run/stop/reset/clear/copy/download/save)
  monaco/setup.ts          local Monaco bundle, workers, "happcode" theme (Figma palette)
  components/              reusable UI (header, editor, split pane, output, mobile pieces)
  layouts/                 DesktopLayout (>=768) and MobileLayout (<768)
```

## Mock vs real
Nothing executes your code. `src/mock/mockExecutionService.ts` returns the sample output from the
Figma mobile frame after a 1.4s delay, with a "Mock output" badge as the first output line.

## Design tokens (from Figma, in tailwind.config.js)
Cream `#faf7f2` (mobile `#fbf9f4`), border `#e5e0d8`, ink `#1f242d`, amber `#f59e0b`, stop red `#ba1a1a`,
panel `#f2efe9`, mobile accents `#8d4b00 #554336 #887364 #dbc2b0 #fef3c7 #f5f3ee #eae8e3`.
Fonts: Plus Jakarta Sans (desktop UI), Space Grotesk (mobile UI), JetBrains Mono (code/logs).

## Breakpoints
- `>=1024px` desktop: side-by-side split, drag the divider (arrow keys work, double-click resets)
- `768-1023px` tablet: same desktop design, panels stacked vertically, labels collapse to icons
- `<768px` mobile: Figma mobile layout with Editor / Stdin / Output tabs + bottom nav

## Shortcuts
`Ctrl/Cmd+Enter` run, `Esc` stop, `Ctrl/Cmd+S` save draft (localStorage), `Ctrl+F` find, `Ctrl+H` replace.
"# happcode" 
