import { config as loadDotenv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Carrega .env localmente; em produção/CI as variáveis já estão no process.env
loadDotenv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
