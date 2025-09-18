"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { UsuarioLista } from "@/lib/types";

// A função 'handleEdit' será passada via props para o componente da tabela
// e depois para as colunas, para que possa acionar a abertura do modal de edição.
export const getColumns = (
    handleEdit: (user: UsuarioLista) => void,
 handleDelete: (user: UsuarioLista) => void,
    podeAtualizar: boolean,
    podeDeletar: boolean
): ColumnDef<UsuarioLista>[] => [
  {
    accessorKey: "nome_completo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome Completo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "nome_funcao",
    header: "Função",
  },
  {
    accessorKey: "ativo",
    header: "Status",
    cell: ({ row }) => {
      const ativo = row.getValue("ativo");
      return (
        <Badge variant={ativo ? "default" : "destructive"}>
          {ativo ? "Ativo" : "Inativo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.email)}
            >
              Copiar E-mail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!podeAtualizar}
              onClick={() => handleEdit(user)}
            >
              Editar Usuário
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!podeDeletar}
              className="text-red-600"
               onClick={() => handleDelete(user)}
            >
              Excluir Usuário
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];