"use server";

import { prisma } from "@/lib/prisma";
import { pedidoSchema } from "@/lib/schemas";
import { calcularDuplicatas } from "@/lib/duplicatas";
import { revalidatePath } from "next/cache";

export async function getPedidos(filtros?: {
  empresa_id?: string;
  data_inicio?: string;
  data_fim?: string;
}) {
  return prisma.pedido.findMany({
    where: {
      ...(filtros?.empresa_id && { empresa_id: filtros.empresa_id }),
      ...(filtros?.data_inicio || filtros?.data_fim
        ? {
            data_faturamento: {
              ...(filtros?.data_inicio && {
                gte: new Date(filtros.data_inicio + "T00:00:00"),
              }),
              ...(filtros?.data_fim && {
                lte: new Date(filtros.data_fim + "T00:00:00"),
              }),
            },
          }
        : {}),
    },
    include: {
      empresa: true,
      duplicatas: { orderBy: { numero_parcela: "asc" } },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function updatePedido(id: string, formData: FormData) {
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

  const novasDuplicatas = calcularDuplicatas({
    valor_total: parsed.data.valor_total,
    data_faturamento: dataFaturamento,
    qtd_parcelas: parsed.data.qtd_parcelas,
    prazo_dias: parsed.data.prazo_dias,
    modo_pagamento: empresa.modo_pagamento,
    dia_fixo_pagamento: empresa.dia_fixo_pagamento,
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.pedido.update({
        where: { id },
        data: {
          empresa_id: parsed.data.empresa_id,
          valor_total: parsed.data.valor_total,
          data_faturamento: dataFaturamento,
          qtd_parcelas: parsed.data.qtd_parcelas,
          prazo_dias: parsed.data.prazo_dias,
        },
      });

      // Remove apenas duplicatas pendentes, preserva recebidas
      await tx.duplicata.deleteMany({
        where: { pedido_id: id, status: "pendente" },
      });

      // Conta quantas recebidas existem para ajustar numeração
      const recebidas = await tx.duplicata.findMany({
        where: { pedido_id: id, status: "recebido" },
        orderBy: { numero_parcela: "asc" },
      });

      const parcelasRecebidasNums = new Set(
        recebidas.map((r) => r.numero_parcela)
      );

      // Recria apenas as duplicatas cujas parcelas não estão recebidas
      const duplicatasParaCriar = novasDuplicatas.filter(
        (d) => !parcelasRecebidasNums.has(d.numero_parcela)
      );

      if (duplicatasParaCriar.length > 0) {
        await tx.duplicata.createMany({
          data: duplicatasParaCriar.map((d) => ({
            pedido_id: id,
            numero_parcela: d.numero_parcela,
            valor: d.valor,
            data_vencimento: d.data_vencimento,
            data_real_pagamento: d.data_real_pagamento,
            status: "pendente" as const,
          })),
        });
      }
    });
  } catch {
    return { error: "Erro ao atualizar pedido" };
  }

  revalidatePath("/pedidos");
  revalidatePath("/");
  return { success: true };
}

export async function deletePedido(id: string) {
  try {
    await prisma.pedido.delete({ where: { id } });
  } catch {
    return { error: "Erro ao excluir pedido" };
  }

  revalidatePath("/pedidos");
  revalidatePath("/");
  return { success: true };
}
