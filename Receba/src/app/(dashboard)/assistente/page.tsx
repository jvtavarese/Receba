import { MessageSquare } from "lucide-react";
import { Chat } from "./chat";

export const metadata = {
  title: "Assistente | Receba",
};

export default function AssistentePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Assistente</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Converse em linguagem natural para gerenciar pedidos, empresas, metas e recebíveis.
        </p>
      </div>
      <Chat />
    </div>
  );
}
