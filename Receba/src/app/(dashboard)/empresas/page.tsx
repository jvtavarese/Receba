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
import { Pencil, Calendar, CalendarClock } from "lucide-react";

export default async function EmpresasPage() {
  const empresas = await getEmpresas();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Empresas</h2>
          <p className="text-sm text-muted-foreground">Gerencie suas empresas representadas</p>
        </div>
        <EmpresaFormDialog />
      </div>

      {empresas.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhuma empresa cadastrada. Clique em &quot;Nova Empresa&quot; para começar.
        </p>
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Modo Pagamento</TableHead>
                <TableHead className="text-right">Dia Fixo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CompanyAvatar name={empresa.nome} size="sm" />
                      <span className="font-medium">{empresa.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {Number(empresa.percentual_comissao).toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {empresa.modo_pagamento === "data_exata" ? (
                        <>
                          <Calendar className="h-3.5 w-3.5" />
                          Data Exata
                        </>
                      ) : (
                        <>
                          <CalendarClock className="h-3.5 w-3.5" />
                          Dia Fixo
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {empresa.dia_fixo_pagamento ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <EmpresaFormDialog
                        empresa={{
                          id: empresa.id,
                          nome: empresa.nome,
                          percentual_comissao: Number(empresa.percentual_comissao),
                          modo_pagamento: empresa.modo_pagamento,
                          dia_fixo_pagamento: empresa.dia_fixo_pagamento,
                        }}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
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
      )}
    </div>
  );
}
