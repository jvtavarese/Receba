"use server";

import { prisma } from "@/lib/prisma";
import { pedidoSchema } from "@/lib/schemas";
import { calcularDuplicatas } from "@/lib/duplicatas";
import { revalidatePath } from "next/cache";

export async function createPedido(formData: FormData) {
  const raw = {
    empresa_id: formData.get("empresa_id") as string,
    valor_total: Number(formData.get("valor_total")),
    data_faturamento: formData.get("data_faturamento") as string,
    qtd_parcelas: Number(formData.get("qtd_parcelas")),
    prazo_dias: Number(formData.get("prazo_dias")),
  };

  const parsed = pedidoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id: parsed.data.empresa_id },
  });

  if (!empresa) {
    return { error: "Empresa não encontrada" };
  }

  const dataFaturamento = new Date(parsed.data.data_faturamento + "T00:00:00");

  const duplicatasPreview = calcularDuplicatas({
    valor_total: parsed.data.valor_total,
    data_faturamento: dataFaturamento,
    qtd_parcelas: parsed.data.qtd_parcelas,
    prazo_dias: parsed.data.prazo_dias,
    modo_pagamento: empresa.modo_pagamento,
    dia_fixo_pagamento: empresa.dia_fixo_pagamento,
  });

  try {
    await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.create({
        data: {
          empresa_id: parsed.data.empresa_id,
          valor_total: parsed.data.valor_total,
          data_faturamento: dataFaturamento,
          qtd_parcelas: parsed.data.qtd_parcelas,
          prazo_dias: parsed.data.prazo_dias,
        },
      });

      await tx.duplicata.createMany({
        data: duplicatasPreview.map((d) => ({
          pedido_id: pedido.id,
          numero_parcela: d.numero_parcela,
          valor: d.valor,
          data_vencimento: d.data_vencimento,
          data_real_pagamento: d.data_real_pagamento,
          status: "pendente" as const,
        })),
      });
    });
  } catch {
    return { error: "Erro ao criar pedido" };
  }

  revalidatePath("/pedidos", "page");
  revalidatePath("/", "page");
  return { success: true };
}
