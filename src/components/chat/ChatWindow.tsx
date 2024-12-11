import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

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
  sender: {
    email: string;
  } | null;
}

export const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            id,
            content,
            sender_id,
            created_at,
            sender:sender_id(email)
          `)
          .order('created_at', { ascending: true }) as { data: ChatMessageWithProfile[] | null, error: any };

        if (error) throw error;

        if (data) {
          const formattedMessages = data.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            created_at: msg.created_at,
            sender_email: msg.sender?.email || 'Unknown'
          }));
          
          setMessages(formattedMessages);
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error("Error al cargar los mensajes");
      }
    };

    fetchMessages();

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
          try {
            const { data: messageData } = await supabase
              .from('chat_messages')
              .select(`
                id,
                content,
                sender_id,
                created_at,
                sender:sender_id(email)
              `)
              .eq('id', payload.new.id)
              .single() as { data: ChatMessageWithProfile | null };

            if (messageData) {
              const newMessage: Message = {
                id: messageData.id,
                content: messageData.content,
                sender_id: messageData.sender_id,
                created_at: messageData.created_at,
                sender_email: messageData.sender?.email || 'Unknown'
              };

              setMessages(prev => [...prev, newMessage]);
              setTimeout(scrollToBottom, 100);
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);

    if (!currentUser) {
      toast.error("Debes iniciar sesión para enviar mensajes");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content: content.trim(),
          sender_id: currentUser.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Error al enviar el mensaje");
    } finally {
      setIsLoading(false);
    }
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
              isSentByMe={message.sender_id === currentUser?.id}
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