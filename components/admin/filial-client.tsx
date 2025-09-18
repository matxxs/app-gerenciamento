'use client';

import { useState, useEffect } from 'react';
import { FilialTable } from './filial-table';
import { FilialFormComponent } from './filial-form';
import { Filial, Empresa } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/use-auth';

export function FilialClient() {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFilial, setEditingFilial] = useState<Filial | undefined>();

  const fetchFiliais = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/filiais');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar filiais');
      }

      const data = await response.json();
      setFiliais(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas?ativo=true');
      
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  useEffect(() => {
    fetchFiliais();
    fetchEmpresas();
  }, []);

  const handleAdd = () => {
    setEditingFilial(undefined);
    setShowForm(true);
  };

  const handleEdit = (filial: Filial) => {
    setEditingFilial(filial);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setFiliais(filiais.filter(filial => filial.id_filial !== id));
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingFilial(undefined);
    fetchFiliais();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFilial(undefined);
  };

  if (showForm) {
    return (
      <FilialFormComponent
        filial={editingFilial}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <FilialTable
      filiais={filiais}
      empresas={empresas}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      isLoading={isLoading}
    />
  );
}
