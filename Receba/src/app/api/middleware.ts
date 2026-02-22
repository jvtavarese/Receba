import { NextRequest, NextResponse } from "next/server";

export function validateApiKey(request: NextRequest): NextResponse | null {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    return NextResponse.json(
      { error: "API_KEY não configurada no servidor" },
      { status: 500 }
    );
  }

  if (apiKey !== expectedKey) {
    return NextResponse.json(
      { error: "API key inválida" },
      { status: 401 }
    );
  }

  return null;
}
