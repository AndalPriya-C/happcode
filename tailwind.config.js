/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#faf7f2',      // desktop page + header bg
        'cream-m': '#fbf9f4',  // mobile page bg
        line: '#e5e0d8',       // every border
        ink: '#1f242d',        // primary text
        muted: '#656c7a',      // secondary text / icons (desktop)
        faint: '#9ba1ad',      // placeholder, line numbers, log text (desktop)
        amber: { DEFAULT: '#f59e0b' }, // signature yellow
        danger: '#ba1a1a',     // Stop button
        panel: '#f2efe9',      // desktop status bar + splitter
        subbar: '#f5f3ee',     // mobile sub-bar, console chrome, metric tiles
        seg: '#eae8e3',        // mobile segmented track
        cocoa: '#554336',      // mobile body text
        taupe: '#887364',      // mobile muted text
        rust: '#8d4b00',       // mobile accent text
        tan: '#dbc2b0',        // mobile dots, kbd border
        honey: '#fef3c7',      // badge / pill background
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'], // desktop UI
        grotesk: ['"Space Grotesk"', 'system-ui', 'sans-serif'],     // mobile UI
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: { hc: '0 1px 1px rgba(0,0,0,0.05)' },
      keyframes: {
        sweep: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(300%)' } },
      },
      animation: { sweep: 'sweep 1.4s ease-in-out infinite' },
    },
  },
  plugins: [],
};
