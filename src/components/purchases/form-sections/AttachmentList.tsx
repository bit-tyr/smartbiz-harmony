import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
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

  const deleteFile = async (attachment: Attachment) => {
    try {
      // Primero eliminamos el archivo del storage
      const { error: storageError } = await supabase.storage
        .from('purchase-attachments')
        .remove([attachment.file_path]);

      if (storageError) {
        console.error('Error al eliminar archivo del storage:', storageError);
        toast.error(`Error al eliminar ${attachment.file_name}`);
        return;
      }

      // Luego eliminamos el registro de la base de datos
      const { error: dbError } = await supabase
        .from('purchase_request_attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) {
        console.error('Error al eliminar registro de archivo:', dbError);
        toast.error(`Error al eliminar registro de ${attachment.file_name}`);
        return;
      }

      toast.success(`${attachment.file_name} eliminado exitosamente`);
      queryClient.invalidateQueries({ queryKey: ['attachments', purchaseRequestId] });
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      toast.error(`Error al eliminar ${attachment.file_name}`);
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
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(attachment)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile(attachment)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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