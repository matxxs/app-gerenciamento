"use client";

import { selectPermissions } from "@/lib/features/auth/auth-slice";
import { useGetUsersQuery } from "@/lib/features/users/user-api-slice";
import { useAppSelector } from "@/lib/hooks/app-selector";
import { usePermissions } from "@/lib/hooks/use-permissions";



export const UsuariosClient = () => {
  const { 
    data: users = [], 
    isLoading,        
    isError,          
    error             
  } = useGetUsersQuery();

  if (isLoading) {
    return <p>Carregando usuários...</p>;
  }

  if (isError) {
    let errorMessage = 'Falha ao buscar dados dos usuários.';
    if (error && 'data' in error) {
        const errorData = error.data as { message?: string };
        if (errorData.message) errorMessage = errorData.message;
    }
    return <p>Erro: {errorMessage}</p>;
  }

  return (
    <div >
      <PageHeader />
      {/* <UserTable users={users} /> */}
    </div>
  );
};

const PageHeader = () => {
  const permissions = useAppSelector(selectPermissions);
 const { pode_criar } = usePermissions('ADMIN_USUARIOS');

  const handleAdd = () => alert('Abrir modal para adicionar usuário...');

  return (
    <div >
      <h1>Usuários do Sistema</h1>
      <button 
        onClick={handleAdd}
        disabled={!pode_criar} 
        title={!pode_criar ? 'Você não tem permissão para criar usuários' : 'Adicionar novo usuário'}
      >
        Adicionar Usuário
      </button>
    </div>
  );
};