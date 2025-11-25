
import React, { useState } from 'react';
import { ExecutionStep, StackFrame, Variable, HeapObject } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { FlowchartVisualizer } from './FlowchartVisualizer';
import { Layers, GitGraph } from 'lucide-react';

interface MemoryVisualizerProps {
  currentStep: ExecutionStep | null;
  language: 'cpp' | 'python';
  flowchart?: string;
}

// Subcomponent: Variable Row
const VariableRow: React.FC<{ variable: Variable; isCpp: boolean }> = ({ variable, isCpp }) => {
  const { theme } = useTheme();
  const isPointer = variable.isPointer;
  
  return (
    <div className={`flex justify-between items-center p-1.5 rounded text-xs transition-colors duration-200 ${variable.highlight ? theme.syntax.highlight : theme.colors.bgPanel}`}>
      <div className="flex flex-col">
        <span className={`${theme.syntax.variable} font-semibold`}>{variable.name}</span>
        {isCpp && <span className={`${theme.syntax.address} text-[10px]`}>{variable.address}</span>}
      </div>
      <div className="flex flex-col items-end">
        <span className={`${isPointer ? `${theme.syntax.pointer} font-mono` : theme.syntax.value}`}>
          {variable.value}
        </span>
        <span className={`${theme.syntax.type} text-[10px] italic`}>{variable.type}</span>
      </div>
    </div>
  );
};

// Subcomponent: Stack Frame
const StackFrameView: React.FC<{ frame: StackFrame; isCpp: boolean }> = ({ frame, isCpp }) => {
  const { theme } = useTheme();
  return (
    <div className={`border ${theme.colors.border} bg-opacity-30 rounded-lg overflow-hidden mb-3 shadow-sm`}>
      <div className={`bg-opacity-50 px-3 py-1 text-xs font-bold ${theme.colors.textMain} border-b ${theme.colors.border} flex justify-between`}>
        <span>{frame.functionName}</span>
        <span className={`font-mono ${theme.colors.textMuted} text-[10px]`}>Frame ID: {frame.id}</span>
      </div>
      <div className="p-2 space-y-1">
        {(!frame.variables || frame.variables.length === 0) ? (
          <div className={`${theme.colors.textMuted} text-xs italic text-center py-1`}>Empty Frame</div>
        ) : (
          frame.variables.map((v, idx) => (
            <VariableRow key={idx} variable={v} isCpp={isCpp} />
          ))
        )}
      </div>
    </div>
  );
};

// Subcomponent: Heap Object
const HeapBlock: React.FC<{ obj: HeapObject }> = ({ obj }) => {
  const { theme } = useTheme();
  return (
    <div className={`border ${theme.colors.border} ${theme.colors.bgPanel} rounded p-2 flex flex-col gap-1 min-w-[120px] shadow-sm relative group hover:border-blue-500 transition-colors`}>
       {/* Address Badge */}
       <div className={`absolute -top-2 -left-2 ${theme.syntax.address} bg-opacity-20 backdrop-blur-sm text-[10px] px-1.5 rounded border ${theme.colors.border} font-mono`}>
         {obj.address}
       </div>
       
       <div className={`mt-2 text-center text-sm ${theme.syntax.value} font-mono break-all`}>
         {typeof obj.value === 'object' ? JSON.stringify(obj.value) : obj.value}
       </div>
       <div className={`text-right text-[10px] ${theme.syntax.type}`}>{obj.type}</div>
    </div>
  );
};

export const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({ currentStep, language, flowchart }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'memory' | 'flow'>('memory');
  
  // Defensive copies
  const stack = currentStep?.stack || [];
  const heap = currentStep?.heap || [];

  return (
    <div className={`flex flex-col h-full ${theme.colors.bgApp} ${theme.colors.textMain} transition-colors duration-300`}>
      
      {/* Header with Tabs */}
      <div className={`${theme.colors.bgPanel} flex items-center justify-between border-b ${theme.colors.border}`}>
         <div className="flex">
            <button 
              onClick={() => setActiveTab('memory')}
              className={`px-4 py-2 text-xs font-medium flex items-center gap-2 border-r ${theme.colors.border} ${activeTab === 'memory' ? `${theme.colors.bgApp} ${theme.colors.textMain} border-b-2 border-b-blue-500` : `${theme.colors.textMuted} hover:${theme.colors.textMain}`}`}
            >
              <Layers size={14} /> Memory
            </button>
            <button 
              onClick={() => setActiveTab('flow')}
              className={`px-4 py-2 text-xs font-medium flex items-center gap-2 border-r ${theme.colors.border} ${activeTab === 'flow' ? `${theme.colors.bgApp} ${theme.colors.textMain} border-b-2 border-b-blue-500` : `${theme.colors.textMuted} hover:${theme.colors.textMain}`}`}
            >
              <GitGraph size={14} /> Control Flow
            </button>
         </div>
         {currentStep && (
            <span className={`${theme.colors.textMuted} font-normal text-xs px-3`}>{currentStep.description}</span>
         )}
      </div>

      <div className="flex-1 overflow-auto relative">
        {!currentStep && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${theme.colors.textMuted} p-8 text-center z-10 pointer-events-none`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
               </svg>
               <p>Run & Visualize to see Memory & Flow.</p>
            </div>
        )}

        {/* Tab Content */}
        {activeTab === 'memory' ? (
             <div className="flex p-4 gap-4 h-full">
                {/* Stack Region */}
                <div className="flex-1 flex flex-col min-w-[200px]">
                  <h3 className={`text-xs uppercase tracking-wider ${theme.colors.textMuted} mb-2 font-bold border-b ${theme.colors.border} pb-1 flex items-center gap-2`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Stack (LIFO)
                  </h3>
                  <div className={`flex flex-col-reverse justify-end min-h-[100px] border-l-2 border-dashed ${theme.colors.border} pl-4`}>
                    {currentStep && stack.length === 0 ? (
                        <div className={`${theme.colors.textMuted} italic text-xs p-4`}>Empty Stack</div>
                    ) : (
                        stack.map((frame, idx) => (
                          <StackFrameView key={idx} frame={frame} isCpp={language === 'cpp'} />
                        ))
                    )}
                  </div>
                </div>

                {/* Separator */}
                <div className={`w-px ${theme.colors.border} mx-2`}></div>

                {/* Heap Region */}
                <div className="flex-1 flex flex-col min-w-[200px]">
                  <h3 className={`text-xs uppercase tracking-wider ${theme.colors.textMuted} mb-2 font-bold border-b ${theme.colors.border} pb-1 flex items-center gap-2`}>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Heap (Dynamic)
                  </h3>
                  <div className={`flex flex-wrap gap-4 content-start min-h-[100px] bg-opacity-50 p-2 rounded-lg border ${theme.colors.border}`}>
                    {currentStep && heap.length === 0 ? (
                      <div className={`w-full text-center ${theme.colors.textMuted} text-xs py-8`}>No dynamic memory allocated</div>
                    ) : (
                      heap.map((obj, idx) => (
                        <HeapBlock key={idx} obj={obj} />
                      ))
                    )}
                  </div>
                </div>
             </div>
        ) : (
             <FlowchartVisualizer 
                chartDefinition={flowchart} 
                activeNodeId={currentStep?.flowchartNodeId} 
             />
        )}
      </div>
    </div>
  );
};
