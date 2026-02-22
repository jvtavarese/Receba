"use server";

import { prisma } from "@/lib/prisma";
import { empresaSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function getEmpresas() {
  return prisma.empresa.findMany({
    orderBy: { nome: "asc" },
  });
}

export async function createEmpresa(formData: FormData) {
  const raw = {
    nome: formData.get("nome") as string,
    percentual_comissao: Number(formData.get("percentual_comissao")),
    modo_pagamento: formData.get("modo_pagamento") as string,
    dia_fixo_pagamento: formData.get("dia_fixo_pagamento")
      ? Number(formData.get("dia_fixo_pagamento"))
      : null,
  };

  const parsed = empresaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.empresa.create({
      data: {
        nome: parsed.data.nome,
        percentual_comissao: parsed.data.percentual_comissao,
        modo_pagamento: parsed.data.modo_pagamento,
        dia_fixo_pagamento: parsed.data.dia_fixo_pagamento,
      },
    });
  } catch {
    return { error: "Erro ao criar empresa" };
  }

  revalidatePath("/empresas");
  return { success: true };
}

export async function updateEmpresa(id: string, formData: FormData) {
  const raw = {
    nome: formData.get("nome") as string,
    percentual_comissao: Number(formData.get("percentual_comissao")),
    modo_pagamento: formData.get("modo_pagamento") as string,
    dia_fixo_pagamento: formData.get("dia_fixo_pagamento")
      ? Number(formData.get("dia_fixo_pagamento"))
      : null,
  };

  const parsed = empresaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.empresa.update({
      where: { id },
      data: {
        nome: parsed.data.nome,
        percentual_comissao: parsed.data.percentual_comissao,
        modo_pagamento: parsed.data.modo_pagamento,
        dia_fixo_pagamento: parsed.data.dia_fixo_pagamento,
      },
    });
  } catch {
    return { error: "Erro ao atualizar empresa" };
  }

  revalidatePath("/empresas");
  return { success: true };
}

export async function deleteEmpresa(id: string) {
  const pedidos = await prisma.pedido.count({ where: { empresa_id: id } });
  if (pedidos > 0) {
    return { error: "Não é possível excluir empresa com pedidos vinculados. Exclua os pedidos primeiro." };
  }

  try {
    await prisma.$transaction([
      prisma.metaMensal.deleteMany({ where: { empresa_id: id } }),
      prisma.empresa.delete({ where: { id } }),
    ]);
  } catch {
    return { error: "Erro ao excluir empresa." };
  }

  revalidatePath("/empresas");
  return { success: true };
}
