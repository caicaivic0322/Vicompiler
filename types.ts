
export type Language = 'cpp' | 'python';

export interface Variable {
  name: string;
  type: string;
  value: string;
  address?: string; // Memory address (e.g., 0x7fff...)
  isPointer?: boolean;
  pointsTo?: string; // Address it points to
  highlight?: boolean; // If changed in this step
}

export interface StackFrame {
  id: string;
  functionName: string;
  variables: Variable[];
  line?: number; // Line number in that function
}

export interface HeapObject {
  address: string;
  value: string | object;
  type: string;
  color?: string; // For visual matching with stack pointers
}

export interface ExecutionStep {
  stepId: number;
  line: number; // Line number in the source code
  description: string; // "Created variable x", "Allocated memory", etc.
  stack: StackFrame[];
  heap: HeapObject[];
  consoleOutput?: string; // Output produced at this step
  flowchartNodeId?: string; // The ID of the node in the Mermaid graph that is currently active
}

export interface SimulationResponse {
  steps: ExecutionStep[];
  flowchart?: string; // Mermaid graph definition
  error?: string;
}

export interface ThemeColors {
  bgApp: string;
  bgPanel: string;
  bgHeader: string;
  textMain: string;
  textMuted: string;
  border: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  scrollTrack: string;
  scrollThumb: string;
  scrollThumbHover: string;
}

export interface SyntaxColors {
  variable: string;
  value: string;
  type: string;
  address: string;
  pointer: string;
  highlight: string;
  headerIcon: string;
}

export interface Theme {
  id: string;
  name: string;
  type: 'dark' | 'light';
  colors: ThemeColors;
  syntax: SyntaxColors;
  monacoTheme: 'vs-dark' | 'light';
}