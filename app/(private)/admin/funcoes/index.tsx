"use client";

import Demo403Page from "@/app/demo/403/page";

import { usePermissions } from "@/lib/hooks/use-permissions";
import { FuncoesClient } from "./funcoes-client";

export default function IndexPage() {
  // Use a chave de tela correta para o gerenciamento de funções
  // const { pode_ler } = usePermissions('ADMIN_FUNCOES'); // Exemplo de chave de tela
  
  // if (!pode_ler) {
  //   return <Demo403Page />;
  // }

  return <FuncoesClient />;
}