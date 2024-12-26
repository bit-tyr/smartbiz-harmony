import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laboratory } from "../components/master-data/Laboratory.tsx";
import { BudgetCode } from "../components/master-data/BudgetCode.tsx";
import { Product } from "../components/master-data/Product.tsx";
import { Supplier } from "../components/master-data/Supplier.tsx";

const DatosMaestros = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Datos Maestros</h1>
      
      <Tabs defaultValue="laboratories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="laboratories">Laboratorios</TabsTrigger>
          <TabsTrigger value="budget-codes">Códigos Presupuestales</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
        </TabsList>

        <TabsContent value="laboratories">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Laboratorios</CardTitle>
            </CardHeader>
            <CardContent>
              <Laboratory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget-codes">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Códigos Presupuestales</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetCode />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Product />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Proveedores</CardTitle>
            </CardHeader>
            <CardContent>
              <Supplier />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatosMaestros; 