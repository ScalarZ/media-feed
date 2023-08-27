export function getImageUrl(bucket: "posts" | "products", path?: string) {
  if (!path) return;
  return `https://mnlgmybxfwugjaizllrn.supabase.co/storage/v1/object/public/${bucket}/${path}`;
}
