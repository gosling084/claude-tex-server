// client/src/components/ChatMessage.tsx
import MathDisplay from './MathDisplay';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'draft';
  content: string;
  timestamp?: Date;
}

const ChatMessage = ({ type, content, timestamp }: ChatMessage) => {
  return (
    <div className={`message message-${type}`}>
        {/* Message content */}
        <div >
          <MathDisplay tex={content} />
        </div>

        {/* Timestamp - don't show for draft messages */}
        {timestamp && type !== 'draft' && (
          <div className="message-timestamp">
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
    </div>
  );
};

export default ChatMessage;