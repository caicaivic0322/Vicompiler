
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../contexts/ThemeContext';

interface FlowchartVisualizerProps {
  chartDefinition?: string;
  activeNodeId?: string;
}

export const FlowchartVisualizer: React.FC<FlowchartVisualizerProps> = ({ chartDefinition, activeNodeId }) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme.type === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
    });
  }, [theme.type]);

  useEffect(() => {
    const renderChart = async () => {
      if (!chartDefinition || !containerRef.current) {
        setSvgContent('');
        return;
      }

      try {
        const id = `mermaid-${Date.now()}`;
        // Insert Highlight Style into definition if we have an active node
        let definition = chartDefinition;
        if (activeNodeId) {
             // Append a style class to the active node
             definition += `\nstyle ${activeNodeId} stroke:#f59e0b,stroke-width:4px,fill:#fef3c7,color:#000`; 
             // Note: Mermaid might fail if nodeId is invalid, so wrapping in try/catch is important
        }

        const { svg } = await mermaid.render(id, definition);
        setSvgContent(svg);
      } catch (error) {
        console.warn("Mermaid rendering failed:", error);
        // Fallback or keep previous valid svg
      }
    };

    renderChart();
  }, [chartDefinition, activeNodeId, theme.type]);

  if (!chartDefinition) {
    return (
      <div className={`flex flex-col h-full items-center justify-center ${theme.colors.textMuted} p-8 text-center`}>
        <p className="text-sm">Flowchart will appear here after analysis.</p>
      </div>
    );
  }

  return (
    <div 
      className={`h-full w-full overflow-auto flex items-center justify-center p-4 ${theme.colors.bgPanel}`}
      ref={containerRef}
    >
        <div 
          dangerouslySetInnerHTML={{ __html: svgContent }} 
          className="w-full h-full flex items-center justify-center"
        />
    </div>
  );
};
