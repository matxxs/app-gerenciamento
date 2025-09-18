'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { Filial, Empresa } from '@/lib/types';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

interface FilialTableProps {
  filiais: Filial[];
  empresas: Empresa[];
  onEdit: (filial: Filial) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export function FilialTable({ filiais, empresas, onEdit, onDelete, onAdd, isLoading }: FilialTableProps) {

  const { user: authUser } = useAuth();
  const isAdmin = authUser?.nome_funcao === 'Administrador';

  const [searchTerm, setSearchTerm] = useState('');
  const [empresaFilter, setEmpresaFilter] = useState<string>('');
  const [filialToDelete, setFilialToDelete] = useState<{ id: number; nome: string } | null>(null);

  const filteredFiliais = filiais.filter(filial => {
    const matchesSearch = filial.nome_filial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (filial.cidade && filial.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (filial.estado && filial.estado.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEmpresa = isAdmin
      ? !empresaFilter || filial.id_empresa.toString() === empresaFilter
      : filial.id_empresa === authUser?.id_empresa;

    return matchesSearch && matchesEmpresa;
  });

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const handleDeleteClick = (id: number, nome: string) => {
    setFilialToDelete({ id, nome });
  };

  const executeDelete = async () => {
    if (!filialToDelete) return;

    try {
      const response = await fetch(`/api/filiais/${filialToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir filial');
      }

      toast.success('Filial excluída com sucesso!');
      onDelete(filialToDelete.id);
    } catch (error) {
      console.error('Erro ao excluir filial:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir filial');
    } finally {
      setFilialToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Filiais</CardTitle>
              <CardDescription>
                Gerencie as filiais do sistema
              </CardDescription>
            </div>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Filial
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, cidade ou estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isAdmin && (
                <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Filter ensures no items with empty values are rendered */}
                    {empresas
                      .filter(empresa => empresa && empresa.id_empresa)
                      .map((empresa) => (
                        <SelectItem key={empresa.id_empresa} value={String(empresa.id_empresa)}>
                          {empresa.nome_fantasia}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}

            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Filial</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cidade/Estado</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredFiliais.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Nenhuma filial encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFiliais.map((filial) => (
                      <TableRow key={filial.id_filial}>
                        <TableCell className="font-medium">
                          {filial.nome_filial}
                        </TableCell>
                        <TableCell>{filial.nome_empresa}</TableCell>
                        <TableCell>
                          {filial.cidade && filial.estado
                            ? `${filial.cidade}/${filial.estado}`
                            : filial.cidade || filial.estado || '-'}
                        </TableCell>
                        <TableCell>{formatDate(filial.data_criacao)}</TableCell>
                        <TableCell>
                          <Badge variant={filial.ativo ? 'default' : 'secondary'}>
                            {filial.ativo ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(filial)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(filial.id_filial, filial.nome_filial)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={!!filialToDelete} onOpenChange={(open) => !open && setFilialToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a filial
              <strong className="px-1">{filialToDelete?.nome}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
