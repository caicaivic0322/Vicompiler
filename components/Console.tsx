import React from 'react';
import Editor from '@monaco-editor/react';
import { ResizableLayout } from './ResizableLayout';
import { useTheme } from '../contexts/ThemeContext';

interface ConsoleProps {
  output: string;
  input: string;
  setInput: (val: string) => void;
}

const OutputPanel: React.FC<{ output: string }> = ({ output }) => {
  const { theme } = useTheme();
  return (
    <div className={`h-full flex flex-col ${theme.colors.bgPanel}`}>
      <div className={`${theme.colors.bgHeader} px-3 py-1 text-xs ${theme.colors.textMuted} select-none flex items-center justify-between border-b ${theme.colors.border}`}>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          <span>Output</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language="plaintext"
          value={output || "Run code to see output..."}
          theme={theme.monacoTheme}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            lineNumbers: 'off',
            scrollBeyondLastLine: false,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            wordWrap: 'on',
            renderLineHighlight: 'none',
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </div>
  );
};

const InputPanel: React.FC<{ input: string; setInput: (v: string) => void }> = ({ input, setInput }) => {
  const { theme } = useTheme();
  return (
    <div className={`h-full flex flex-col ${theme.colors.bgPanel}`}>
      <div className={`${theme.colors.bgHeader} px-3 py-1 text-xs ${theme.colors.textMuted} select-none flex items-center gap-2 border-b ${theme.colors.border}`}>
        <span className={`${theme.syntax.value} font-bold`}>In</span>
        <span>Input</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language="plaintext"
          value={input}
          onChange={(val) => setInput(val || '')}
          theme={theme.monacoTheme}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'off',
            scrollBeyondLastLine: false,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            renderLineHighlight: 'none',
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </div>
  );
};

export const Console: React.FC<ConsoleProps> = ({ output, input, setInput }) => {
  const { theme } = useTheme();
  return (
    <div className={`h-full w-full ${theme.colors.bgApp} border-t ${theme.colors.border} overflow-hidden transition-colors duration-300`}>
        <ResizableLayout
            initialSplit={30}
            left={<InputPanel input={input} setInput={setInput} />}
            right={<OutputPanel output={output} />}
        />
    </div>
  );
};