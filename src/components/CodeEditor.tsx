import { useEffect, useMemo, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { LANGUAGES, type LanguageId } from '../config/languages';
import type { CursorPos, EditorSettings } from '../hooks/useIde';
import { THEME, defineHappTheme } from '../monaco/setup';

interface Props {
  languageId: LanguageId;
  value: string;
  settings: EditorSettings;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onRun: () => void;
  onSave: () => void;
  onCursor: (pos: CursorPos) => void;
}

export function CodeEditor({ languageId, value, settings, autoFocus, onChange, onRun, onSave, onCursor }: Props) {
  const cfg = LANGUAGES[languageId];
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const runRef = useRef(onRun);
  const saveRef = useRef(onSave);
  const cursorRef = useRef(onCursor);
  runRef.current = onRun;
  saveRef.current = onSave;
  cursorRef.current = onCursor;

  const options = useMemo<editor.IStandaloneEditorConstructionOptions>(
    () => ({
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: settings.fontSize,
      lineHeight: Math.round(settings.fontSize * (20 / 14)),
      fontLigatures: false,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      cursorStyle: 'block', // Figma shows an amber block cursor
      cursorBlinking: 'blink',
      renderLineHighlight: 'none',
      padding: { top: 12, bottom: 12 },
      lineNumbers: 'on',
      lineNumbersMinChars: 3,
      lineDecorationsWidth: 8,
      glyphMargin: false,
      folding: false,
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      guides: { indentation: false },
      tabSize: settings.tabSize,
      insertSpaces: true,
      detectIndentation: false,
      autoIndent: 'full',
      matchBrackets: 'always',
      bracketPairColorization: { enabled: false },
      autoClosingBrackets: 'languageDefined',
      autoClosingQuotes: 'languageDefined',
      formatOnType: true,
      wordWrap: 'off',
      smoothScrolling: true,
      fixedOverflowWidgets: true,
      scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false },
      find: { addExtraSpaceOnTop: false, seedSearchStringFromSelection: 'selection' },
    }),
    [settings.fontSize, settings.tabSize],
  );

  const handleMount: OnMount = (ed, monaco) => {
    editorRef.current = ed;
    // Ctrl/Cmd+Enter overrides Monaco's "insert line below"; Ctrl/Cmd+S is "save draft".
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => saveRef.current());
    ed.onDidChangeCursorPosition((e) => cursorRef.current({ line: e.position.lineNumber, col: e.position.column }));
    placeCursorAtEndIfTemplate();
    if (autoFocus) ed.focus();
  };

  function placeCursorAtEndIfTemplate() {
    const ed = editorRef.current;
    const model = ed?.getModel();
    if (!ed || !model || value !== cfg.template) return;
    const line = model.getLineCount();
    ed.setPosition({ lineNumber: line, column: model.getLineMaxColumn(line) });
  }

  useEffect(placeCursorAtEndIfTemplate, [languageId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Editor
      height="100%"
      path={`happcode-${languageId}`}
      language={cfg.monacoLanguage}
      value={value}
      theme={THEME}
      beforeMount={defineHappTheme}
      onMount={handleMount}
      onChange={(v) => onChange(v ?? '')}
      options={options}
      loading={<div className="p-4 font-mono text-xs text-faint">Loading editor…</div>}
    />
  );
}
