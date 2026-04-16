import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nombre,
      celular,
      intencion_venta,
      barrio,
      tipo_propiedad,
      m2_cubiertos,
      m2_descubiertos,
      ambientes,
      cochera,
      estado,
      amenities,
      valor_final,
      rango_min,
      rango_max,
    } = body;

    const { error } = await supabase.from("leads").insert({
      nombre,
      celular,
      intencion_venta,
      barrio,
      tipo_propiedad,
      m2_cubiertos,
      m2_descubiertos,
      ambientes,
      cochera,
      estado,
      amenities,
      valor_final,
      rango_min,
      rango_max,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error inesperado";

    return Response.json({ error: message }, { status: 500 });
  }
}