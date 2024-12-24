import { useQuery } from "@tanstack/react-query";

interface CurrencyRate {
  moneda: string;
  nombre: string;
  compra: number;
  venta: number;
  fecha: string;
}

const fetchCurrencyRates = async (): Promise<CurrencyRate[]> => {
  try {
    const response = await fetch('https://uy.dolarapi.com/v1/cotizaciones');
    if (!response.ok) {
      throw new Error('Error al obtener cotizaciones');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    throw error;
  }
};

export const useCurrencyRates = () => {
  return useQuery<CurrencyRate[]>({
    queryKey: ['currencyRates'],
    queryFn: fetchCurrencyRates,
    refetchInterval: 300000, // Refrescar cada 5 minutos
    staleTime: 300000, // Considerar datos frescos por 5 minutos
  });
}; 