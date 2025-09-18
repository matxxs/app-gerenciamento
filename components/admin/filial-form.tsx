'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Filial, FilialForm, Empresa } from '@/lib/types';

const filialSchema = z.object({
  id_empresa: z.number().min(1, 'Empresa é obrigatória'),
  nome_filial: z.string().min(1, 'Nome da filial é obrigatório'),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  ativo: z.boolean()
});

interface FilialFormProps {
  filial?: Filial;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FilialFormComponent({ filial, onSuccess, onCancel }: FilialFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FilialForm>({
    resolver: zodResolver(filialSchema),
    defaultValues: {
      id_empresa: filial?.id_empresa || 0,
      nome_filial: filial?.nome_filial || '',
      endereco: filial?.endereco || '',
      cidade: filial?.cidade || '',
      estado: filial?.estado || '',
      ativo: filial?.ativo ?? true
    }
  });

  const ativo = watch('ativo');
  const idEmpresa = watch('id_empresa');

  // Carregar empresas
  useEffect(() => {
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

    fetchEmpresas();
  }, []);

  const onSubmit = async (data: FilialForm) => {
    setIsLoading(true);
    try {
      const url = filial 
        ? `/api/filiais/${filial.id_filial}`
        : '/api/filiais';
      
      const method = filial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar filial');
      }

      toast.success(filial ? 'Filial atualizada com sucesso!' : 'Filial criada com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar filial:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar filial');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {filial ? 'Editar Filial' : 'Nova Filial'}
        </CardTitle>
        <CardDescription>
          {filial ? 'Atualize as informações da filial' : 'Preencha os dados da nova filial'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id_empresa">Empresa *</Label>
            <Select
              value={idEmpresa.toString()}
              onValueChange={(value) => setValue('id_empresa', parseInt(value))}
            >
              <SelectTrigger className={errors.id_empresa ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id_empresa} value={empresa.id_empresa.toString()}>
                    {empresa.nome_fantasia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.id_empresa && (
              <p className="text-sm text-red-500">{errors.id_empresa.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome_filial">Nome da Filial *</Label>
            <Input
              id="nome_filial"
              {...register('nome_filial')}
              placeholder="Digite o nome da filial"
              className={errors.nome_filial ? 'border-red-500' : ''}
            />
            {errors.nome_filial && (
              <p className="text-sm text-red-500">{errors.nome_filial.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              {...register('endereco')}
              placeholder="Digite o endereço"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                {...register('cidade')}
                placeholder="Digite a cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                {...register('estado')}
                placeholder="Digite o estado (UF)"
                maxLength={2}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={(checked) => setValue('ativo', checked)}
            />
            <Label htmlFor="ativo">Filial ativa</Label>
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
              {isLoading ? 'Salvando...' : (filial ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
