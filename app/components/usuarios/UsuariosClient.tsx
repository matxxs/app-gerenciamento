"use client";

import { UserTable } from "./UserTable";
import { useGetUsersQuery } from "@/lib/features/users/usersApiSlice"; 
import styles from './Usuarios.module.css';
import { useAppSelector } from "@/lib/hooks";
import { selectPermissions } from "@/lib/features/auth/authSlice";
import { usePermissions } from "@/lib/hooks/usePermissions";

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
    return <p className={styles.error}>Erro: {errorMessage}</p>;
  }

  return (
    <div className={styles.pageContainer}>
      <PageHeader />
      <UserTable users={users} />
    </div>
  );
};

const PageHeader = () => {
  const permissions = useAppSelector(selectPermissions);
 const { pode_criar } = usePermissions('ADMIN_USUARIOS');

  const handleAdd = () => alert('Abrir modal para adicionar usuário...');

  return (
    <div className={styles.header}>
      <h1>Usuários do Sistema</h1>
      <button 
        className={styles.addButton}
        onClick={handleAdd}
        disabled={!pode_criar} 
        title={!pode_criar ? 'Você não tem permissão para criar usuários' : 'Adicionar novo usuário'}
      >
        Adicionar Usuário
      </button>
    </div>
  );
};