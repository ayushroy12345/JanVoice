import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-primary/10 text-primary border-transparent",
  secondary: "bg-muted text-muted-foreground border-transparent",
  destructive: "bg-danger/10 text-danger border-transparent",
  warning: "bg-warning/10 text-warning border-transparent",
  success: "bg-success/10 text-success border-transparent",
  outline: "text-card-foreground border-border",
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
