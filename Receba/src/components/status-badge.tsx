import { cn } from "@/lib/utils"

type Status = "pendente" | "atrasado" | "recebido"

const statusConfig: Record<Status, { label: string; dot: string; bg: string; text: string; ring: string }> = {
  pendente: {
    label: "Pendente",
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-500/20",
  },
  atrasado: {
    label: "Atrasado",
    dot: "bg-red-500 animate-pulse",
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-500/20",
  },
  recebido: {
    label: "Recebido",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-500/20",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
        config.bg,
        config.text,
        config.ring,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  )
}
