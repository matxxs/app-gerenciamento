"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Funcao } from "@/lib/types";

// Componentes da UI e Redux
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { FuncaoForm } from "./funcao-form";
import { FuncoesDataTable } from "./funcoes-data-table";
import { getFuncoesColumns } from "./funcoes-columns";
import { useGetFuncoesQuery, useDeleteFuncaoMutation } from "@/lib/features/funcoes/funcoes-api-slice";
import { toast } from "sonner";

export function FuncoesClient() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedFuncaoId, setSelectedFuncaoId] = useState<number | null>(null);

  const { data: funcoes = [], isLoading, isError } = useGetFuncoesQuery();
  const [deleteFuncao] = useDeleteFuncaoMutation();

  const handleAddNew = () => {
    setSelectedFuncaoId(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (funcao: Funcao) => {
    setSelectedFuncaoId(funcao.id_funcao);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    toast.promise(deleteFuncao(id).unwrap(), {
      loading: "Excluindo função...",
      success: "Função excluída com sucesso!",
      error: "Erro ao excluir a função.",
    });
  };

  const columns = getFuncoesColumns({ onEdit: handleEdit, onDelete: handleDelete });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-red-600">Falha ao carregar as funções. Tente novamente.</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Funções</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Função
        </Button>
      </div>

      <FuncoesDataTable columns={columns} data={funcoes} />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-3xl w-full">
          <FuncaoForm
            key={String(selectedFuncaoId)} 
            funcaoId={selectedFuncaoId} 
            onClose={() => setIsSheetOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}