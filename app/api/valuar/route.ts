import { supabase } from "@/lib/supabase";

const coefEstadoMap: Record<string, number> = {
  "A refaccionar": 0.88,
  "Bueno": 1.0,
  "Excelente / Reciclado": 1.1,
};

const coefAmenitiesMap: Record<string, number> = {
  SUM: 0.01,
  Parrilla: 0.01,
  Piscina: 0.025,
  Gimnasio: 0.015,
  Seguridad: 0.02,
};

function getCoefAmbientes(ambientes: string | number) {
  const n = Number(ambientes);

  if (n <= 1) return 0.97;
  if (n === 2) return 1.0;
  if (n === 3) return 1.02;
  if (n === 4) return 1.04;
  return 1.06;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      barrio,
      tipo_propiedad,
      m2_cubiertos,
      m2_descubiertos,
      estado,
      cochera,
      ambientes,
      amenities,
    } = body;

    const { data: valorData, error: valorError } = await supabase
      .from("valores_m2")
      .select("valor_m2")
      .eq("barrio", barrio)
      .eq("tipo_propiedad", tipo_propiedad)
      .single();

    if (valorError || !valorData) {
      return Response.json(
        { error: "No se encontró valor_m2 para esa combinación." },
        { status: 400 }
      );
    }

    const valor_m2 = Number(valorData.valor_m2);

const cubiertos = Number(m2_cubiertos) || 0;
const descubiertos = Number(m2_descubiertos) || 0;

const m2_equivalentes = cubiertos + descubiertos * 0.25;

const valor_base = valor_m2 * m2_equivalentes;

    const coef_estado = coefEstadoMap[estado] || 1;
    const coef_cochera = cochera === "Sí" ? 1.07 : 1.0;
    const coef_ambientes = getCoefAmbientes(ambientes);

    const amenitiesArray: string[] = Array.isArray(amenities)
      ? amenities
      : typeof amenities === "string" && amenities.trim() !== ""
      ? amenities.split(",").map((a) => a.trim())
      : [];

    const plusAmenities = amenitiesArray.reduce((acc, item) => {
      return acc + (coefAmenitiesMap[item] || 0);
    }, 0);

    const coef_amenities = Math.min(1 + plusAmenities, 1.08);

    const valor_final = Math.round(
      (valor_base *
        coef_estado *
        coef_cochera *
        coef_ambientes *
        coef_amenities) /
        1000
    ) * 1000;

    const rango_min = Math.round((valor_final * 0.92) / 1000) * 1000;
    const rango_max = Math.round((valor_final * 1.08) / 1000) * 1000;

    return Response.json({
      valor_m2,
      valor_base: Math.round(valor_base / 1000) * 1000,
      coeficientes: {
        estado: coef_estado,
        cochera: coef_cochera,
        ambientes: coef_ambientes,
        amenities: coef_amenities,
      },
      valor_final,
      rango_min,
      rango_max,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error inesperado";

    return Response.json({ error: message }, { status: 500 });
  }
}