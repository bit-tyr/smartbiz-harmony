import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign } from "lucide-react";

export const SidebarQuotations = () => {
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Cotizaciones
      </h2>
      <ScrollArea className="h-[300px] px-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>USD/PEN</span>
            </div>
            <span className="font-medium">3.75</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>EUR/PEN</span>
            </div>
            <span className="font-medium">4.10</span>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};