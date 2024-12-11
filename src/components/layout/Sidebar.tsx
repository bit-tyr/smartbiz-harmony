import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { SidebarNav } from "./SidebarNav";
import { SidebarQuotations } from "./SidebarQuotations";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const isMobile = useIsMobile();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        setIsAdmin(profile?.is_admin || false);
      }
    };

    checkAdminStatus();
  }, []);

  if (isMobile) {
    return null;
  }

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <SidebarNav isAdmin={isAdmin} />
        <SidebarQuotations />
      </div>
    </div>
  );
}