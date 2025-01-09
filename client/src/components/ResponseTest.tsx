import MathResponse from './MathResponse';

const ResponseTest = () => {
  const testResponses = [
    {
      title: "Simple Response",
      content: "The solution is $x = 5$."
    },
    {
      title: "Mixed Content",
      content: "To find the derivative of $e^x$, we follow these steps:\n\n\\[\n\\frac{d}{dx}e^x = e^x\n\\]\n\nThis is because $e^x$ is its own derivative."
    },
    {
      title: "Multi-step Solution",
      content: `Let's solve $x^2 + 5x + 6 = 0$:

\\[
\\begin{align*}
x^2 + 5x + 6 &= 0 \\\\
(x + 2)(x + 3) &= 0 \\\\
x &= -2 \\text{ or } x = -3
\\end{align*}
\\]

Therefore, the solutions are $x = -2$ and $x = -3$.`
    },
    {
      title: "Alternative Multi-step Format",
      content: `Here's another way to format multiple steps:

\\[
\\begin{gathered}
x^2 + 5x + 6 = 0 \\\\
(x + 2)(x + 3) = 0 \\\\
x = -2 \\text{ or } x = -3
\\end{gathered}
\\]

This uses gathered environment instead of align`

    }
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Response Format Tests</h2>
      {testResponses.map((response, index) => (
        <div key={index} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{response.title}</h3>
          <MathResponse content={response.content} />
        </div>
      ))}
    </div>
  );
};

export default ResponseTest;