"use client"; // Esta página precisa ser um Client Component para usar hooks

import { usePermissions } from "@/lib/hooks/usePermissions";
import { AccessDenied } from "@/app/components/auth/AccessDenied";
import { UsuariosClient } from "@/app/components/usuarios/UsuariosClient"; // Seu componente principal

export default function UsuariosPage() {
  // 1. Pega as permissões para a tela de usuários
  const { pode_ler } = usePermissions('ADMIN_USUARIOS');
  
  // 2. Se o usuário não tiver permissão de LEITURA, renderiza o componente de acesso negado
  if (!pode_ler) {
    return <AccessDenied />;
  }

  // 3. Se ele tiver permissão, renderiza o conteúdo normal da página
  return <UsuariosClient />;
}