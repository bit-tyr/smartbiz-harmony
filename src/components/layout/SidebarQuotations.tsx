import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SidebarQuotations = () => {
  const [quotations, setQuotations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuotations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = 'https://magicloops.dev/api/loop/d9e2aac8-f8c7-4108-b626-6da74536978a/run';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        body: JSON.stringify({ "input": "I love Magic Loops!" }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setQuotations(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setError("El servicio de cotizaciones no está disponible en este momento. Por favor, intente más tarde.");
      // Clear any stale data
      setQuotations(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
    // Set up polling interval
    const interval = setInterval(fetchQuotations, 300000); // Every 5 minutes
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // If there's an error and no data, show error state
  if (error && !quotations) {
    return (
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Cotizaciones
        </h2>
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-500 text-center">{error}</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchQuotations}
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Reintentar'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Cotizaciones
      </h2>
      <ScrollArea className="h-[300px] px-4">
        {isLoading && !quotations ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : quotations ? (
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(quotations, null, 2)}</pre>
        ) : null}
      </ScrollArea>
    </div>
  );
};