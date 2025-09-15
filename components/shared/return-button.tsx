"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

export function ReturnButton({
  variant = "ghost",
  short = false,
  ...props
}: ComponentProps<typeof Button> & { short?: boolean }) {
  const router = useRouter()

  return (
    <Button
      variant={variant}
      size={short ? "icon" : "sm"}
      onClick={() => router.back()}
      className={cn(
        "group hover:bg-accent hover:text-accent-foreground transition-all duration-300",
        "hover:shadow-md hover:scale-105",
        props.className,
      )}
      {...props}
    >
      <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform duration-300" />
      {short ? null : "Voltar ao Cardápio"}
    </Button>
  )
}
