import { AnimatedBackground } from "@/components/animations/animated-background";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <AnimatedBackground />
      <div className="relative w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  )
}