export const siteOrigin = "https://numerix-umber.vercel.app";

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function supabasePublishableKey() {
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ""
  ).trim();
  if (!key || key.startsWith("sb_secret_")) return "";
  return key;
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabasePublishableKey());
}

export function supabaseConfigError() {
  const raw = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ""
  ).trim();
  if (raw.startsWith("sb_secret_")) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY is set to the secret key. Use the publishable key (sb_publishable_…) there, and put the secret in SUPABASE_SERVICE_ROLE_KEY. Then redeploy.";
  }
  if (!supabaseUrl() || !raw) {
    return "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (the publishable key), then redeploy.";
  }
  return null;
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isListedAdmin(email: string) {
  return adminEmails().includes(email.trim().toLowerCase());
}
