import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { slugify } from "@/lib/slugify";

export const runtime = "nodejs";

/**
 * Las funciones serverless de Vercel rechazan bodies de más de ~4,5 MB antes de que este
 * handler se ejecute, devolviendo HTML en vez de JSON. El límite anterior era de 6 MB, así
 * que un flyer de 5 MB nunca llegaba acá y el panel mostraba un error de parseo sin sentido.
 * Se valida por debajo de ese techo para que el rechazo sea nuestro y el mensaje, útil.
 */
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file received");
    if (!file.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen");
    if (file.size > MAX_SIZE) {
      throw new Error("El flyer es demasiado pesado. Comprimilo o usá una imagen menor a 2 MB.");
    }

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
