import { supabase } from "@/lib/supabase"

type CoefValue = string | number

async function getCoef(variable: string, valor: CoefValue) {
  const { data, error } = await supabase
    .from("coeficientes")
    .select("coeficiente")
    .eq("variable", variable)
    .eq("valor", String(valor))
    .single()

  if (error || !data) {
    throw new Error(`No se encontró coeficiente para ${variable}: ${valor}`)
  }

  return Number(data.coeficiente)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      barrio,
      tipo_propiedad,
      m2_cubiertos,
      estado,
      cochera,
      antiguedad,
      banos,
      amenities,
      categoria,
    } = body

    const { data: valorData, error: valorError } = await supabase
      .from("valores_m2")
      .select("valor_m2")
      .eq("barrio", barrio)
      .eq("tipo_propiedad", tipo_propiedad)
      .single()

    if (valorError || !valorData) {
      return Response.json(
        { error: "No se encontró valor_m2 para esa combinación." },
        { status: 400 }
      )
    }

    const valor_m2 = Number(valorData.valor_m2)
    const valor_base = valor_m2 * Number(m2_cubiertos)

    const coef_estado = await getCoef("estado", estado)
    const coef_cochera = await getCoef("cochera", cochera)
    const coef_antiguedad = await getCoef("antiguedad", antiguedad)
    const coef_banos = await getCoef("banos", banos)
    const coef_amenities = await getCoef("amenities", amenities)
    const coef_categoria = await getCoef("categoria", categoria)

    const valor_final = Math.round(
      valor_base *
        coef_estado *
        coef_cochera *
        coef_antiguedad *
        coef_banos *
        coef_amenities *
        coef_categoria
    )

    const rango_min = Math.round(valor_final * 0.95)
    const rango_max = Math.round(valor_final * 1.05)

    return Response.json({
      valor_m2,
      valor_base,
      coeficientes: {
        estado: coef_estado,
        cochera: coef_cochera,
        antiguedad: coef_antiguedad,
        banos: coef_banos,
        amenities: coef_amenities,
        categoria: coef_categoria,
      },
      valor_final,
      rango_min,
      rango_max,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error inesperado"

    return Response.json({ error: message }, { status: 500 })
  }
}