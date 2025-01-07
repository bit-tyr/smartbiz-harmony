import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import SelectArea from "./pages/SelectArea";
import Dashboard from "./pages/Dashboard";
import Compras from "./pages/Compras";
import Secretaria from "./pages/Secretaria";
import Mantenimiento from "./pages/Mantenimiento";
import Admin from "./pages/Admin";
import DatosMaestros from "./pages/DatosMaestros";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/select-area" element={
              <ProtectedRoute>
                <SelectArea />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/compras" element={
              <ProtectedRoute>
                <Layout>
                  <Compras />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/datos-maestros" element={
              <ProtectedRoute>
                <Layout>
                  <DatosMaestros />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/secretaria" element={
              <ProtectedRoute>
                <Layout>
                  <Secretaria />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/mantenimiento" element={
              <ProtectedRoute>
                <Layout>
                  <Mantenimiento />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;