// client/src/components/MathDisplay.tsx
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
      svg?: {
        scale?: number;
        minScale?: number;
        maxScale?: number;
        mtextInheritFont?: boolean;
        merrorInheritFont?: boolean;
        mathmlSpacing?: boolean;
        skipAttributes?: Record<string, unknown>;
        exFactor?: number;
        displayAlign?: string;
        displayIndent?: string;
        fontCache?: 'local' | 'global' | 'none';
        localID?: string | null;
        internalSpeechTitles?: boolean;
        titleID?: number;
      };
      chtml?: {
        scale?: number;
        minScale?: number;
        matchFontHeight?: boolean;
        mtextInheritFont?: boolean;
        merrorInheritFont?: boolean;
        mathmlSpacing?: boolean;
        skipAttributes?: Record<string, unknown>;
        exFactor?: number;
        displayAlign?: string;
        displayIndent?: string;
        fontURL?: string;
      };
    };
  }
}

interface MathDisplayProps {
  tex: string;
  align?: 'left' | 'center' | 'right';
}

const MathDisplay = ({ tex, align = 'left' }: MathDisplayProps) => {
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
        svg: {
          scale: 1,                      // global scaling factor
          minScale: 0.5,                 // smallest scaling factor
          maxScale: 3,                   // largest scaling factor
          mtextInheritFont: false,       // true to make mtext elements use surrounding font
          merrorInheritFont: true,       // true to make merror text use surrounding font
          mathmlSpacing: false,          // true for MathML spacing rules, false for TeX rules
          skipAttributes: {},            // RFDa and other attributes NOT to copy to the output
          exFactor: .5,                  // default size of ex in em units
          displayAlign: 'center',        // default for indentalign when set to 'auto'
          displayIndent: '0',            // default for indentshift when set to 'auto'
          fontCache: 'local',            // or 'global' or 'none'
          localID: null,                 // ID to use for local font cache (for single equation processing)
          internalSpeechTitles: true,    // insert <title> tags with speech content
          titleID: 0                     // initial id number to use for aria-labeledby titles
        },
        chtml: {
          scale: 1,                      // global scaling factor
          minScale: 0.5,                 // smallest scaling factor
          matchFontHeight: true,         // true to match ex-height of surrounding font
          mtextInheritFont: false,       // true to make mtext elements use surrounding font
          merrorInheritFont: true,       // true to make merror text use surrounding font
          mathmlSpacing: false,          // true for MathML spacing rules, false for TeX rules
          skipAttributes: {},            // RFDa and other attributes NOT to copy to the output
          exFactor: .5,                  // default size of ex in em units
          displayAlign: align,           // default for indentalign when set to 'auto'
          displayIndent: '0',            // default for indentshift when set to 'auto'
          fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2',
        }
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
              (element as HTMLElement).style.maxHeight = 'none';
              (element as HTMLElement).style.overflow = 'visible';
            });

            // Also target the specific display equation containers
            const displayEquations = containerRef.current.querySelectorAll('.mjx-container[jax="CHTML"][display="true"]');
            displayEquations.forEach(element => {
              (element as HTMLElement).style.maxHeight = 'none';
              (element as HTMLElement).style.overflow = 'visible';
              // Remove any margin constraints
              (element as HTMLElement).style.margin = '1em 0';
            });
          }
        });
    }
  }, [tex, align]); // Re-run when tex content or alignment changes

  return (
    <div 
      ref={containerRef}
      className={`math-display overflow-visible text-${align}`}
      style={{ 
        textAlign: align,
        maxHeight: 'none',
        overflow: 'visible'
      }}
    >
      {tex}
    </div>
  );
};

export default MathDisplay;