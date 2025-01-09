import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    MathJax: {
      typesetPromise: (elements?: (HTMLElement | null)[]) => Promise<void>;
      typeset?: (elements?: (HTMLElement | null)[]) => void;
      tex?: {
        inlineMath: string[][];
        displayMath: string[][];
      };
      startup?: {
        promise: Promise<void>;
      };
      hub?: {
        Queue: (callback: () => void) => void;
        Typeset: (element?: HTMLElement) => void;
      };
    };
  }
}

interface MathDisplayProps {
  tex: string;
}

const MathDisplay = ({ tex }: MathDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Configure MathJax (only if not already configured)
    if (!window.MathJax?.tex) {
      window.MathJax = {
        ...window.MathJax,
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
        },
      };

      // Load MathJax if not already loaded
      if (!document.querySelector('script[src*="mathjax"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }

    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([containerRef.current])
        .then(() => {
          // After MathJax processing, ensure any overflow containers are properly sized
          if (containerRef.current) {
            const mathElements = containerRef.current.querySelectorAll('.MathJax');
            mathElements.forEach(element => {
              (element as HTMLElement).style.maxWidth = '100%';
              (element as HTMLElement).style.overflowX = 'auto';
            });
          }
        });
    }
  }, [tex]); // Re-run when tex content changes

  return (
    <div 
      ref={containerRef}
      className="math-display overflow-x-auto"
    >
      {tex}
    </div>
  );
};

export default MathDisplay;