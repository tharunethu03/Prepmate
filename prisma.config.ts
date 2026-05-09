import { defineConfig } from "prisma/config";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

// When prisma.config.ts is present, Prisma CLI skips automatic .env loading.
// Load it manually using Node built-ins so DATABASE_URL is always available.
const envPath = join(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
