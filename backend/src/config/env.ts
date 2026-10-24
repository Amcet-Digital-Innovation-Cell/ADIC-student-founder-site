import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  edcUserIds: new Set((process.env.EDC_USER_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean)),
  // The Supabase schema that isolates this project's tables.
  // Set DB_SCHEMA=founder_hub in .env (or your hosting environment).
  // Falls back to "public" so existing deployments without this variable keep working.
  dbSchema: process.env.DB_SCHEMA || "public",
};

