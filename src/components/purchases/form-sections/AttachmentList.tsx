import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/utils";

interface AttachmentListProps {
  purchaseRequestId: string;
  canDelete?: boolean;
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  purchase_request_id: string;
  updated_at: string;
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

      // Crear un enlace temporal para descargar el archivo
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
      // Eliminar el registro de la base de datos primero
      const { error: dbError } = await supabase
        .from('purchase_request_attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) {
        console.error('Error al eliminar registro de archivo:', dbError);
        toast.error(`Error al eliminar registro de ${attachment.file_name}`);
        return;
      }

      // Si se eliminó el registro, entonces eliminamos el archivo del storage
      const { error: storageError } = await supabase.storage
        .from('purchase-attachments')
        .remove([attachment.file_path]);

      if (storageError) {
        console.error('Error al eliminar archivo del storage:', storageError);
        toast.error(`Error al eliminar ${attachment.file_name} del storage`);
        return;
      }

      toast.success(`${attachment.file_name} eliminado exitosamente`);
      
      // Forzar la actualización de la caché y re-consulta
      await queryClient.invalidateQueries({ queryKey: ['attachments', purchaseRequestId] });
      await queryClient.resetQueries({ queryKey: ['attachments', purchaseRequestId] });
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      toast.error(`Error al eliminar ${attachment.file_name}`);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando archivos adjuntos...</div>;
  }

  if (!attachments?.length) {
    return <div className="text-sm text-muted-foreground">No hay archivos adjuntos</div>;
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between p-2 bg-muted rounded-md"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.file_name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(attachment.file_size)}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 