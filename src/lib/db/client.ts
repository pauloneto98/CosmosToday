import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let db: any;

if (process.env.DATABASE_URL) {
  try {
    const queryClient = postgres(process.env.DATABASE_URL, {
      max: 10,
      ssl: "prefer", // Permite conexões locais simples ou seguras na nuvem
    });
    db = drizzle(queryClient, { schema });
  } catch (error) {
    console.error("❌ Falha ao conectar ao banco de dados Postgres:", error);
    db = createMockDb();
  }
} else {
  console.warn("⚠️ DATABASE_URL não definida em .env.local. Ativando Mock Database para ambiente de demonstração.");
  db = createMockDb();
}

// Cria um Mock Database para garantir resiliência durante builds e desenvolvimento local sem credenciais
function createMockDb() {
  const chainable = {
    where: () => Promise.resolve([]),
    orderBy: () => Promise.resolve([]),
    limit: () => Promise.resolve([]),
    returning: () => Promise.resolve([{ id: "mock-id" }]),
    values: () => chainable,
    set: () => chainable,
  };

  return {
    select: () => ({
      from: () => chainable,
    }),
    insert: () => ({
      values: () => chainable,
    }),
    update: () => ({
      set: () => chainable,
    }),
    delete: () => ({
      where: () => chainable,
    }),
    execute: () => Promise.resolve([]),
  } as any;
}

export { db };
export * from "./schema";
export type DbType = typeof db;
