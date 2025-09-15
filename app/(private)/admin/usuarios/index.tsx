"use client";
import Demo403Page from "@/app/demo/403/page";
import { UsuariosClient } from "@/components/users/user-client";
import { usePermissions } from "@/lib/hooks/use-permissions";


export default function IndexPage() {
  const { pode_ler } = usePermissions('ADMIN_USUARIOS');
  
  if (!pode_ler) {
    return <Demo403Page />;
  }

  return <UsuariosClient />;
}