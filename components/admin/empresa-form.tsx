'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Empresa, EmpresaForm } from '@/lib/types';

const empresaSchema = z.object({
  nome_fantasia: z.string().min(1, 'Nome fantasia é obrigatório'),
  razao_social: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos').max(14, 'CNPJ deve ter 14 dígitos'),
  ativo: z.boolean()
});

interface EmpresaFormProps {
  empresa?: Empresa;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EmpresaFormComponent({ empresa, onSuccess, onCancel }: EmpresaFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<EmpresaForm>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome_fantasia: empresa?.nome_fantasia || '',
      razao_social: empresa?.razao_social || '',
      cnpj: empresa?.cnpj || '',
      ativo: empresa?.ativo ?? true
    }
  });

  const ativo = watch('ativo');

  const onSubmit = async (data: EmpresaForm) => {
    setIsLoading(true);
    try {
      const url = empresa 
        ? `/api/empresas/${empresa.id_empresa}`
        : '/api/empresas';
      
      const method = empresa ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar empresa');
      }

      toast.success(empresa ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setValue('cnpj', formatted.replace(/\D/g, ''));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {empresa ? 'Editar Empresa' : 'Nova Empresa'}
        </CardTitle>
        <CardDescription>
          {empresa ? 'Atualize as informações da empresa' : 'Preencha os dados da nova empresa'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
              <Input
                id="nome_fantasia"
                {...register('nome_fantasia')}
                placeholder="Digite o nome fantasia"
                className={errors.nome_fantasia ? 'border-red-500' : ''}
              />
              {errors.nome_fantasia && (
                <p className="text-sm text-red-500">{errors.nome_fantasia.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="razao_social">Razão Social *</Label>
              <Input
                id="razao_social"
                {...register('razao_social')}
                placeholder="Digite a razão social"
                className={errors.razao_social ? 'border-red-500' : ''}
              />
              {errors.razao_social && (
                <p className="text-sm text-red-500">{errors.razao_social.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              {...register('cnpj')}
              onChange={handleCNPJChange}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className={errors.cnpj ? 'border-red-500' : ''}
            />
            {errors.cnpj && (
              <p className="text-sm text-red-500">{errors.cnpj.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={(checked) => setValue('ativo', checked)}
            />
            <Label htmlFor="ativo">Empresa ativa</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (empresa ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
