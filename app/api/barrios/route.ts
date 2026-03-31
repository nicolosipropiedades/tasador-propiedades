import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("valores_m2")
    .select("barrio");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const barriosUnicos = [...new Set(data.map((item) => item.barrio))];

  return Response.json(barriosUnicos);
}