import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { chatWithAgent, type ChatMessage } from "@/lib/ai/chat";

// Rate limit simples: Map<sessionId, timestamps[]>
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 20; // max 20 msgs/min

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(sessionId) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimitMap.set(sessionId, recent);
  return true;
}

export async function POST(request: NextRequest) {
  // Auth via cookie Supabase
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Route handler não precisa setar cookies
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Rate limit
  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: "Muitas mensagens. Aguarde um momento." },
      { status: 429 }
    );
  }

  // Validar body
  let messages: ChatMessage[];
  try {
    const body = await request.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Mensagens inválidas" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Verificar API key configurada
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Assistente não configurado. Configure OPENROUTER_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const { stream } = await chatWithAgent(messages);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("[chat] Erro:", e);
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 }
    );
  }
}
