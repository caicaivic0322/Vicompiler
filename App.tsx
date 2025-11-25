
import React, { useState, useEffect, useCallback } from 'react';
import { ResizableLayout, VerticalResizableLayout } from './components/ResizableLayout';
import { CodeEditor } from './components/CodeEditor';
import { MemoryVisualizer } from './components/MemoryVisualizer';
import { Console } from './components/Console';
import { Controls } from './components/Controls';
import { analyzeCodeLocally } from './services/localAnalysisService'; // Changed import
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

  // Button: Run Code (Compilation / Execution only)
  const handleRun = async () => {
    setIsAnalyzing(true);
    setConsoleOutput('> Compiling/Executing...\n');
    setSteps([]); 
    setFlowchart(undefined);
    setCurrentStepIndex(-1);

    let result;
    if (language === 'cpp') {
       result = await executeCppCode(code, consoleInput);
    } else {
       result = await executePythonCode(code, consoleInput);
    }
    
    setConsoleOutput(result.output);
    setIsAnalyzing(false);
  };

  // Button: Visualize Memory (Uses Local Instrumentation)
  const handleVisualize = async () => {
    setIsAnalyzing(true);
    setConsoleOutput('> Instrumenting and analyzing locally...\n');
    setSteps([]); 
    setFlowchart(undefined);
    setCurrentStepIndex(-1);

    // Call Local Analysis Service (No AI)
    const result = await analyzeCodeLocally(code, language, consoleInput);

    setIsAnalyzing(false);

    if (result.error) {
      setConsoleOutput(`Analysis Error: ${result.error}`);
      return;
    }

    if (result.steps && result.steps.length > 0) {
      setSteps(result.steps);
      setFlowchart(result.flowchart);
      setCurrentStepIndex(0);
    } else {
      setConsoleOutput('> Trace complete but no steps captured. (Did the code run?)');
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

  useEffect(() => {
    if (currentStepIndex >= 0 && steps[currentStepIndex]) {
      // In local tracing mode, we captured the console state at each step.
      // If consoleOutput is provided in the step, use it.
      // Otherwise, we might want to just show the cumulative output.
      const step = steps[currentStepIndex];
      // Note: Python tracer doesn't easily capture partial stdout mid-line without buffering overrides, 
      // but C++ instrumentation keeps track of it. 
      // For now, we rely on the step's consoleOutput if present.
      if (step.consoleOutput !== undefined) {
         setConsoleOutput(step.consoleOutput);
      }
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
