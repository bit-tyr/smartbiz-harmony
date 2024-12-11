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
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        if (messagesData) {
          // Fetch all unique sender IDs
          const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
          
          // Fetch profiles for all senders
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', senderIds);

          if (profilesError) throw profilesError;

          // Create a map of sender IDs to emails
          const emailMap = new Map(profilesData?.map(profile => [profile.id, profile.email]) || []);

          // Combine messages with sender emails
          const formattedMessages = messagesData.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            created_at: msg.created_at,
            sender_email: emailMap.get(msg.sender_id) || 'Unknown'
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
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', payload.new.sender_id)
              .single();

            if (profileError) throw profileError;

            const newMessage: Message = {
              id: payload.new.id,
              content: payload.new.content,
              sender_id: payload.new.sender_id,
              created_at: payload.new.created_at,
              sender_email: profileData?.email || 'Unknown'
            };

            setMessages(prev => [...prev, newMessage]);
            setTimeout(scrollToBottom, 100);
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