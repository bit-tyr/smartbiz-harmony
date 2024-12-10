import { Table, TableBody } from "@/components/ui/table";
import { useState } from "react";
import { PurchaseRequestTableHeader } from "./table/PurchaseRequestTableHeader";
import { PurchaseRequestTableRow } from "./table/PurchaseRequestTableRow";
import { ColumnSelector } from "./table/ColumnSelector";

interface PurchaseRequest {
  id: string;
  number: number;
  status: string;
  created_at: string;
  laboratory: { name: string } | null;
  budget_code: { code: string; description: string } | null;
  observations: string | null;
  purchase_request_items?: {
    product: { name: string } | null;
    supplier: { name: string } | null;
    quantity: number;
    unit_price: number | null;
    currency: string | null;
  }[];
}

interface PurchaseRequestListProps {
  requests: PurchaseRequest[];
  isLoading: boolean;
}

export const PurchaseRequestList = ({ requests, isLoading }: PurchaseRequestListProps) => {
  const [visibleColumns, setVisibleColumns] = useState({
    number: true,
    laboratory: true,
    budgetCode: true,
    product: true,
    supplier: true,
    quantity: true,
    unitPrice: true,
    currency: true,
    status: true,
    date: true,
    observations: true,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando solicitudes...</div>;
  }

  if (!requests.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        No hay solicitudes de compra registradas
      </div>
    );
  }

  const handleColumnChange = (column: string, checked: boolean) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: checked,
    }));
  };

  return (
    <div>
      <ColumnSelector 
        visibleColumns={visibleColumns} 
        onColumnChange={handleColumnChange} 
      />

      <Table>
        <PurchaseRequestTableHeader visibleColumns={visibleColumns} />
        <TableBody>
          {requests.map((request) => (
            <PurchaseRequestTableRow
              key={request.id}
              request={request}
              visibleColumns={visibleColumns}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};