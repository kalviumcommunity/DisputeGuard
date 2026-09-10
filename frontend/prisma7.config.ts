import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";
import packageJson from './package.json';

// Use the same .env.local / .env loading rules as the Next.js application.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7 executes this field; package.json keeps the assignment entry.
    seed: packageJson.prisma.seed,
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
