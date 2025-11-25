
import { GoogleGenAI, Type } from "@google/genai";
import { Language, SimulationResponse } from '../types';

const SYSTEM_PROMPT = `
You are a Computer Science Tutor Backend. 
Your goal is to "compile" and "run" code in your head, but instead of just output, you produce a step-by-step trace of the computer's memory (Stack and Heap) and a Control Flow Graph.

Rules:
1. Parse the provided code (C++ or Python).
2. **Flowchart**: Generate a valid Mermaid.js flowchart definition (graph TD) that represents the logic structure of the code (Nodes for Start, conditions, loops, operations, End). Assign simple IDs like A, B, C...
3. **Execution Trace**: Generate a JSON trace showing the state of the program after *every significant line*.
4. **Linkage**: For each execution step, provide the 'flowchartNodeId' that corresponds to the current logic block in your Mermaid graph.
5. **Stack**: Show the stack frames growing and shrinking. Include variable names, types, values, and mocked memory addresses (e.g., 0x7ffd4).
6. **Heap**: For C++ 'new/malloc' or Python objects (lists, dicts, custom objects), show them in the Heap section with distinct addresses (e.g., 0x55a1).
7. **Pointers**: If a stack variable points to the heap, ensure the 'value' matches the heap object's 'address'.
8. If there is a syntax error, return a single step with the error description in consoleOutput.
9. Keep addresses consistent across steps.
10. **Consistency**: If I provide "Expected Output", ensure your trace's consoleOutput cumulatively matches the real execution.
`;

export const analyzeCode = async (code: string, language: Language, expectedOutput?: string): Promise<SimulationResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let prompt = `
    Analyze this ${language} code and generate an execution trace with a flowchart.
    
    Code:
    ${code}
    `;

    if (expectedOutput) {
        prompt += `
        
        IMPORTANT: This code was actually run and produced the following output. 
        Ensure your step-by-step 'consoleOutput' matches this exactly when summed up.
        
        REAL OUTPUT:
        ${expectedOutput}
        `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flowchart: { type: Type.STRING, description: "Mermaid graph definition (e.g. graph TD; A[Start]-->B[Init];)" },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepId: { type: Type.INTEGER },
                  line: { type: Type.INTEGER, description: "The 1-based line number currently executing" },
                  description: { type: Type.STRING, description: "Short explanation of what happened" },
                  consoleOutput: { type: Type.STRING, description: "Any text printed to stdout in this step (optional)" },
                  flowchartNodeId: { type: Type.STRING, description: "The Node ID in the flowchart active at this step" },
                  stack: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        functionName: { type: Type.STRING },
                        variables: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              type: { type: Type.STRING },
                              value: { type: Type.STRING },
                              address: { type: Type.STRING },
                              isPointer: { type: Type.BOOLEAN },
                              pointsTo: { type: Type.STRING, description: "If pointer, the address it points to" },
                              highlight: { type: Type.BOOLEAN, description: "True if modified in this step" }
                            }
                          }
                        }
                      }
                    }
                  },
                  heap: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        address: { type: Type.STRING },
                        type: { type: Type.STRING },
                        value: { type: Type.STRING, description: "String representation of the object/value" },
                        color: { type: Type.STRING, description: "A hex color code to identify this object visually (optional)" }
                      }
                    }
                  }
                }
              }
            },
            error: { type: Type.STRING, description: "If syntax error, put message here" }
          }
        }
      }
    });

    let text = response.text;
    
    if (text) {
      // Robustness: Extract JSON object from potential surrounding text
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }
      
      return JSON.parse(text) as SimulationResponse;
    }
    
    throw new Error("No response text from AI");

  } catch (err) {
    console.error("Gemini Analysis Error:", err);
    return {
      steps: [],
      error: "Failed to analyze code. The model might be overloaded or the response was invalid. Please try again."
    };
  }
};