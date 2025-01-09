import TestAPI from './components/TestAPI';
import MathTest from './components/MathTest';
import ResponseTest from './components/ResponseTest';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Claude API Test</h1>
      <div className="mb-8">
        <TestAPI />
      </div>
      <div className="mb-8 border-t pt-4">
        <MathTest />
      </div>
      <div className="mt-8 border-t pt-4">
        <ResponseTest />
      </div>
    </div>
  );
}

export default App;