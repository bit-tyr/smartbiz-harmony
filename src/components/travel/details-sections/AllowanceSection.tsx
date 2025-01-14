import { TravelRequest } from "../types";

interface AllowanceSectionProps {
  request: TravelRequest;
}

export const AllowanceSection = ({ request }: AllowanceSectionProps) => {
  if (!request.requiresAllowance) {
    return (
      <div>
        <h3 className="font-semibold mb-4">Viáticos</h3>
        <p className="text-gray-500">No requiere viáticos</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-4">Viáticos</h3>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm text-gray-500">Monto</dt>
          <dd>{request.allowanceAmount} {request.currency}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Banco</dt>
          <dd>{request.bank || '-'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Número de Cuenta</dt>
          <dd>{request.accountNumber || '-'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Titular de la Cuenta</dt>
          <dd>{request.accountHolder || '-'}</dd>
        </div>
      </dl>
    </div>
  );
};