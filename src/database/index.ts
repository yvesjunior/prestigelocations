import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import * as schema from "./schema/index.js";

export * from "./schema/index.js";

export type Database = ReturnType<typeof createDb>;

export function createDb(url: string) {
  // connect_timeout court : si la BD est injoignable, le site doit basculer en
  // page de maintenance en quelques secondes, pas après les 30 s par défaut.
  const client = postgres(url, { max: 10, connect_timeout: 5 });
  return drizzle(client, { schema });
}

// Le hachage vit ici pour être partagé entre le seed et l'app web.
export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}
