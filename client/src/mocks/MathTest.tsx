import MathDisplay from '../components/MathDisplay';

const MathTest = () => {
  const testEquations = [
    '\\[ E = mc^2 \\]',
    '\\[ \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi} \\]',
    'An inline equation: $a^2 + b^2 = c^2$',
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Math Rendering Test</h2>
      {testEquations.map((eq, index) => (
        <div key={index} className="mb-4">
          <MathDisplay tex={eq} />
        </div>
      ))}
    </div>
  );
};

export default MathTest;