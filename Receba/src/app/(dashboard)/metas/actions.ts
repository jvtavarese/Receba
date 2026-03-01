"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMetasProgresso(mes: number, ano: number) {
  const inicioMes = new Date(ano, mes - 1, 1);
  const fimMes = new Date(ano, mes, 0, 23, 59, 59);

  const [empresas, vendas] = await Promise.all([
    prisma.empresa.findMany({
      orderBy: { nome: "asc" },
      include: { metas: { where: { mes, ano }, take: 1 } },
    }),
    prisma.pedido.groupBy({
      by: ["empresa_id"],
      _sum: { valor_total: true },
      where: { data_faturamento: { gte: inicioMes, lte: fimMes } },
    }),
  ]);

  const vendasMap = new Map(
    vendas.map((v) => [v.empresa_id, Number(v._sum.valor_total ?? 0)])
  );

  return empresas.map((empresa) => {
    const meta = empresa.metas[0];
    const vendido = vendasMap.get(empresa.id) ?? 0;
    const valorMeta = meta ? Number(meta.valor_meta) : 0;
    const progresso = valorMeta > 0 ? (vendido / valorMeta) * 100 : 0;

    return {
      empresa_id: empresa.id,
      empresa_nome: empresa.nome,
      meta_id: meta?.id ?? null,
      valor_meta: valorMeta,
      vendido,
      progresso: Math.min(progresso, 100),
      progressoReal: progresso,
    };
  });
}

export async function upsertMeta(formData: FormData) {
  const empresa_id = formData.get("empresa_id") as string;
  const mes = Number(formData.get("mes"));
  const ano = Number(formData.get("ano"));
  const valor_meta = Number(formData.get("valor_meta"));

  if (!empresa_id || !mes || !ano || valor_meta <= 0) {
    return { error: "Preencha todos os campos corretamente" };
  }

  try {
    const existing = await prisma.metaMensal.findFirst({
      where: { empresa_id, mes, ano },
    });

    if (existing) {
      await prisma.metaMensal.update({
        where: { id: existing.id },
        data: { valor_meta },
      });
    } else {
      await prisma.metaMensal.create({
        data: { empresa_id, mes, ano, valor_meta },
      });
    }
  } catch {
    return { error: "Erro ao salvar meta" };
  }

  revalidatePath("/metas");
  return { success: true };
}
