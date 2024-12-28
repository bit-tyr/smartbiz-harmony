import { FormSection } from "./FormSection";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { sanitizeFileName } from "./AttachmentSection";

interface AttachmentUploaderProps {
  purchaseRequestId: string;
}

export const AttachmentUploader = ({ purchaseRequestId }: AttachmentUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);

    try {
      for (const file of files) {
        const sanitizedName = sanitizeFileName(file.name);
        const filePath = `${purchaseRequestId}/${sanitizedName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('purchase-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error al subir archivo:', uploadError);
          toast.error(`Error al subir ${file.name}`);
          continue;
        }

        const { error: dbError } = await supabase
          .from('purchase_request_attachments')
          .insert({
            purchase_request_id: purchaseRequestId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type
          });

        if (dbError) {
          console.error('Error al guardar registro de archivo:', dbError);
          toast.error(`Error al registrar ${file.name}`);
          
          await supabase.storage
            .from('purchase-attachments')
            .remove([uploadData.path]);
        } else {
          toast.success(`${file.name} subido exitosamente`);
          await queryClient.invalidateQueries({ queryKey: ['attachments', purchaseRequestId] });
        }
      }
    } catch (error) {
      console.error('Error al subir archivos:', error);
      toast.error('Error al subir archivos');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <FormSection title="Subir Archivos">
      <Input
        type="file"
        multiple
        onChange={handleFileChange}
        className="flex-1"
        disabled={isUploading}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
      />
    </FormSection>
  );
}; 