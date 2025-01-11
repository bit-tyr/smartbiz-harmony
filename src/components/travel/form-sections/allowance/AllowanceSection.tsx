import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { TravelRequestFormValues } from "../../schemas/travelRequestSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const BANK_OPTIONS = [
  "Santander",
  "Itau",
  "BROU",
  "Prex",
  "HSBC",
  "Scotiabank",
  "BBVA",
  "Bandes",
  "Otro",
] as const;

const CURRENCY_OPTIONS = [
  { value: "USD", label: "Dólares (USD)" },
  { value: "UYU", label: "Pesos Uruguayos (UYU)" },
  { value: "BRL", label: "Reales (BRL)" },
  { value: "EUR", label: "Euros (EUR)" },
  { value: "ARS", label: "Pesos Argentinos (ARS)" },
] as const;

interface AllowanceSectionProps {
  form: UseFormReturn<TravelRequestFormValues>;
}

export const AllowanceSection = ({ form }: AllowanceSectionProps) => {
  const [showCustomBank, setShowCustomBank] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Viáticos</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="requiresAllowance"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Requiere Viáticos</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="allowanceAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value || ''}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moneda</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la moneda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banco</FormLabel>
              <Select 
                onValueChange={(value) => {
                  if (value === "Otro") {
                    setShowCustomBank(true);
                    field.onChange("");
                  } else {
                    setShowCustomBank(false);
                    field.onChange(value);
                  }
                }} 
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el banco" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BANK_OPTIONS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showCustomBank && (
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ingrese el nombre del banco"
                    className="mt-2"
                    value={field.value || ''}
                  />
                </FormControl>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Cuenta</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountHolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beneficiario de la Cuenta</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};