
import { ExecutionStep, StackFrame, Variable } from '../types';

// A simple regex-based instrumenter. 
// In a production app, use tree-sitter-cpp WASM for robust AST traversal.

export const instrumentCppCode = (originalCode: string): string => {
  const lines = originalCode.split('\n');
  let instrumented = "#include <iostream>\n#include <vector>\n#include <map>\n";
  
  // Helper for logging
  // Format: __TRACE__ | line | func | var=val | var2=val2 ...
  const loggerFunc = `
  void __log_state(int line, const char* func) {
      std::cout << "\\n__TRACE__|" << line << "|" << func << "|";
  }
  template<typename T>
  void __log_var(const char* name, T val) {
      std::cout << name << "=" << val << ";";
  }
  `;
  
  instrumented += loggerFunc + "\n";
  
  // We need to inject includes at the top, but keep the rest.
  // We will scan for main and other functions.
  
  // Very basic heuristic: 
  // 1. Find lines that look like variable declarations inside blocks.
  // 2. Inject __log_state at start of lines.
  
  let inFunction = false;
  let bracesDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1;

    // Check for includes or using namespace (keep as is)
    if (trimmed.startsWith('#') || trimmed.startsWith('using')) {
        instrumented += line + "\n";
        continue;
    }

    // Check for start of main or function
    if (trimmed.includes('{')) bracesDepth++;
    if (trimmed.includes('}')) bracesDepth--;

    // Simple heuristic: If we are inside a function (depth > 0) and line ends with ; or {
    // inject a trace marker.
    if (bracesDepth > 0 && (trimmed.endsWith(';') || trimmed.endsWith('{')) && !trimmed.startsWith('//')) {
        instrumented += line + "\n";
        // Inject logger
        const funcName = bracesDepth === 1 ? "main" : "func"; // Simplified
        instrumented += `__log_state(${lineNum}, "${funcName}");`;
        
        // Attempt to log common variables (simple integers/strings found in previous lines)
        // This is where AST is strictly needed for perfection. 
        // For this demo, we won't auto-detect variables because regex detection of scope is too fragile.
        // Instead, we just trace LINE progression.
        instrumented += "std::cout << std::endl;"; 
    } else {
        instrumented += line + "\n";
    }
  }

  return instrumented;
};

export const parseCppOutput = (output: string): ExecutionStep[] => {
  const lines = output.split('\n');
  const steps: ExecutionStep[] = [];
  let stepId = 0;
  
  // Cumulative output buffer
  let consoleBuffer = "";

  lines.forEach(line => {
    if (line.startsWith("__TRACE__|")) {
        const parts = line.split('|'); // [__TRACE__, line, func, vars]
        const lineNum = parseInt(parts[1]);
        const func = parts[2];
        const varsStr = parts[3]; // "x=10;y=20;"

        // Parse variables
        const variables: Variable[] = [];
        if (varsStr) {
            varsStr.split(';').forEach(v => {
                if(!v) return;
                const [name, val] = v.split('=');
                variables.push({ name, value: val, type: 'auto' });
            });
        }

        steps.push({
            stepId: stepId++,
            line: lineNum,
            description: `Executing line ${lineNum}`,
            consoleOutput: consoleBuffer,
            stack: [{
                id: "0",
                functionName: func,
                variables: variables
            }],
            heap: [] // Heap tracking requires complex pointer overloading in C++
        });
    } else {
        consoleBuffer += line + "\n";
    }
  });

  return steps;
};
