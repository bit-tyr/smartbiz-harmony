import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserList } from "@/components/admin/UserList";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Gestiona los usuarios y sus permisos</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar por email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Crear Usuario</Button>
          </DialogTrigger>
          <CreateUserDialog onClose={() => setIsDialogOpen(false)} />
        </Dialog>
      </div>

      <UserList searchQuery={searchQuery} />
    </div>
  );
};

export default Admin;