"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

// Importe seus tipos e componentes da UI
import { Funcao } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interface para as propriedades que a função receberá
interface GetColumnsProps {
  onEdit: (funcao: Funcao) => void;
  onDelete: (id: number) => void;
}

// A função que gera as definições das colunas
export const getFuncoesColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<Funcao>[] => [
  {
    accessorKey: "nome_funcao",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome da Função
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="pl-4">{row.getValue("nome_funcao")}</div>,
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
  },
  {
    accessorKey: "pode_ver_todas_filiais",
    header: "Acesso Global",
    cell: ({ row }) => {
      const podeVer = row.getValue("pode_ver_todas_filiais");
      return podeVer 
        ? <Badge>Sim</Badge> 
        : <Badge variant="secondary">Não</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const funcao = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(funcao)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-500"
                onClick={() => onDelete(funcao.id_funcao)}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];