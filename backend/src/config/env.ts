import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  edcUserIds: new Set((process.env.EDC_USER_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean)),
};

