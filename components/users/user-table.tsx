"use client";

import type { UsuarioLista } from "@/lib/types";
import { selectPermissions } from "@/lib/features/auth/auth-slice";
import { useAppSelector } from "@/lib/hooks/app-selector";
import { usePermissions } from "@/lib/hooks/use-permissions";

interface UserTableProps {
  users: UsuarioLista[];
}

export const UserTable = ({ users }: UserTableProps) => {
  const permissions = useAppSelector(selectPermissions);
  const { pode_atualizar, pode_deletar } = usePermissions('ADMIN_USUARIOS');
  const handleEdit = (id: number) => alert(`Abrir modal para editar usuário ${id}...`);
  const handleDelete = (id: number) => alert(`Confirmar exclusão do usuário ${id}...`);

  if (users.length === 0) {
    return <p>Nenhum usuário encontrado.</p>;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Nome Completo</th>
            <th>E-mail</th>
            <th>Função</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id_usuario}>
              <td>{user.nome_completo}</td>
              <td>{user.email}</td>
              <td>{user.nome_funcao}</td>
              <td>
                <span>
                  {user.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td>
                <button 
                  onClick={() => handleEdit(user.id_usuario)}
                  disabled={!pode_atualizar}
                  title={!pode_atualizar ? 'Sem permissão para editar' : 'Editar'}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(user.id_usuario)}
                  disabled={!pode_deletar} 
                  title={!pode_deletar ? 'Sem permissão para excluir' : 'Excluir'}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};