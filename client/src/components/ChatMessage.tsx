import MathDisplay from './MathDisplay';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const ChatMessage = ({ type, content, timestamp }: ChatMessage) => {
  return (
    <div className="mb-4 w-full text-left">
      <div className={`
        p-4 rounded-lg
        ${type === 'user' 
          ? 'ml-auto mr-4 bg-blue-600 text-white max-w-[80%]'
          : 'ml-4 mr-auto bg-gray-700 text-white max-w-[80%]'
        }
      `}>
        {/* Message content */}
        <div className="mb-2 text-left">
          <MathDisplay tex={content} />
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className="text-xs opacity-75 text-left">
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;