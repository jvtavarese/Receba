import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getEmpresas } from "./actions";
import { EmpresaFormDialog } from "./empresa-form-dialog";
import { DeleteEmpresaButton } from "./delete-empresa-button";
import { CompanyAvatar } from "@/components/company-avatar";
import { Pencil, Calendar, CalendarClock, Building2 } from "lucide-react";

export default async function EmpresasPage() {
  const empresas = await getEmpresas();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Empresas</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie suas empresas representadas</p>
        </div>
        <EmpresaFormDialog />
      </div>

      {empresas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-muted mb-4">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Nenhuma empresa cadastrada.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Clique em &quot;Nova Empresa&quot; para começar</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Comissão</TableHead>
                  <TableHead className="font-semibold">Modo Pagamento</TableHead>
                  <TableHead className="text-right font-semibold">Dia Fixo</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <CompanyAvatar name={empresa.nome} size="sm" />
                        <span className="font-medium">{empresa.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-lg bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground ring-1 ring-primary/20 tabular-nums font-mono">
                        {Number(empresa.percentual_comissao).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {empresa.modo_pagamento === "data_exata" ? (
                          <>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Data Exata</span>
                          </>
                        ) : (
                          <>
                            <CalendarClock className="h-3.5 w-3.5" />
                            <span>Dia Fixo</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {empresa.dia_fixo_pagamento ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-0.5">
                        <EmpresaFormDialog
                          empresa={{
                            id: empresa.id,
                            nome: empresa.nome,
                            percentual_comissao: Number(empresa.percentual_comissao),
                            modo_pagamento: empresa.modo_pagamento,
                            dia_fixo_pagamento: empresa.dia_fixo_pagamento,
                          }}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />
                        <DeleteEmpresaButton
                          id={empresa.id}
                          nome={empresa.nome}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
