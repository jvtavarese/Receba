import { cn } from "@/lib/utils"

type Status = "pendente" | "atrasado" | "recebido"

const statusConfig: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  pendente: {
    label: "Pendente",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  atrasado: {
    label: "Atrasado",
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
  },
  recebido: {
    label: "Recebido",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  )
}
