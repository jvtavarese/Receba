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

interface Empresa {
  id: string;
  nome: string;
}

export function RecebiveisFilters({ empresas }: { empresas: Empresa[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todos") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  }

  function handleClear() {
    router.push("/");
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm mb-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Empresa</Label>
          <Select
            value={searchParams.get("empresa_id") ?? "todos"}
            onValueChange={(v) => handleFilter("empresa_id", v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Status</Label>
          <Select
            value={searchParams.get("status") ?? "todos"}
            onValueChange={(v) => handleFilter("status", v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="recebido">Recebido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">De</Label>
          <Input
            type="date"
            className="w-[160px]"
            value={searchParams.get("data_inicio") ?? ""}
            onChange={(e) => handleFilter("data_inicio", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Até</Label>
          <Input
            type="date"
            className="w-[160px]"
            value={searchParams.get("data_fim") ?? ""}
            onChange={(e) => handleFilter("data_fim", e.target.value)}
          />
        </div>

        {searchParams.toString() && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
