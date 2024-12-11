interface ChatMessageProps {
  message: string;
  sender: string;
  timestamp: string;
  isSentByMe: boolean;
}

export const ChatMessage = ({ message, sender, timestamp, isSentByMe }: ChatMessageProps) => {
  return (
    <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isSentByMe ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg px-4 py-2`}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{sender}</span>
          <span className="text-xs opacity-70">{new Date(timestamp).toLocaleTimeString()}</span>
        </div>
        <p className="mt-1">{message}</p>
      </div>
    </div>
  );
};