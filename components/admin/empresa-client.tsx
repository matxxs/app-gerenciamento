'use client';

import { useState, useEffect } from 'react';
import { EmpresaTable } from './empresa-table';
import { EmpresaFormComponent } from './empresa-form';
import { Empresa } from '@/lib/types';
import { toast } from 'sonner';

export function EmpresaClient() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | undefined>();

  const fetchEmpresas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/empresas');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar empresas');
      }

      const data = await response.json();
      setEmpresas(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleAdd = () => {
    setEditingEmpresa(undefined);
    setShowForm(true);
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setEmpresas(empresas.filter(empresa => empresa.id_empresa !== id));
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEmpresa(undefined);
    fetchEmpresas();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmpresa(undefined);
  };

  if (showForm) {
    return (
      <EmpresaFormComponent
        empresa={editingEmpresa}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <EmpresaTable
      empresas={empresas}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      isLoading={isLoading}
    />
  );
}
