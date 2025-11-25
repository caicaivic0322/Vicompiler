
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ResizableLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialSplit?: number; // Percentage (0-100)
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({ left, right, initialSplit = 40 }) => {
  const { theme } = useTheme();
  const [split, setSplit] = useState(initialSplit);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newSplit = (x / rect.width) * 100;
    
    // Limits
    if (newSplit > 15 && newSplit < 85) {
      setSplit(newSplit);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex w-full h-full overflow-hidden">
      <div style={{ width: `${split}%` }} className="h-full overflow-hidden">
        {left}
      </div>
      
      {/* Resizer Handle */}
      <div 
        onMouseDown={handleMouseDown}
        className={`w-1.5 h-full ${theme.colors.bgApp} hover:bg-blue-500 cursor-col-resize flex items-center justify-center transition-colors z-10 border-l border-r ${theme.colors.border}`}
      >
        <div className={`w-0.5 h-8 ${theme.colors.scrollThumb} rounded`}></div>
      </div>

      <div style={{ width: `${100 - split}%` }} className="h-full overflow-hidden">
        {right}
      </div>
    </div>
  );
};

// Vertical Splitter for the Right Panel
export const VerticalResizableLayout: React.FC<ResizableLayoutProps> = ({ left: top, right: bottom, initialSplit = 70 }) => {
  const { theme } = useTheme();
  const [split, setSplit] = useState(initialSplit);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const newSplit = (y / rect.height) * 100;
    
    if (newSplit > 15 && newSplit < 90) {
      setSplit(newSplit);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full overflow-hidden">
      <div style={{ height: `${split}%` }} className="w-full overflow-hidden">
        {top}
      </div>
      
      {/* Resizer Handle */}
      <div 
        onMouseDown={handleMouseDown}
        className={`w-full h-1.5 ${theme.colors.bgApp} hover:bg-blue-500 cursor-row-resize flex items-center justify-center transition-colors z-10 border-t border-b ${theme.colors.border}`}
      >
        <div className={`w-8 h-0.5 ${theme.colors.scrollThumb} rounded`}></div>
      </div>

      <div style={{ height: `${100 - split}%` }} className="w-full overflow-hidden">
        {bottom}
      </div>
    </div>
  );
};
