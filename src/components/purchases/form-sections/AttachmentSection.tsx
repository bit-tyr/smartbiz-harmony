import { UseFormReturn } from "react-hook-form";
import { FormSection } from "./FormSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AttachmentSectionProps {
  form: UseFormReturn<any>;
  purchaseRequestId?: string;
}

const sanitizeFileName = (fileName: string): string => {
  // Reemplazar caracteres especiales y espacios
  const sanitized = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Reemplazar caracteres especiales con _
    .replace(/_{2,}/g, '_'); // Reemplazar múltiples _ consecutivos con uno solo

  // Separar nombre y extensión
  const lastDot = sanitized.lastIndexOf('.');
  const name = lastDot > -1 ? sanitized.slice(0, lastDot) : sanitized;
  const ext = lastDot > -1 ? sanitized.slice(lastDot) : '';

  // Limitar longitud del nombre si es necesario (manteniendo la extensión)
  const maxLength = 100;
  const finalName = name.length > maxLength ? name.slice(0, maxLength) + ext : sanitized;

  return finalName;
};

export const AttachmentSection = ({ form, purchaseRequestId }: AttachmentSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!purchaseRequestId) return;
    
    setIsUploading(true);
    try {
      for (const file of files) {
        const sanitizedName = sanitizeFileName(file.name);
        const filePath = `${purchaseRequestId}/${sanitizedName}`;

        // Subir el archivo a Supabase Storage
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

        // Crear registro en la tabla de adjuntos
        const { error: dbError } = await supabase
          .from('purchase_request_attachments')
          .insert({
            purchase_request_id: purchaseRequestId,
            file_name: file.name, // Guardamos el nombre original para mostrar
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type
          });

        if (dbError) {
          console.error('Error al guardar registro de archivo:', dbError);
          toast.error(`Error al registrar ${file.name}`);
          
          // Si falla el registro en la base de datos, eliminamos el archivo del storage
          await supabase.storage
            .from('purchase-attachments')
            .remove([uploadData.path]);
        } else {
          toast.success(`${file.name} subido exitosamente`);
        }
      }

      setFiles([]);
    } catch (error) {
      console.error('Error al subir archivos:', error);
      toast.error('Error al subir archivos');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormSection title="Archivos Adjuntos">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            multiple
            onChange={handleFileChange}
            className="flex-1"
            disabled={isUploading}
          />
          {purchaseRequestId && files.length > 0 && (
            <Button
              type="button"
              onClick={uploadFiles}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Subiendo...' : 'Subir'}
            </Button>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <span className="text-sm truncate flex-1">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormSection>
  );
}; 