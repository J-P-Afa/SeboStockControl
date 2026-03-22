/**
 * @ai-context Átomo: Input. Componente de entrada de dados textual, com suporte a estados de erro (aria-invalid).
 */
"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input/50 bg-background/50 backdrop-blur-sm px-3 py-1 text-base transition-all duration-300 outline-none placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:glow-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10 md:text-sm dark:bg-input/20 dark:border-white/5",
        className
      )}
      {...props}
    />
  )
}

export { Input }
