import { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
};