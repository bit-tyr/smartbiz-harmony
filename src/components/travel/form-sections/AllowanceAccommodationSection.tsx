import { UseFormReturn } from "react-hook-form";
import { TravelRequestFormValues } from "../schemas/travelRequestSchema";
import { AllowanceSection } from "./allowance/AllowanceSection";
import { AccommodationSection } from "./accommodation/AccommodationSection";

interface AllowanceAccommodationSectionProps {
  form: UseFormReturn<TravelRequestFormValues>;
}

export const AllowanceAccommodationSection = ({ form }: AllowanceAccommodationSectionProps) => {
  return (
    <div className="space-y-6">
      <AllowanceSection form={form} />
      <AccommodationSection form={form} />
    </div>
  );
};