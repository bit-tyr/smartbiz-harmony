import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const SidebarQuotations = () => {
  const [quotations, setQuotations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      const url = 'https://magicloops.dev/api/loop/d9e2aac8-f8c7-4108-b626-6da74536978a/run';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "input": "I love Magic Loops!" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);
      setQuotations(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setError("Error loading quotations");
    }
  };

  useEffect(() => {
    fetchQuotations();
    const interval = setInterval(fetchQuotations, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Cotizaciones
      </h2>
      <ScrollArea className="h-[300px] px-4">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : quotations ? (
          <pre className="text-sm">{JSON.stringify(quotations, null, 2)}</pre>
        ) : (
          <div>Loading quotations...</div>
        )}
      </ScrollArea>
    </div>
  );
};