import ChatMessage from "../components/ChatMessage";

const ChatMessageTest = () => {
  const testMessages = [
    {
      id: '1',
      type: 'user' as const,
      content: 'What is the quadratic formula?',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'assistant' as const,
      content: 'The quadratic formula for solving $ax^2 + bx + c = 0$ is:\n\n\\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]',
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'user' as const,
      content: 'Here\'s another way to write it:\n\n\\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]\n\nCan you solve $x^2 + 5x + 6 = 0$?',
      timestamp: new Date()
    },
  ];

  return (
    // Changed space-y-4 to p-4 for container padding
    <div className="p-4">
      {testMessages.map(message => (
        <ChatMessage key={message.id} {...message} />
      ))}
    </div>
  );
};

export default ChatMessageTest;