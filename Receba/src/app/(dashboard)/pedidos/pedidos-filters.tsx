"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";

interface Empresa {
  id: string;
  nome: string;
}

export function PedidosFilters({ empresas }: { empresas: Empresa[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todas") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/pedidos?${params.toString()}`);
  }

  function handleClear() {
    router.push("/pedidos");
  }

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 mr-1 text-muted-foreground self-end pb-2">
          <SlidersHorizontal className="h-4 w-4" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Empresa</Label>
          <Select
            value={searchParams.get("empresa_id") ?? "todas"}
            onValueChange={(v) => handleFilter("empresa_id", v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">De</Label>
          <Input
            type="date"
            className="w-[160px]"
            value={searchParams.get("data_inicio") ?? ""}
            onChange={(e) => handleFilter("data_inicio", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Até</Label>
          <Input
            type="date"
            className="w-[160px]"
            value={searchParams.get("data_fim") ?? ""}
            onChange={(e) => handleFilter("data_fim", e.target.value)}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-foreground gap-1">
            <X className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
