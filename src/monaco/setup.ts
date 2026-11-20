import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// Bundle Monaco locally (no CDN) and wire its web workers for Vite.
(self as unknown as { MonacoEnvironment: monaco.Environment }).MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });

// Playground has no project/module context: keep syntax errors, drop "cannot find module/name" noise.
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });

export const THEME = 'happcode';

/** Light theme built only from the Figma palette. */
export function defineHappTheme(m: typeof monaco) {
  m.editor.defineTheme(THEME, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '', foreground: '1f242d' },
      { token: 'comment', foreground: '656c7a' },
      { token: 'keyword', foreground: '8d4b00' },
      { token: 'number', foreground: '8d4b00' },
      { token: 'string', foreground: '554336' },
      { token: 'type', foreground: '554336' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#1f242d',
      'editorLineNumber.foreground': '#9ba1ad',
      'editorLineNumber.activeForeground': '#656c7a',
      'editorCursor.foreground': '#f59e0b',
      'editor.selectionBackground': '#fef3c7',
      'editor.inactiveSelectionBackground': '#fef3c780',
      'editor.lineHighlightBackground': '#00000000',
      'editorIndentGuide.background1': '#e5e0d8',
      'editorBracketMatch.background': '#fef3c7',
      'editorBracketMatch.border': '#f59e0b',
      'editor.findMatchBackground': '#f59e0b66',
      'editor.findMatchHighlightBackground': '#fef3c7',
      'editorWidget.background': '#ffffff',
      'editorWidget.border': '#e5e0d8',
      'scrollbarSlider.background': '#e5e0d8aa',
      'scrollbarSlider.hoverBackground': '#dbc2b0aa',
      'scrollbarSlider.activeBackground': '#dbc2b0',
    },
  });
}
