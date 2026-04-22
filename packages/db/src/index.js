import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is required. Set it to your Neon Postgres connection string.");
}
const pool = new Pool({
    connectionString: databaseUrl
});
const adapter = new PrismaPg(pool);
export const prisma = globalThis.prismaGlobal ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prisma;
}
export * from "@prisma/client";
