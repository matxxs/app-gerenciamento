import type { Metadata } from "next";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Dashboard - Sistema de Gestão",
};

export default function Page() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 lg:p-10">
      {/* 1. Cabeçalho da Página */}
      <div className="flex flex-col items-start justify-between space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Bem-vindo de volta!
        </h1>
        <p className="text-lg text-muted-foreground">
          Aqui está um resumo do que está acontecendo no seu sistema.
        </p>
      </div>

      {/* 2. Grid de KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas Vendas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1.230</div>
            <p className="text-xs text-muted-foreground">
              +15% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+350</div>
            <p className="text-xs text-muted-foreground">
              +5.4% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+98,2%</div>
            <p className="text-xs text-muted-foreground">
              Meta de performance atingida
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Layout de Conteúdo Principal (Gráfico e Atividades) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Coluna do Gráfico (Simulada) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visão Geral da Receita</CardTitle>
            <CardDescription>
              Comparativo dos últimos 6 meses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Aqui você integraria um componente de gráfico real (ex: Recharts, Chart.js).
              Vamos usar um placeholder elegante por enquanto.
            */}
            <div className="flex h-[350px] w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/40">
              <p className="text-sm text-muted-foreground">
                (Componente de Gráfico)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coluna de Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas 5 atividades no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Nova Venda Realizada
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliente: Ana Silva (#1023)
                </p>
              </div>
              <div className="text-sm font-medium">R$ 1.250,00</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>RS</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Novo Cliente Cadastrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliente: Ricardo Souza
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>MJ</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Nova Venda Realizada
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliente: Maria Joaquina (#1024)
                </p>
              </div>
              <div className="text-sm font-medium">R$ 499,90</div>
            </div>

            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/vercel.png" alt="Avatar" />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Ticket de Suporte Fechado
                </p>
                <p className="text-sm text-muted-foreground">
                  Ticket #987 - Resolvido
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>PP</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Novo Cliente Cadastrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliente: Pedro Pascal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}