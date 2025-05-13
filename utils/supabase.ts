const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_BUCKET = "legacy-media";

export function getSupabaseUrl(path: string): string {
  if (!path) return "";
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
}

export function getSupabasePath(url: string): string {
  if (!url) return "";
  const parts = url.split("/");
  return parts.slice(-2).join("/"); // Returns "userId/filename"
}
