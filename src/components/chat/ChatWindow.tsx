import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_email: string;
  created_at: string;
}

interface ChatMessageWithProfile {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  profiles: {
    email: string;
  } | null;
}

export const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState(supabase.auth.getUser());

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          profiles (email)
        `)
        .order('created_at', { ascending: true }) as { data: ChatMessageWithProfile[] | null, error: any };

      if (error) {
        toast.error("Error al cargar los mensajes");
        return;
      }

      if (data) {
        setMessages(data.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          created_at: msg.created_at,
          sender_email: msg.profiles?.email || 'Unknown'
        })));
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            sender_id: payload.new.sender_id,
            created_at: payload.new.created_at,
            sender_email: profile?.email || 'Unknown'
          };

          setMessages(prev => [...prev, newMessage]);
          
          // Scroll to bottom on new message
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);
    const userResponse = await currentUser;
    const user = userResponse.data.user;

    if (!user) {
      toast.error("Debes iniciar sesión para enviar mensajes");
      return;
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        sender_id: user.id
      });

    if (error) {
      toast.error("Error al enviar el mensaje");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg p-4">
      <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.content}
              sender={message.sender_email}
              timestamp={message.created_at}
              isSentByMe={message.sender_id === currentUser.data?.user?.id}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="mt-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};