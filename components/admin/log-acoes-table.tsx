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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LogAcao } from '@/lib/types';
import { Search, Download, Eye } from 'lucide-react';

interface LogAcoesTableProps {
  logs: LogAcao[];
  isLoading?: boolean;
}

export function LogAcoesTable({ logs, isLoading }: LogAcoesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [acaoFilter, setAcaoFilter] = useState<string>('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.acao_realizada.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.nome_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.detalhes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAcao = !acaoFilter || log.acao_realizada === acaoFilter;
    
    const matchesDataInicio = !dataInicio || new Date(log.data_hora) >= new Date(dataInicio);
    const matchesDataFim = !dataFim || new Date(log.data_hora) <= new Date(dataFim);
    
    return matchesSearch && matchesAcao && matchesDataInicio && matchesDataFim;
  });

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('pt-BR');
  };

  const exportToCSV = () => {
    const headers = ['Data/Hora', 'Usuário', 'Ação', 'Detalhes', 'IP'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        formatDateTime(log.data_hora),
        log.nome_usuario || '',
        log.acao_realizada,
        log.detalhes || '',
        log.ip_acesso || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `logs-acoes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Obter ações únicas para o filtro
  const acoesUnicas = Array.from(new Set(logs.map(log => log.acao_realizada)));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Logs de Ações</CardTitle>
            <CardDescription>
              Histórico de ações realizadas no sistema
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
                placeholder="Buscar por ação, usuário ou detalhes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={acaoFilter} onValueChange={setAcaoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as ações</SelectItem>
                {acoesUnicas.map((acao) => (
                  <SelectItem key={acao} value={acao}>
                    {acao}
                  </SelectItem>
                ))}
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
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id_log_acao}>
                      <TableCell>{formatDateTime(log.data_hora)}</TableCell>
                      <TableCell className="font-medium">
                        {log.nome_usuario}
                      </TableCell>
                      <TableCell>{log.acao_realizada}</TableCell>
                      <TableCell className="max-w-xs truncate" title={log.detalhes || ''}>
                        {log.detalhes || '-'}
                      </TableCell>
                      <TableCell>{log.ip_acesso || '-'}</TableCell>
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
