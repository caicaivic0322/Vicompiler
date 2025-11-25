
import React, { useState, useEffect, useCallback } from 'react';
import { ResizableLayout, VerticalResizableLayout } from './components/ResizableLayout';
import { CodeEditor } from './components/CodeEditor';
import { MemoryVisualizer } from './components/MemoryVisualizer';
import { Console } from './components/Console';
import { Controls } from './components/Controls';
import { analyzeCode } from './services/geminiService';
import { executeCppCode } from './services/pistonService';
import { executePythonCode } from './services/pyodideService';
import { DEFAULT_CPP, DEFAULT_PYTHON } from './constants';
import { Language, ExecutionStep } from './types';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme } = useTheme();
  const [language, setLanguage] = useState<Language>('cpp');
  const [code, setCode] = useState(DEFAULT_CPP);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [flowchart, setFlowchart] = useState<string | undefined>(undefined);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [consoleInput, setConsoleInput] = useState('');
  
  // Single source of truth for console text.
  // In 'Run' mode: shows full execution output.
  // In 'Visualize' mode: shows cumulative output for the current step.
  const [consoleOutput, setConsoleOutput] = useState('');

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === language) return;
    setLanguage(newLang);
    setCode(newLang === 'cpp' ? DEFAULT_CPP : DEFAULT_PYTHON);
    handleReset();
  };

  const handleLoadExample = (newCode: string) => {
    setCode(newCode);
    handleReset();
  };

  const handleReset = () => {
    setSteps([]);
    setFlowchart(undefined);
    setCurrentStepIndex(-1);
    setConsoleOutput('');
  };

  // Helper to run code (Output Only)
  const runCodeInternal = async (): Promise<{ success: boolean; output: string }> => {
     let result = { success: false, output: '' };
     
     if (language === 'cpp') {
        const res = await executeCppCode(code, consoleInput);
        result = res;
     } else {
        const res = await executePythonCode(code, consoleInput);
        result = res;
     }
     return result;
  };

  // Button: Run Code (Compilation / Execution only)
  const handleRun = async () => {
    setIsAnalyzing(true);
    setConsoleOutput('> Compiling/Executing...\n');
    setSteps([]); // Clear visualization on simple run
    setFlowchart(undefined);
    setCurrentStepIndex(-1);

    const result = await runCodeInternal();
    
    setConsoleOutput(result.output);
    setIsAnalyzing(false);
  };

  // Button: Visualize Memory (Generates steps)
  const handleVisualize = async () => {
    if (!process.env.API_KEY) {
        alert("Please provide an API Key in the environment.");
        return;
    }

    setIsAnalyzing(true);
    setConsoleOutput('> Pre-calculating execution path...\n');
    setSteps([]); 
    setFlowchart(undefined);
    setCurrentStepIndex(-1);

    // 1. Run "Output Only" first to get a ground truth to help the AI
    const runResult = await runCodeInternal();
    
    if (!runResult.success) {
        setConsoleOutput(`> Compilation/Runtime Error. Cannot visualize.\n\n${runResult.output}`);
        setIsAnalyzing(false);
        return;
    }

    setConsoleOutput('> Analyzing memory trace (AI)...\n');

    // 2. Analyze with Gemini
    const result = await analyzeCode(code, language, runResult.output);

    setIsAnalyzing(false);

    if (result.error) {
      setConsoleOutput(`Error: ${result.error}`);
      return;
    }

    if (result.steps && result.steps.length > 0) {
      setSteps(result.steps);
      setFlowchart(result.flowchart);
      setCurrentStepIndex(0);
      // The useEffect below will handle updating the consoleOutput to match step 0
    } else {
      setConsoleOutput('> No steps generated. Check code syntax.');
    }
  };

  const handleStep = useCallback((direction: number) => {
    setCurrentStepIndex(prev => {
      const next = prev + direction;
      if (next < 0) return 0;
      if (next >= steps.length) return steps.length - 1;
      return next;
    });
  }, [steps.length]);

  // Sync console output with current visualization step
  useEffect(() => {
    if (currentStepIndex >= 0 && steps[currentStepIndex]) {
      const step = steps[currentStepIndex];
      
      // Calculate cumulative output up to this step
      let accumulatedOutput = '> Visualization Mode Started\n';
      for (let i = 0; i <= currentStepIndex; i++) {
        if (steps[i].consoleOutput) {
          accumulatedOutput += steps[i].consoleOutput + '\n';
        }
      }
      setConsoleOutput(accumulatedOutput);
    }
  }, [currentStepIndex, steps]);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-300 ${theme.colors.bgApp} ${theme.colors.textMain}`}>
      
      <Controls 
        language={language}
        setLanguage={handleLanguageChange}
        onRun={handleRun}
        onVisualize={handleVisualize}
        onReset={handleReset}
        isAnalyzing={isAnalyzing}
        step={currentStepIndex}
        totalSteps={steps.length}
        onStep={handleStep}
        onLoadExample={handleLoadExample}
      />

      <div className="flex-1 overflow-hidden relative">
        <ResizableLayout
          initialSplit={45}
          left={
            <CodeEditor 
              code={code} 
              setCode={setCode} 
              activeLine={currentStep ? currentStep.line : undefined}
              language={language}
            />
          }
          right={
            <VerticalResizableLayout
              initialSplit={70}
              left={
                <MemoryVisualizer 
                  currentStep={currentStep} 
                  language={language}
                  flowchart={flowchart}
                />
              }
              right={
                <Console 
                  output={consoleOutput}
                  input={consoleInput}
                  setInput={setConsoleInput}
                />
              }
            />
          }
        />
      </div>
    </div>
  );
}

export default App;
