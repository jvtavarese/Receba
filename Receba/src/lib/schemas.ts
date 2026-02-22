import { z } from "zod/v4";

export const empresaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  percentual_comissao: z
    .number()
    .min(0, "Comissão deve ser >= 0")
    .max(100, "Comissão deve ser <= 100"),
  modo_pagamento: z.enum(["data_exata", "dia_fixo"]),
  dia_fixo_pagamento: z.number().int().min(1).max(31).nullable(),
}).refine(
  (data) => {
    if (data.modo_pagamento === "dia_fixo") {
      return data.dia_fixo_pagamento !== null;
    }
    return true;
  },
  {
    message: "Dia fixo é obrigatório quando modo de pagamento é 'dia_fixo'",
    path: ["dia_fixo_pagamento"],
  }
);

export type EmpresaFormData = z.infer<typeof empresaSchema>;

export const pedidoSchema = z.object({
  empresa_id: z.string().min(1, "Empresa é obrigatória"),
  valor_total: z.number().positive("Valor deve ser maior que zero"),
  data_faturamento: z.string().min(1, "Data de faturamento é obrigatória"),
  qtd_parcelas: z.number().int().min(1, "Mínimo 1 parcela"),
  prazo_dias: z.number().int().min(1, "Prazo deve ser maior que zero"),
});

export type PedidoFormData = z.infer<typeof pedidoSchema>;
