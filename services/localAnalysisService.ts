
import { Language, SimulationResponse, ExecutionStep } from '../types';
import { executePythonCode } from './pyodideService';
import { executeCppCode } from './pistonService';
import { PYTHON_TRACE_SCRIPT } from './pythonTracer';
import { instrumentCppCode, parseCppOutput } from './cppInstrumenter';
import { generateFlowchart } from './flowchartBuilder';

export const analyzeCodeLocally = async (
  code: string, 
  language: Language, 
  stdin: string
): Promise<SimulationResponse> => {
  
  // 1. Generate Flowchart (Deterministic)
  const flowchart = generateFlowchart(code, language);

  if (language === 'python') {
    return await analyzePython(code, stdin, flowchart);
  } else {
    return await analyzeCpp(code, stdin, flowchart);
  }
};

const analyzePython = async (code: string, stdin: string, flowchart: string): Promise<SimulationResponse> => {
  try {
    // Inject the tracing script
    // We pass the user code as a string variable 'user_code_to_trace'
    // The tracing script runs exec(user_code_to_trace) internally
    
    // We need to modify how pyodide receives the code. 
    // Instead of running the user code directly, we run the TRACER, which runs the user code.
    
    // Pass user code to global scope first
    const setupCode = `user_code_to_trace = ${JSON.stringify(code)}`;
    
    // Execute Setup
    await executePythonCode(setupCode, "");
    
    // Execute Tracer
    const result = await executePythonCode(PYTHON_TRACE_SCRIPT, stdin);
    
    if (!result.success) {
      return { steps: [], error: result.output };
    }

    // Parse Output
    // The output contains: Real Output + ___TRACE_START___ + JSON + ___TRACE_END___
    const fullOutput = result.output;
    const traceStart = fullOutput.indexOf("___TRACE_START___");
    const traceEnd = fullOutput.indexOf("___TRACE_END___");

    if (traceStart === -1 || traceEnd === -1) {
       return { steps: [], error: "Failed to generate trace. Python error likely occurred." };
    }

    const realOutput = fullOutput.substring(0, traceStart).trim();
    const jsonStr = fullOutput.substring(traceStart + 17, traceEnd).trim();
    
    let steps: ExecutionStep[] = JSON.parse(jsonStr);

    // Post-process steps to add Flowchart Node IDs map (Simple mapping by line number)
    steps = steps.map(step => ({
      ...step,
      flowchartNodeId: `L${step.line}` // Flowchart generator uses L{line} as ID
    }));

    return { steps, flowchart };

  } catch (e: any) {
    return { steps: [], error: e.message };
  }
};

const analyzeCpp = async (code: string, stdin: string, flowchart: string): Promise<SimulationResponse> => {
  try {
    // 1. Instrument Code
    const instrumented = instrumentCppCode(code);
    
    // 2. Run on Piston
    const result = await executeCppCode(instrumented, stdin);
    
    if (!result.success) {
      // If instrumentation caused failure, might be a complex syntax error
      return { steps: [], error: "Compilation Error:\n" + result.output };
    }

    // 3. Parse Output to extract state
    const steps = parseCppOutput(result.output);
    
    // 4. Map to Flowchart
    const stepsWithFlow = steps.map(step => ({
        ...step,
        flowchartNodeId: `L${step.line}`
    }));

    return { steps: stepsWithFlow, flowchart };

  } catch (e: any) {
    return { steps: [], error: e.message };
  }
};
