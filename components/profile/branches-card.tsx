import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Adicionei o ícone ShieldCheck para a visão do admin
import { Building2, ShieldCheck } from "lucide-react"

interface Branch {
  nome_filial: string
}

interface BranchesCardProps {
  role: string;
  branches: Branch[]
}

export function BranchesCard({ role, branches }: BranchesCardProps) {
  const isAdmin = role === 'Administrador';

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Filiais com Acesso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isAdmin ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium">Acesso total a todas as filiais.</span>
            </div>
          ) : (
            branches.map((branch, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-medium">{branch.nome_filial}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}