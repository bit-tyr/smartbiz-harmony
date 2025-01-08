import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LaboratoryBudgetSection } from "./form-sections/LaboratoryBudgetSection";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { TravelDetailsSection } from "./form-sections/TravelDetailsSection";
import { AllowanceAccommodationSection } from "./form-sections/AllowanceAccommodationSection";
import { TravelAttachmentSection } from "./form-sections/AttachmentSection";
import { travelRequestSchema, TravelRequestFormValues } from "./schemas/travelRequestSchema";
import { useState } from "react";

interface TravelRequestFormProps {
  onSubmit: (values: TravelRequestFormValues & { files: File[] }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  travelRequestId?: string;
}

export const TravelRequestForm = ({
  onSubmit,
  isSubmitting,
  onCancel,
  travelRequestId
}: TravelRequestFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const form = useForm<TravelRequestFormValues>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: {
      currency: 'USD',
      needsPassage: false,
      needsInsurance: false,
      requiresAllowance: false,
      allowanceAmount: 0,
      numberOfDays: 0,
      purpose: '', // Add default empty string
      travelPurpose: '', // Add default empty string
    },
  });

  const handleSubmit = async (values: TravelRequestFormValues) => {
    // Ensure purpose is set from travelPurpose
    const finalValues = {
      ...values,
      purpose: values.travelPurpose,
    };
    await onSubmit({ ...finalValues, files: selectedFiles });
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <LaboratoryBudgetSection form={form} />
        <PersonalInfoSection form={form} />
        <TravelDetailsSection form={form} />
        <AllowanceAccommodationSection form={form} />
        
        {travelRequestId && (
          <TravelAttachmentSection
            travelRequestId={travelRequestId}
            onFilesChange={handleFilesChange}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};