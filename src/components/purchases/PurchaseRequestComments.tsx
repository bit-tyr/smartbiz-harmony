import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    email: string;
  } | null;
}

interface PurchaseRequestCommentsProps {
  purchaseRequestId: string;
}

export const PurchaseRequestComments = ({ purchaseRequestId }: PurchaseRequestCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: comments, refetch } = useQuery({
    queryKey: ['purchaseRequestComments', purchaseRequestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_request_comments')
        .select(`
          id,
          content,
          created_at,
          user:profiles(email)
        `)
        .eq('purchase_request_id', purchaseRequestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('purchase_request_comments')
        .insert({
          purchase_request_id: purchaseRequestId,
          content: newComment.trim(),
        });

      if (error) throw error;

      toast.success("Comentario agregado exitosamente");
      setNewComment("");
      refetch();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Error al agregar el comentario");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? "Enviando..." : "Enviar comentario"}
        </Button>
      </form>

      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{comment.user?.email || "Usuario"}</span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(comment.created_at), "PPp", { locale: es })}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};