import { FlameIcon, GrillIcon, SkewerIcon, SmokeIcon } from "../icons/churrasco-icons"
import { ReturnButton } from "./return-button"

export function Forbidden({
  description = "Você não tem permissão para acessar esta área. Entre em contato conosco se precisar de acesso especial.",
}: {
  description?: string
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background smoke effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 smoke-animation">
          <SmokeIcon className="w-8 h-8" />
        </div>
        <div className="absolute top-32 right-16 smoke-animation [animation-delay:1s]">
          <SmokeIcon className="w-6 h-6" />
        </div>
        <div className="absolute bottom-40 left-20 smoke-animation [animation-delay:2s]">
          <SmokeIcon className="w-10 h-10" />
        </div>
        <div className="absolute bottom-60 right-12 smoke-animation [animation-delay:0.5s]">
          <SmokeIcon className="w-7 h-7" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        {/* Animated skewer with floating effect */}
        <div className="flex justify-center mb-8">
          <div className="float-animation">
            <SkewerIcon className="w-24 h-24 drop-shadow-lg text-chart-5" />
          </div>
        </div>

        {/* 403 with flame icons */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 text-6xl md:text-8xl font-bold text-chart-5">
            <FlameIcon className="w-12 h-12 md:w-16 md:h-16 glow-animation text-chart-5" />
            <span className="tracking-tighter">403</span>
            <FlameIcon className="w-12 h-12 md:w-16 md:h-16 glow-animation text-chart-5 [animation-delay:1s]" />
          </div>

          <div className="flex items-center justify-center gap-3 text-chart-5/80">
            <GrillIcon className="w-5 h-5" />
            <h2 className="text-lg md:text-xl font-semibold tracking-tight">Acesso negado</h2>
            <GrillIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Main message */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-balance">
            Acesso restrito à área VIP
          </h1>
          <p className="text-base md:text-lg text-muted-foreground text-pretty max-w-lg mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Decorative grill section */}
        <div className="py-8">
          <div className="flex justify-center items-center gap-2 opacity-60">
            <div className="h-px bg-border flex-1 max-w-20"></div>
            <GrillIcon className="w-6 h-6 text-muted-foreground" />
            <div className="h-px bg-border flex-1 max-w-20"></div>
          </div>
        </div>

        {/* Return button */}
        <div className="pt-4">
          <ReturnButton
            variant="default"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          />
        </div>

        <p className="text-sm text-muted-foreground/70 pt-8">
          Visite nossa área pública com pratos incríveis!
        </p>
      </div>

      {/* Bottom decorative flames */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 pb-8 pointer-events-none opacity-20">
        <FlameIcon className="w-8 h-8 glow-animation text-chart-5" />
        <FlameIcon className="w-6 h-6 glow-animation text-chart-5 [animation-delay:0.5s]" />
        <FlameIcon className="w-10 h-10 glow-animation text-chart-5 [animation-delay:1.5s]" />
        <FlameIcon className="w-7 h-7 glow-animation text-chart-5 [animation-delay:2s]" />
      </div>
    </div>
  )
}