"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,

} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/app-selector"
import { useRouter } from "next/navigation"
import { loginUser, selectAuthError, selectAuthStatus, selectUser } from "@/lib/features/auth/auth-slice"
import { FormEvent, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const dispatch = useAppDispatch();
  const authError = useAppSelector(selectAuthError);
  const authStatus = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectUser);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

 useEffect(() => {
    if (authStatus === 'succeeded' && user) {
      toast.success(`Bem-vindo(a) de volta, ${user.nome_completo}!`, {
        description: "Você será redirecionado para o painel principal.",
        duration: 3000,
      });
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      return () => clearTimeout(timer); 
    }

    if (authStatus === 'failed' && authError) {
      toast.error('Falha na Autenticação', {
        description: authError,
        duration: 5000,
      });
    }
  }, [authStatus, authError, user, router]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (email && senha) {
      dispatch(loginUser({ email, senha }));
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bem vindo de volta</h1>
                <p className="text-muted-foreground text-balance">
                  Entre na sua conta
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input id="password" type="password" required onChange={(e) => setSenha(e.target.value)} />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={authStatus === 'loading'}
              >
                {authStatus === 'loading' && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Login
              </Button>
              <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <a href="#" className="underline underline-offset-4">
                  Inscrever-se
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="guest.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Ao clicar em continuar, você concorda com nossos <a href="#">Termos de Serviço</a>{" "}
        e <a href="#">Política de Privacidade</a>.
      </div>
    </div>
  )
}