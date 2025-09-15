"use client";

import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { selectPermissions } from '@/lib/features/auth/authSlice';
import { AccessDenied } from './AccessDenied';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard = ({ children }: RouteGuardProps) => {
  const pathname = usePathname();
  const permissions = useAppSelector(selectPermissions);

  // Se as permissões ainda não foram carregadas, exibe um estado de loading.
  // Isso evita um flash da tela de "Acesso Negado" enquanto o estado carrega.
  if (!permissions) {
    return <div>Verificando permissões...</div>;
  }

  // Extrai as rotas permitidas do estado do Redux
  const allowedRoutes = permissions.telas.map(tela => tela.rota);

  // A página inicial ('/') é sempre permitida para qualquer usuário logado.
  // Para as outras, verificamos se a rota atual está na lista de permissões.
  const canAccess = pathname === '/' || allowedRoutes.includes(pathname);

  // Se o usuário pode acessar, renderiza o conteúdo da página.
  // Senão, renderiza o componente de Acesso Negado.
  return canAccess ? <>{children}</> : <AccessDenied />;
};