import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, FileText, LogIn } from "lucide-react"

export function RecentActivityCard() {
  const activities = [
    {
      icon: LogIn,
      title: "Fez login no sistema",
      time: "2 horas atrás",
      description: "Acesso via web",
    },
    {
      icon: FileText,
      title: "Gerou Relatório Financeiro",
      time: "1 dia atrás",
      description: "Relatório mensal de vendas",
    },
    {
      icon: FileText,
      title: "Atualizou dados da empresa",
      time: "3 dias atrás",
      description: "Informações de contato",
    },
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/30">
              <div className="flex-shrink-0">
                <activity.icon className="h-5 w-5 text-primary mt-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
