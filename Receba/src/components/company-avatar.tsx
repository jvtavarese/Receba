import { cn } from "@/lib/utils"

const COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

interface CompanyAvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
}

export function CompanyAvatar({ name, size = "md", className }: CompanyAvatarProps) {
  const colorClass = COLORS[hashName(name) % COLORS.length]
  const initials = getInitials(name)

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-white font-bold shrink-0 shadow-sm",
        colorClass,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  )
}
