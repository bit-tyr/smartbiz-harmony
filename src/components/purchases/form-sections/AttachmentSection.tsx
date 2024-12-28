import { FormSection } from "./FormSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AttachmentSectionProps {
  purchaseRequestId: string;
  onFilesChange: (files: File[]) => void;
}

export const sanitizeFileName = (fileName: string): string => {
  const sanitized = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');

  const lastDot = sanitized.lastIndexOf('.');
  const name = lastDot > -1 ? sanitized.slice(0, lastDot) : sanitized;
  const ext = lastDot > -1 ? sanitized.slice(lastDot) : '';

  const maxLength = 100;
  return name.length > maxLength ? name.slice(0, maxLength) + ext : sanitized;
};

interface TempFile {
  file: File;
  id: string;
}

export const AttachmentSection = ({ purchaseRequestId, onFilesChange }: AttachmentSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [tempFiles, setTempFiles] = useState<TempFile[]>([]);
  const queryClient = useQueryClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newTempFiles = files.map(file => ({
      file,
      id: crypto.randomUUID()
    }));
    
    setTempFiles(prev => {
      const updated = [...prev, ...newTempFiles];
      onFilesChange(updated.map(tf => tf.file));
      return updated;
    });
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setTempFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      onFilesChange(updated.map(tf => tf.file));
      return updated;
    });
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
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
          {isUploading && (
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 animate-spin" />
              <span>Subiendo...</span>
            </div>
          )}
        </div>

        {tempFiles.length > 0 && (
          <div className="space-y-2">
            {tempFiles.map((tempFile) => (
              <div
                key={tempFile.id}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <span className="text-sm truncate flex-1">{tempFile.file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(tempFile.id)}
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