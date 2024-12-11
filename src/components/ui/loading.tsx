import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Cargando...</span>
    </div>
  );
};