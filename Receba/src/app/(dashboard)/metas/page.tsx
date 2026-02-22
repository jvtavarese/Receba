import { getMetasProgresso } from "./actions";
import { MetasContent } from "./metas-content";

export default async function MetasPage({
  searchParams,
}: {
  searchParams: { mes?: string; ano?: string };
}) {
  const hoje = new Date();
  const mes = searchParams.mes ? Number(searchParams.mes) : hoje.getMonth() + 1;
  const ano = searchParams.ano ? Number(searchParams.ano) : hoje.getFullYear();

  const dados = await getMetasProgresso(mes, ano);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Metas</h2>
        <p className="text-sm text-muted-foreground">Acompanhe o progresso das metas mensais</p>
      </div>
      <MetasContent dados={dados} mes={mes} ano={ano} />
    </div>
  );
}
