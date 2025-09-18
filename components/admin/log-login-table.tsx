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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LogLogin } from '@/lib/types';
import { Search, Download, Eye } from 'lucide-react';

interface LogLoginTableProps {
  logs: LogLogin[];
  isLoading?: boolean;
}

export function LogLoginTable({ logs, isLoading }: LogLoginTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sucessoFilter, setSucessoFilter] = useState<string>('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.email_tentativa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.nome_usuario?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSucesso = !sucessoFilter || log.sucesso.toString() === sucessoFilter;
    
    const matchesDataInicio = !dataInicio || new Date(log.data_hora) >= new Date(dataInicio);
    const matchesDataFim = !dataFim || new Date(log.data_hora) <= new Date(dataFim);
    
    return matchesSearch && matchesSucesso && matchesDataInicio && matchesDataFim;
  });

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('pt-BR');
  };

  const exportToCSV = () => {
    const headers = ['Data/Hora', 'Email', 'Usuário', 'IP', 'Sucesso', 'User Agent'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        formatDateTime(log.data_hora),
        log.email_tentativa,
        log.nome_usuario || '',
        log.ip_acesso || '',
        log.sucesso ? 'Sim' : 'Não',
        log.user_agent || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `logs-login-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Logs de Login</CardTitle>
            <CardDescription>
              Histórico de tentativas de login no sistema
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por email ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sucessoFilter} onValueChange={setSucessoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por sucesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="true">Sucesso</SelectItem>
                <SelectItem value="false">Falha</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Data início"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />

            <Input
              type="date"
              placeholder="Data fim"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id_log_login}>
                      <TableCell>{formatDateTime(log.data_hora)}</TableCell>
                      <TableCell className="font-medium">
                        {log.email_tentativa}
                      </TableCell>
                      <TableCell>{log.nome_usuario || '-'}</TableCell>
                      <TableCell>{log.ip_acesso || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={log.sucesso ? 'default' : 'destructive'}>
                          {log.sucesso ? 'Sucesso' : 'Falha'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={log.user_agent || ''}>
                        {log.user_agent || '-'}
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
  );
}
