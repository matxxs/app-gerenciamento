import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Shield } from "lucide-react"

interface PersonalInfoCardProps {
  email: string
  isActive: boolean
}

export function PersonalInfoCard({ email, isActive }: PersonalInfoCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email */}
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{email}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={isActive ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        {/* <div className="flex gap-3 pt-4 border-t">
          <Button className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Perfil
          </Button>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Key className="h-4 w-4" />
            Alterar Senha
          </Button>
        </div> */}
      </CardContent>
    </Card>
  )
}
