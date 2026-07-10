// Connexion Drizzle unique (côté serveur uniquement).
import { createDb, type Database } from "@prestige/database";

let db: Database | undefined;

export function getDb(): Database {
  if (!db) {
    const url = process.env.DATABASE_URL ?? "postgres://prestige:prestige@localhost:5432/prestige";
    db = createDb(url);
  }
  return db;
}
