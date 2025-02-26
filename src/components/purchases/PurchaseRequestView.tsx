
import React from 'react';
import PurchaseRequestDetails from "./PurchaseRequestDetails";
import { PurchaseRequest } from "./types";

interface PurchaseRequestViewProps {
  request: PurchaseRequest | null;
  onClose: () => void;
}

const PurchaseRequestView: React.FC<PurchaseRequestViewProps> = ({ request, onClose }) => {
  return <PurchaseRequestDetails request={request} onClose={onClose} />;
};

export default PurchaseRequestView;
