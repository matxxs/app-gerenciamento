"use client";

import { useState, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { useGetUsersQuery, useDeleteUserMutation } from "@/lib/features/users/user-api-slice";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { UserTable } from "./user-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { UserForm } from "./user-form";
import type { UsuarioLista } from "@/lib/types";
import { useAuth } from "@/lib/hooks/use-auth";
import { Input } from "@/components/ui/input";

export const UsuariosClient = () => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { user: authUser } = useAuth();
    const idEmpresaParaFiltrar = authUser?.nome_funcao === 'Administrador de Sistema' ? undefined : authUser?.id_empresa;
    
    const { data: users = [], isLoading } = useGetUsersQuery(idEmpresaParaFiltrar, { skip: !authUser });
    const [deleteUser] = useDeleteUserMutation();
    const { pode_criar, pode_atualizar, pode_deletar } = usePermissions('ADMIN_USUARIOS');

    const handleAdd = () => {
        setSelectedUserId(null);
        setView('form');
    };

    const handleEdit = (user: UsuarioLista) => {
        setSelectedUserId(user.id_usuario);
        setView('form');
    };

    const handleBackToList = () => {
        setSelectedUserId(null);
        setView('list');
    };

    const handleDelete = async (userToDelete: UsuarioLista) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await deleteUser({ id: userToDelete.id_usuario, id_empresa: userToDelete.id_empresa }).unwrap();
            } catch (err) {
                console.error('Falha ao deletar usuário:', err);
            }
        }
    };
    
    const columns = getColumns(handleEdit, handleDelete, pode_atualizar, pode_deletar);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (isLoading) {
        return <div className="container mx-auto py-10"><p>Carregando...</p></div>;
    }

    return (
        <div className="container mx-auto py-10">
            {view === 'list' ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Usuários do Sistema</h1>
                        <Button onClick={handleAdd} disabled={!pode_criar}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Usuário
                        </Button>
                    </div>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <UserTable columns={columns} data={filteredUsers} />
                </>
            ) : (
                <UserForm 
                    userId={selectedUserId}
                    onFinished={handleBackToList}
                    onCancel={handleBackToList}
                />
            )}
        </div>
    );
};