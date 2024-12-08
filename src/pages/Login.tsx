import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // En un caso real, aquí iría la validación contra un backend
    if (credentials.username && credentials.password) {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/select-area");
      toast.success("Inicio de sesión exitoso");
    } else {
      toast.error("Por favor complete todos los campos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sistema ERP</h2>
          <p className="mt-2 text-gray-600">Inicie sesión para continuar</p>
        </div>
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="mt-1"
                placeholder="Ingrese su usuario"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="mt-1"
                placeholder="Ingrese su contraseña"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;