import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PurchaseRequestDetails } from "./PurchaseRequestDetails";
import { PurchaseRequestComments } from "./PurchaseRequestComments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PurchaseRequest } from "./types";

interface PurchaseRequestViewProps {
  request: PurchaseRequest;
  onClose: () => void;
}

export const PurchaseRequestView = ({ request, onClose }: PurchaseRequestViewProps) => {
  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="comments">Comentarios</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <PurchaseRequestDetails request={request} onClose={onClose} />
          </TabsContent>
          <TabsContent value="comments">
            <PurchaseRequestComments purchaseRequestId={request.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};