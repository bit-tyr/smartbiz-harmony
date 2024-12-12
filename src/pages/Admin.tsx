import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UserList } from "@/components/admin/UserList";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { UserPlus } from "lucide-react";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona los usuarios, roles y permisos del sistema
        </p>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Buscar por email o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <CreateUserDialog onClose={() => setIsDialogOpen(false)} />
        </Dialog>
      </div>

      <UserList searchQuery={searchQuery} />
    </div>
  );
};

export default Admin;