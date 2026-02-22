import { updateSession } from "@/lib/supabase-middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Protege todas as rotas exceto assets estáticos e API
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
