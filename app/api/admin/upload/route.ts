import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { slugify } from "@/lib/slugify";

export const runtime = "nodejs";

const MAX_SIZE = 6 * 1024 * 1024;

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file received");
    if (!file.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen");
    if (file.size > MAX_SIZE) throw new Error("El flyer no puede pesar más de 6MB");

    const supabase = getSupabaseAdminClient();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "event-flyers";
    const ext = file.name.split(".").pop() || "jpg";
    const safeName = slugify(file.name.replace(`.${ext}`, "")) || "flyer";
    const path = `${new Date().getFullYear()}/${Date.now()}-${safeName}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      upsert: false
    });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload error" }, { status: 400 });
  }
}
