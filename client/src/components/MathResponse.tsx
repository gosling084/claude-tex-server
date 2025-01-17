// client/src/components/MathResponse.tsx
import MathDisplay from './MathDisplay';

interface MathResponseProps {
  content: string;
}

const MathResponse = ({ content }: MathResponseProps) => {
  // Split content into segments based on LaTeX delimiters
  const parseContent = (text: string) => {
    const segments: { type: 'text' | 'math' | 'display-math'; content: string }[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      // Check for display math \[ ... \]
      if (text.slice(currentIndex).startsWith('\\[')) {
        const endIndex = text.indexOf('\\]', currentIndex);
        if (endIndex !== -1) {
          // Add text before the math if there is any
          if (currentIndex > 0) {
            segments.push({
              type: 'text',
              content: text.slice(0, currentIndex)
            });
          }
          segments.push({
            type: 'display-math',
            content: text.slice(currentIndex, endIndex + 2)
          });
          currentIndex = endIndex + 2;
          continue;
        }
      }

      // Check for inline math $ ... $
      if (text[currentIndex] === '$') {
        const endIndex = text.indexOf('$', currentIndex + 1);
        if (endIndex !== -1) {
          // Add text before the math if there is any
          if (currentIndex > 0) {
            segments.push({
              type: 'text',
              content: text.slice(0, currentIndex)
            });
          }
          segments.push({
            type: 'math',
            content: text.slice(currentIndex, endIndex + 1)
          });
          currentIndex = endIndex + 1;
          continue;
        }
      }

      // If no math delimiters found or at the end, add remaining text
      segments.push({
        type: 'text',
        content: text.slice(currentIndex)
      });
      break;
    }

    return segments;
  };

  const segments = parseContent(content);

  return (
    <div className="math-response space-y-4">
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'display-math':
            return (
              <div key={index} className="my-4">
                <MathDisplay tex={segment.content} />
              </div>
            );
          case 'math':
            return <MathDisplay key={index} tex={segment.content} />;
          case 'text':
          default:
            return <span key={index}>{segment.content}</span>;
        }
      })}
    </div>
  );
};

export default MathResponse;