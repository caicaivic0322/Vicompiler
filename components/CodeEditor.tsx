
import React, { useRef, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  activeLine?: number;
  language: 'cpp' | 'python';
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, activeLine, language }) => {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const monaco = useMonaco();
  const decorationsRef = useRef<string[]>([]);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
  }

  // Handle Active Line Highlighting
  useEffect(() => {
    if (!editorRef.current || !monaco) return;

    if (activeLine && activeLine > 0) {
      const newDecorations = [
        {
          range: new monaco.Range(activeLine, 1, activeLine, 1),
          options: {
            isWholeLine: true,
            className: 'execution-line-highlight', // Defined in index.html
          },
        },
      ];
      
      // Apply decorations (old API style compatible with most versions)
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        newDecorations
      );

      // Smoothly scroll to the line
      editorRef.current.revealLineInCenter(activeLine);
    } else {
      // Clear decorations if no active line
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [activeLine, monaco]);

  return (
    <div className={`h-full w-full ${theme.colors.bgApp} overflow-hidden transition-colors duration-300`}>
      <Editor
        height="100%"
        language={language === 'cpp' ? 'cpp' : 'python'}
        value={code}
        theme={theme.monacoTheme}
        onChange={(value) => setCode(value || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderLineHighlight: 'none', // Disable default highlight to use our custom one
          contextmenu: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
};
