import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

/**
 * Service-role Supabase client.
 * Used for all backend DB operations — carries full privileges and bypasses RLS
 * where the service-role policy allows it (e.g. "Service role has full access").
 */
export const supabase =
  env.supabaseUrl && env.supabaseServiceRoleKey
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

/**
 * Returns a schema-scoped query builder.
 * Uses the DB_SCHEMA environment variable (defaults to "public" if not set).
 *
 * Usage:
 *   db()?.from("requirements").select("*")
 *   // equivalent to supabase.schema("founder_hub").from("requirements").select("*")
 */
export function db() {
  return supabase ? supabase.schema(env.dbSchema) : null;
}
