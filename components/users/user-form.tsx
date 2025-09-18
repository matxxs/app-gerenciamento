"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Usuario, UsuarioTelaAcesso } from "@/lib/types";
import { PermissionsTree, buildPermissionsTree } from "./permissions-tree";
import { useGetTelasQuery } from "@/lib/features/screens/screen-api-slice";
import { useGetUserByIdQuery, useUpdateUserMutation, useUpdateUserPermissionsMutation, useAddUserMutation } from "@/lib/features/users/user-api-slice";
import { useAuth } from "@/lib/hooks/use-auth";

interface UserFormProps {
    userId: number | null;
    onFinished: () => void;
    onCancel: () => void;
}

type UserFormData = Partial<Omit<Usuario, 'id_usuario'>> & {
    senha?: string;
    telasAcesso: UsuarioTelaAcesso[];
};

export const UserForm = ({ userId, onFinished, onCancel }: UserFormProps) => {
    const isEditing = !!userId;
    const { user: authUser } = useAuth();

    const { data: userData, isLoading: isLoadingUser } = useGetUserByIdQuery(userId!, { skip: !isEditing });
    const { data: allTelas = [], isLoading: isLoadingTelas } = useGetTelasQuery();
    
    const [addUser] = useAddUserMutation();
    const [updateUser] = useUpdateUserMutation();
    const [updateUserPermissions] = useUpdateUserPermissionsMutation();

    const methods = useForm<UserFormData>();
    const { register, handleSubmit, reset } = methods;

    useEffect(() => {
        if (isLoadingTelas || (isEditing && isLoadingUser)) return;

        const userPermissionsMap = new Map<number, UsuarioTelaAcesso>();
        if (isEditing && userData?.telasAcesso) {
            userData.telasAcesso.forEach(perm => userPermissionsMap.set(perm.id_tela, perm));
        }

        const completeTelasAcesso = allTelas.map(tela => {
            const existingPermission = userPermissionsMap.get(tela.id_tela);
            if (existingPermission) return existingPermission;
            return {
                id_tela: tela.id_tela,
                pode_criar: false, pode_ler: false, pode_atualizar: false, pode_deletar: false,
            };
        });

        reset({
            nome_completo: isEditing ? userData?.nome_completo : '',
            email: isEditing ? userData?.email : '',
            id_funcao: isEditing ? userData?.id_funcao : undefined,
            ativo: isEditing ? userData?.ativo : true,
            telasAcesso: completeTelasAcesso,
        });

    }, [isEditing, userData, allTelas, isLoadingTelas, isLoadingUser, reset]);

    const permissionTree = buildPermissionsTree(allTelas);

    const onSubmit = async (data: UserFormData) => {
        try {
            if (!authUser) throw new Error("Usuário não autenticado.");
            const { telasAcesso, ...dadosUsuario } = data;

            if (isEditing && userId && userData) {
                const payload = { ...dadosUsuario, id_empresa: userData.id_empresa };
                await updateUser({ id: userId, dados: payload }).unwrap();
                await updateUserPermissions({ id: userId, id_empresa: userData.id_empresa, telasAcesso }).unwrap();
            } else if (!isEditing) {
                if (!data.nome_completo || !data.email || !data.senha || !data.id_funcao) {
                    alert('Todos os campos são obrigatórios para criar um usuário.');
                    return;
                }
                const payload = {
                    nome_completo: data.nome_completo, email: data.email, senha: data.senha,
                    id_funcao: Number(data.id_funcao), id_empresa: authUser.id_empresa,
                    ativo: data.ativo ?? true, telasAcesso: telasAcesso || []
                };
                await addUser(payload).unwrap();
            }
            onFinished();
        } catch (error) {
            console.error("Falha ao salvar usuário:", error);
            alert('Ocorreu um erro ao salvar o usuário.');
        }
    };
    
    if ((isEditing && isLoadingUser) || isLoadingTelas) return <p>Carregando formulário...</p>;

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">{isEditing ? `Editando: ${userData?.nome_completo || ''}` : 'Adicionar Novo Usuário'}</h1>
                    <div className="flex gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button><Button type="submit">Salvar</Button></div>
                </div>
                <Tabs defaultValue="info" className="w-full">
                    <TabsList><TabsTrigger value="info">Informações do Usuário</TabsTrigger><TabsTrigger value="permissions">Permissões de Acesso</TabsTrigger></TabsList>
                    <TabsContent value="info">
                        <Card>
                            <CardHeader><CardTitle>Dados Cadastrais</CardTitle></CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="grid gap-2"><Label htmlFor="nome_completo">Nome Completo</Label><Input id="nome_completo" {...register('nome_completo', { required: true })} /></div>
                                <div className="grid gap-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" {...register('email', { required: true })} /></div>
                                <div className="grid gap-2">
                                    <Label htmlFor="id_funcao">Função</Label>
                                    <select id="id_funcao" {...register('id_funcao', { required: true })} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="">Selecione uma função</option>
                                        <option value="1">Administrador</option>
                                        <option value="2">Usuário Padrão</option>
                                    </select>
                                </div>
                                {!isEditing && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="senha">Senha</Label>
                                        <Input id="senha" type="password" {...register('senha', { required: !isEditing })} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="permissions">
                        <Card>
                            <CardHeader><CardTitle>Controle de Acesso às Telas</CardTitle></CardHeader>
                            <CardContent>
                                {permissionTree.length > 0 ? <PermissionsTree permissionTree={permissionTree} /> : <p>Nenhuma tela de permissão encontrada.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </FormProvider>
    );
};