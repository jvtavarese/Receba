/**
 * Calcula data de vencimento e data real de pagamento das duplicatas.
 * Regras definidas em files/requisitos-detalhados.md seção 3.1 e 3.2.
 */

export interface DuplicataPreview {
  numero_parcela: number;
  valor: number;
  data_vencimento: Date;
  data_real_pagamento: Date;
}

interface CalcParams {
  valor_total: number;
  data_faturamento: Date;
  qtd_parcelas: number;
  prazo_dias: number;
  modo_pagamento: "data_exata" | "dia_fixo";
  dia_fixo_pagamento: number | null;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Modo "dia_fixo": se vencimento.dia <= dia_fixo → mesmo mês;
 * se > dia_fixo → mês seguinte.
 */
function calcDataRealPagamento(
  dataVencimento: Date,
  modoPagamento: "data_exata" | "dia_fixo",
  diaFixo: number | null
): Date {
  if (modoPagamento === "data_exata") {
    return new Date(dataVencimento);
  }

  const dia = diaFixo!;
  const vencDia = dataVencimento.getDate();
  let mes = dataVencimento.getMonth();
  let ano = dataVencimento.getFullYear();

  if (vencDia > dia) {
    mes += 1;
    if (mes > 11) {
      mes = 0;
      ano += 1;
    }
  }

  // Trata meses com menos dias que o dia fixo (ex: dia 31 em fevereiro)
  const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
  const diaReal = Math.min(dia, ultimoDiaMes);

  return new Date(ano, mes, diaReal);
}

export function calcularDuplicatas(params: CalcParams): DuplicataPreview[] {
  const {
    valor_total,
    data_faturamento,
    qtd_parcelas,
    prazo_dias,
    modo_pagamento,
    dia_fixo_pagamento,
  } = params;

  const valorParcela = valor_total / qtd_parcelas;
  const duplicatas: DuplicataPreview[] = [];

  for (let i = 1; i <= qtd_parcelas; i++) {
    const dataVencimento = addDays(data_faturamento, prazo_dias * i);
    const dataRealPagamento = calcDataRealPagamento(
      dataVencimento,
      modo_pagamento,
      dia_fixo_pagamento
    );

    duplicatas.push({
      numero_parcela: i,
      valor: Math.round(valorParcela * 100) / 100,
      data_vencimento: dataVencimento,
      data_real_pagamento: dataRealPagamento,
    });
  }

  return duplicatas;
}
