import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormSection } from "./FormSection";

interface Attachment {
  id: string;
  purchase_request_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

interface AttachmentListProps {
  purchaseRequestId: string;
  canDelete?: boolean;
}

export const AttachmentList = ({ purchaseRequestId, canDelete = false }: AttachmentListProps) => {
  const { data: attachments, isLoading } = useQuery({
    queryKey: ['attachments', purchaseRequestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_request_attachments')
        .select('*')
        .eq('purchase_request_id', purchaseRequestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Attachment[];
    }
  });

  const downloadFile = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('purchase-attachments')
        .download(attachment.file_path);

      if (error) {
        console.error('Error al descargar archivo:', error);
        toast.error(`Error al descargar ${attachment.file_name}`);
        return;
      }

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      toast.error(`Error al descargar ${attachment.file_name}`);
    }
  };

  return (
    <FormSection title="Archivos Adjuntos">
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Cargando archivos adjuntos...</div>
        ) : attachments && attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <span className="text-sm truncate flex-1">{attachment.file_name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile(attachment)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No hay archivos adjuntos</div>
        )}
      </div>
    </FormSection>
  );
}; 