import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { TravelRequestFormValues, travelRequestSchema } from "./schemas/travelRequestSchema";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { TravelDetailsSection } from "./form-sections/TravelDetailsSection";
import { LaboratoryBudgetSection } from "./form-sections/LaboratoryBudgetSection";
import { AllowanceAccommodationSection } from "./form-sections/AllowanceAccommodationSection";
import { TravelAttachmentSection } from "./form-sections/AttachmentSection";

interface TravelRequestFormProps {
  onSubmit: (values: TravelRequestFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  initialValues?: TravelRequestFormValues;
  isEditing?: boolean;
}

export const TravelRequestForm = ({ 
  onSubmit,
  isSubmitting,
  onCancel,
  initialValues,
  isEditing = false
}: TravelRequestFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<TravelRequestFormValues>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: initialValues || {
      firstName: "",
      lastName: "",
      documentNumber: "",
      birthDate: null,
      documentExpiry: null,
      phone: "",
      email: "",
      destination: "",
      departureDate: null,
      returnDate: null,
      travelPurpose: "",
      needsPassage: false,
      needsInsurance: false,
      emergencyContact: "",
      preferredSchedule: "",
      laboratoryId: "",
      budgetCodeId: "",
      allowanceAmount: 0,
    },
  });

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <PersonalInfoSection form={form} />
        <TravelDetailsSection form={form} />
        <LaboratoryBudgetSection form={form} />
        <AllowanceAccommodationSection form={form} />
        
        {form.formState.isSubmitSuccessful && (
          <TravelAttachmentSection
            travelRequestId=""
            onFilesChange={handleFilesChange}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
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