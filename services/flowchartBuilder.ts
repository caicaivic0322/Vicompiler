
import { Language } from '../types';

export const generateFlowchart = (code: string, language: Language): string => {
  let mermaid = "graph TD;\n";
  mermaid += "Start((Start)) --> L0;\n";

  const lines = code.split('\n');
  
  // Robustness: Filter empty lines and comments
  const meaningfulLines = lines.map((line, idx) => ({ text: line.trim(), idx: idx + 1 }))
                               .filter(l => l.text && !l.text.startsWith('//') && !l.text.startsWith('#'));

  for (let i = 0; i < meaningfulLines.length; i++) {
      const current = meaningfulLines[i];
      const next = meaningfulLines[i+1];
      
      const nodeId = `L${current.idx}`;
      let label = current.text.substring(0, 20).replace(/["()]/g, ''); // Sanitize
      if (current.text.length > 20) label += "...";

      // Shape Logic
      if (current.text.startsWith('if') || current.text.startsWith('while') || current.text.startsWith('for')) {
          mermaid += `${nodeId}{"${label}"};\n`;
          if (next) mermaid += `${nodeId} -- True --> L${next.idx};\n`;
      } else if (current.text.includes('return')) {
          mermaid += `${nodeId}[["${label}"]];\n`;
          mermaid += `${nodeId} --> End((End));\n`;
      } else {
          mermaid += `${nodeId}["${label}"];\n`;
          if (next) mermaid += `${nodeId} --> L${next.idx};\n`;
      }
  }

  return mermaid;
};
