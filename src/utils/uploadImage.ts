import { supabase } from "@/lib/supabase";

const supabaseBucketUrl =
  "https://mnlgmybxfwugjaizllrn.supabase.co/storage/v1/object/public";

type Bucket = "products" | "posts";

export function uploadImage(bucket: Bucket, file: File, path: string) {
  return supabase.storage.from(bucket).upload(path, file);
}

export function updateImage(bucket: Bucket, file: File, path: string) {
  return supabase.storage
    .from(bucket)
    .update(path.replace(`${supabaseBucketUrl}/${bucket}`, ""), file);
}

export function deleteImage(bucket: Bucket, paths: string[]) {
  if (!paths.length) return;
  return supabase.storage
    .from(bucket)
    .remove(
      paths.map((path) => path.replace(`${supabaseBucketUrl}/${bucket}/`, ""))
    ) as unknown as
    | {
        data: {
          path: string;
        };
        error: null;
      }
    | {
        data: null;
        error: any;
      };
}
