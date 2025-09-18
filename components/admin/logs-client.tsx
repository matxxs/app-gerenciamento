'use client';

import { useState, useEffect } from 'react';
import { LogLoginTable } from './log-login-table';
import { LogAcoesTable } from './log-acoes-table';
import { LogLogin, LogAcao } from '@/lib/types';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LogsClient() {
  const [logins, setLogins] = useState<LogLogin[]>([]);
  const [acoes, setAcoes] = useState<LogAcao[]>([]);
  const [isLoadingLogins, setIsLoadingLogins] = useState(true);
  const [isLoadingAcoes, setIsLoadingAcoes] = useState(true);

  const fetchLogins = async () => {
    try {
      setIsLoadingLogins(true);
      const response = await fetch('/api/logs/login');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar logs de login');
      }

      const data = await response.json();
      setLogins(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar logs de login:', error);
      toast.error('Erro ao carregar logs de login');
    } finally {
      setIsLoadingLogins(false);
    }
  };

  const fetchAcoes = async () => {
    try {
      setIsLoadingAcoes(true);
      const response = await fetch('/api/logs/acoes');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar logs de ações');
      }

      const data = await response.json();
      setAcoes(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar logs de ações:', error);
      toast.error('Erro ao carregar logs de ações');
    } finally {
      setIsLoadingAcoes(false);
    }
  };

  useEffect(() => {
    fetchLogins();
    fetchAcoes();
  }, []);

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Logs de Login</TabsTrigger>
        <TabsTrigger value="acoes">Logs de Ações</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="mt-6">
        <LogLoginTable logs={logins} isLoading={isLoadingLogins} />
      </TabsContent>
      
      <TabsContent value="acoes" className="mt-6">
        <LogAcoesTable logs={acoes} isLoading={isLoadingAcoes} />
      </TabsContent>
    </Tabs>
  );
}
