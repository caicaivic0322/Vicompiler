
import React from 'react';
import { Language } from '../types';
import { Play, RotateCcw, ChevronLeft, ChevronRight, Cpu, Eye, Palette } from 'lucide-react';
import { CPP_EXAMPLES, PYTHON_EXAMPLES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { THEMES } from '../themes';

interface ControlsProps {
  language: Language;
  setLanguage: (l: Language) => void;
  onRun: () => void;
  onVisualize: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
  step: number;
  totalSteps: number;
  onStep: (dir: number) => void;
  onLoadExample: (code: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({ 
  language, setLanguage, onRun, onVisualize, onReset, isAnalyzing, step, totalSteps, onStep, onLoadExample
}) => {
  const { theme, setThemeId, currentThemeId } = useTheme();
  const currentExamples = language === 'cpp' ? CPP_EXAMPLES : PYTHON_EXAMPLES;

  return (
    <div className={`h-14 ${theme.colors.bgHeader} ${theme.colors.border} border-b flex items-center justify-between px-4 shadow-md z-20 transition-colors duration-300`}>
      
      {/* Branding & Lang Switch */}
      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-2 ${theme.syntax.headerIcon} font-bold text-lg hidden md:flex`}>
          <Cpu className="w-6 h-6" />
          <span>VizCompiler</span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex rounded-md p-1 border ${theme.colors.border} ${theme.colors.bgPanel}`}>
            <button 
              onClick={() => setLanguage('cpp')}
              className={`px-3 py-1 text-xs rounded transition-colors ${language === 'cpp' ? theme.colors.buttonPrimary : `${theme.colors.textMuted} hover:${theme.colors.textMain}`}`}
            >
              C++
            </button>
            <button 
              onClick={() => setLanguage('python')}
              className={`px-3 py-1 text-xs rounded transition-colors ${language === 'python' ? 'bg-yellow-600 text-white' : `${theme.colors.textMuted} hover:${theme.colors.textMain}`}`}
            >
              Python
            </button>
          </div>

          {/* Example Dropdown */}
          <div className="relative group">
            <select 
              className={`${theme.colors.bgPanel} text-xs ${theme.colors.textMain} border ${theme.colors.border} rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[140px] transition-colors`}
              onChange={(e) => onLoadExample(currentExamples[e.target.value])}
              defaultValue=""
            >
              <option value="" disabled>Load Example...</option>
              {Object.keys(currentExamples).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Playback Controls (Only visible when stepping) */}
      {totalSteps > 0 && (
        <div className={`flex items-center gap-2 ${theme.colors.bgPanel} px-3 py-1.5 rounded-full border ${theme.colors.border} animate-in fade-in zoom-in duration-300`}>
           <button 
             onClick={() => onStep(-1)} 
             disabled={step <= 0}
             className={`p-1 rounded-full disabled:opacity-30 disabled:hover:bg-transparent ${theme.colors.textMuted} hover:${theme.colors.bgApp} transition`}
             title="Previous Step"
            >
             <ChevronLeft size={20} />
           </button>
           
           <span className={`text-xs font-mono w-16 text-center ${theme.colors.textMuted}`}>
             {step + 1} / {totalSteps}
           </span>

           <button 
             onClick={() => onStep(1)} 
             disabled={step >= totalSteps - 1}
             className={`p-1 rounded-full disabled:opacity-30 disabled:hover:bg-transparent ${theme.colors.textMuted} hover:${theme.colors.bgApp} transition`}
             title="Next Step"
           >
             <ChevronRight size={20} />
           </button>
        </div>
      )}

      {/* Main Actions */}
      <div className="flex items-center gap-3">
        
        {/* Theme Selector */}
        <div className="flex items-center mr-2">
            <Palette className={`w-4 h-4 mr-2 ${theme.colors.textMuted}`} />
            <select 
              className={`${theme.colors.bgPanel} text-xs ${theme.colors.textMain} border ${theme.colors.border} rounded px-2 py-1 focus:outline-none cursor-pointer`}
              value={currentThemeId}
              onChange={(e) => setThemeId(e.target.value)}
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
        </div>

        <button 
          onClick={onReset}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium ${theme.colors.buttonSecondaryText} ${theme.colors.buttonSecondary} transition`}
        >
          <RotateCcw size={14} />
          Reset
        </button>

        {/* Separator */}
        <div className={`w-px h-6 ${theme.colors.border}`}></div>

        <button 
          onClick={onRun}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold text-gray-200 bg-gray-700 hover:bg-gray-600 transition border border-gray-600`}
        >
          <Play size={16} fill="currentColor" /> Run
        </button>

        <button 
          onClick={onVisualize}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold transition shadow-lg ${theme.colors.buttonPrimary}
            ${isAnalyzing ? 'cursor-wait opacity-80' : ''}`}
        >
          {isAnalyzing ? (
             <><span className="animate-spin text-lg">⟳</span> Analyzing...</>
          ) : (
             <><Eye size={16} /> Visualize Memory</>
          )}
        </button>
      </div>

    </div>
  );
};
