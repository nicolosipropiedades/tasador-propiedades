"use client";

import { useEffect, useState } from "react";

type Resultado = {
  valor_m2: number;
  valor_base: number;
  valor_final: number;
  rango_min: number;
  rango_max: number;
};

function limpiarTelefono(valor: string) {
  return valor.replace(/\D/g, "");
}

function esWhatsappValido(valor: string) {
  const limpio = limpiarTelefono(valor);
  return limpio.length >= 10 && limpio.length <= 13;
}

export default function Home() {
  const [barrios, setBarrios] = useState<string[]>([]);
  const [paso, setPaso] = useState(1);

  const [form, setForm] = useState({
    nombre: "",
    codigo_area: "",
    numero: "",
    intencion_venta: "",
    barrio: "",
    tipo_propiedad: "",
    m2_cubiertos: "",
    ambientes: "",
    banos: "",
    cochera: "",
    antiguedad: "",
    estado: "",
    amenities: "",
    categoria: "",
  });

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  async function cargarBarrios() {
    const res = await fetch("/api/barrios");
    const data = await res.json();
    setBarrios(data);
  }

  cargarBarrios();
}, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    if (name === "celular") {
      setForm((prev) => ({ ...prev, [name]: limpiarTelefono(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function calcularTasacion(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResultado(null);

    try {
      const res = await fetch("/api/valuar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          m2_cubiertos: Number(form.m2_cubiertos),
        }),
      });

      const data = await res.json();

if (!res.ok) {
  setError(data.error || "Error al calcular");
  return;
}

setResultado({
  ...data,
  valor_base: Math.round(data.valor_base / 1000) * 1000,
  valor_final: Math.round(data.valor_final / 1000) * 1000,
  rango_min: Math.round(data.rango_min / 1000) * 1000,
  rango_max: Math.round(data.rango_max / 1000) * 1000,
});

setPaso(2);
    } catch {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function capturarLeadYMostrarResultado() {
    if (!resultado) return;

    if (!form.nombre.trim() || !form.codigo_area.trim() || !form.numero.trim()) {
  setError("Completá nombre y WhatsApp para continuar.");
  return;
}

    if (!form.codigo_area || !form.numero) {
  setError("Ingresá un número de WhatsApp válido");
  return;
}

    setError("");

    const res = await fetch("/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        celular: `549${form.codigo_area}${form.numero}`,
        m2_cubiertos: Number(form.m2_cubiertos),
        valor_final: resultado.valor_final,
        rango_min: resultado.rango_min,
        rango_max: resultado.rango_max,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "No se pudo guardar el lead.");
      return;
    }

    setPaso(3);
  }

  function hablarPorWhatsApp() {
    if (!resultado) return;

    const mensaje = `Hola, soy *${form.nombre}.*
Acabo de tasar una propiedad en ${form.barrio}.
Intención de venta: ${form.intencion_venta}.

- Valor base: USD ${resultado.valor_base.toLocaleString("es-AR")}
- Valor de venta estimado: USD ${resultado.valor_final.toLocaleString("es-AR")}
- Rango mínimo: USD ${resultado.rango_min.toLocaleString("es-AR")}
- Rango máximo: USD ${resultado.rango_max.toLocaleString("es-AR")}

*Quiero coordinar una tasación profesional.*`;

    const telefonoDestino = "5491151560959";
    const url = `https://wa.me/${telefonoDestino}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank");
  }

  return (
  <main
  style={{
    minHeight: "100vh",
    backgroundImage: "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('/fondo.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    padding: "12px",
  }}
  
>
    <div
  style={{
    width: "100%",
    maxWidth: 720,
    margin: "20px auto",
    background: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    padding: "24px 16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    boxSizing: "border-box",
  }}
>
  
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
  }}
>
  <img
  src="/logo.png"
  alt="Nicolosi Propiedades"
  style={{
    height: 100,
    objectFit: "contain",
    maxWidth: "100%",
  }}
/>

</div>
        <h1
  style={{
    marginTop: 0,
    marginBottom: 10,
    color: "#19283F",
    fontWeight: "700",
    fontSize: "32px",
    lineHeight: 1.15,
    textAlign: "center",
  }}
>
  Conocé cuánto vale tu propiedad
</h1>

<p
  style={{
    marginTop: 8,
    color: "#5b6577",
    fontSize: 14,
    lineHeight: 1.4,
    textAlign: "center",
  }}
>
  Obtené una tasación estimada y asesoramiento profesional en segundos
</p>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
    marginBottom: 18,
    fontSize: 13,
    color: "#19283F",
    fontWeight: 600,
    lineHeight: 1.4,
  }}
>
  <span><span style={{ color: "#25D366" }}>✔</span> Tasación gratuita</span>
  <span><span style={{ color: "#25D366" }}>✔</span> Sin compromiso</span>
  <span><span style={{ color: "#25D366" }}>✔</span> Respuesta inmediata</span>


</div>

</div>

      {paso === 1 && (
        <form
          onSubmit={calcularTasacion}
          style={{ display: "grid", gap: 12, marginTop: 24 }}
        >
          <label>
           <span style={{ fontWeight: "700" }}>Barrio</span>
            <select
              name="barrio"
              value={form.barrio || ""}
              onChange={handleChange}
              required
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid #d6dbe4",
                fontSize: 15,
                background: "#fff",
              boxSizing: "border-box",
            }}
            >
              
              <option value="">Seleccionar</option>

{[...barrios]
  .sort((a, b) => a.localeCompare(b, "es"))
  .map((barrio) => (
    <option key={barrio} value={barrio}>
      {barrio}
    </option>
))}
            </select>
          </label>

          <div>
  <span
    style={{
      fontWeight: "700",
      display: "block",
      marginBottom: 8,
    }}
  >
    Tipo de propiedad
  </span>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 12,
    }}
  >
    {[
      { value: "Depto", icon: "🏢" },
      { value: "Casa", icon: "🏠" },
      { value: "PH", icon: "🏘️" },
    ].map((item) => {
      const selected = form.tipo_propiedad === item.value;

      return (
        <button
          key={item.value}
          type="button"
          onClick={() =>
            setForm((prev) => ({ ...prev, tipo_propiedad: item.value }))
          }
          style={{
            border: selected ? "2px solid #2f64e1" : "1px solid #d6dbe4",
            background: selected ? "#2f64e1" : "#ffffff",
            color: selected ? "#ffffff" : "#19283F",
            borderRadius: 0,
            padding: "20px 10px",
            minHeight: 110,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxSizing: "border-box",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: 30, lineHeight: 1 }}>{item.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{item.value}</span>
        </button>
      );
    })}
  </div>
</div>

          <label>
           <span style={{ fontWeight: "700" }}>M2 cubiertos</span>
            <input
              name="m2_cubiertos"
              type="number"
              value={form.m2_cubiertos}
              onChange={handleChange}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid #d6dbe4",
                fontSize: 15,
                background: "#fff",
                boxSizing: "border-box",
              }}
            />
          </label>

          <div>
  <span
    style={{
      fontWeight: "700",
      display: "block",
      marginBottom: 8,
    }}
  >
    Ambientes
  </span>

  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      border: "1px solid #d6dbe4",
      borderRadius: 0,
      overflow: "hidden",
      background: "#fff",
    }}
  >
    <button
      type="button"
      onClick={() =>
        setForm((prev) => ({
          ...prev,
          ambientes: String(Math.max(1, Number(prev.ambientes || 1) - 1)),
        }))
      }
      style={{
        width: 48,
        height: 40,
        border: "none",
        background: "#2f64e1",
        color: "#fff",
        fontSize: 24,
        cursor: "pointer",
      }}
    >
      −
    </button>

    <div
      style={{
        minWidth: 60,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        fontWeight: 700,
        color: "#19283F",
        background: "#fff",
      }}
    >
      {form.ambientes || "1"}
    </div>

    <button
      type="button"
      onClick={() =>
        setForm((prev) => ({
          ...prev,
          ambientes: String(Number(prev.ambientes || 1) + 1),
        }))
      }
      style={{
        width: 48,
        height: 40,
        border: "none",
        background: "#2f64e1",
        color: "#fff",
        fontSize: 24,
        cursor: "pointer",
      }}
    >
      +
    </button>
  </div>
</div>

          <label>
            <span style={{ fontWeight: "700" }}>Baños</span>
            <select
              name="banos"
              value={form.banos}
              onChange={handleChange}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid #d6dbe4",
                fontSize: 15,
                background: "#fff",
                boxSizing: "border-box",
              }}
            ><option value="">Seleccionar</option>
              <option>1</option>
              <option>2</option>
              <option>3 o más</option>
            </select>
          </label>

          <div>
  <span
    style={{
      fontWeight: "700",
      display: "block",
      marginBottom: 8,
    }}
  >
    Cochera
  </span>

  <div
    style={{
      display: "inline-flex",
      border: "1px solid #d6dbe4",
      borderRadius: 0,
      overflow: "hidden",
      background: "#fff",
    }}
  >
    <button
      type="button"
      onClick={() =>
        setForm((prev) => ({ ...prev, cochera: "No" }))
      }
      style={{
        minWidth: 70,
        height: 40,
        border: "none",
        background: form.cochera === "No" ? "#2f64e1" : "#fff",
        color: form.cochera === "No" ? "#fff" : "#19283F",
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        padding: "0 18px",
      }}
    >
      No
    </button>

    <button
      type="button"
      onClick={() =>
        setForm((prev) => ({ ...prev, cochera: "Sí" }))
      }
      style={{
        minWidth: 70,
        height: 40,
        border: "none",
        background: form.cochera === "Sí" ? "#2f64e1" : "#fff",
        color: form.cochera === "Sí" ? "#fff" : "#19283F",
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        padding: "0 18px",
        borderLeft: "1px solid #d6dbe4",
      }}
    >
      Sí
    </button>
  </div>
</div>

          <label>
            <span style={{ fontWeight: "700" }}>Antigüedad</span>
            <select
              name="antiguedad"
              value={form.antiguedad}
              onChange={handleChange}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid #d6dbe4",
                fontSize: 15,
                background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="">Seleccionar</option>
              <option>0-10 años</option>
              <option>11-20 años</option>
              <option>21-30 años</option>
              <option>31-50 años</option>
              <option>50+ años</option>
            </select>
          </label>

          <label>
            <span style={{ fontWeight: "700" }}>Estado</span>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid #d6dbe4",
                fontSize: 15,
                background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="">Seleccionar</option>
              <option>A refaccionar</option>
              <option>Bueno</option>
              <option>Muy bueno</option>
              <option>Excelente</option>
            </select>
          </label>

          <label>
            <span style={{ fontWeight: "700" }}>Amenities</span>
            <select
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid #d6dbe4",
                fontSize: 15,
                background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="">Seleccionar</option>
              <option>Ninguno</option>
              <option>Básicos (sum, parrilla)</option>
              <option>Completos (piscina, seguridad, gym)</option>
            </select>
          </label>

          <label>
            <span style={{ fontWeight: "700" }}>Categoría</span>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid #d6dbe4",
                fontSize: 15,
                background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="">Seleccionar</option>
              <option>Estándar (a reciclar o con mejoras)</option>
              <option>Buena (buen estado, lista para habitar)</option> 
              <option>Destacada (reciclada o con calidad superior)</option>
              <option>Premium (alta gama y terminaciones de lujo)</option>
            </select>
          </label>

          <button
  type="submit"
  style={{
    marginTop: 18,
    width: "100%",
    padding: 14,
    borderRadius: 10,
    border: "none",
    background: "#19283F",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  }}
>
            {loading ? "Calculando..." : "Calcular tasación"}
          </button>
        </form>
      )}

      {paso === 2 && resultado && (
        <div style={{ marginTop: 30 }}>
          <h2 style={{ color: "#19283F", marginBottom: 8 }}>
            Completá todos los campos para conocer el valor estimado de tu propiedad. 
            
          </h2>

          <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
            <label>
              <span style={{ fontWeight: "700" }}>Nombre</span>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                style={{
                  display: "block",
                  width: "100%",
                  padding: 12,
                  marginTop: 6,
                  borderRadius: 10,
                  border: "1px solid #d6dbe4",
                  fontSize: 15,
                  background: "#fff",
                  boxSizing: "border-box",
                }}
              />
              
            </label>

            <label>
  <span style={{ fontWeight: "700" }}>WhatsApp</span>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 10,
      marginTop: 6,
    }}
  >
    <span
      style={{
        fontWeight: 600,
        color: "#19283F",
        minWidth: 50,
      }}
    >
      +549
    </span>

    <input
      name="codigo_area"
      value={form.codigo_area || ""}
      onChange={handleChange}
      placeholder="Ej: 11"
      inputMode="numeric"
      maxLength={4}
      style={{
        width: "100%",
        maxWidth: 110,
        padding: 12,
        borderRadius: 10,
        border: "1px solid #d6dbe4",
        fontSize: 15,
        background: "#fff",
        textAlign: "center",
        boxSizing: "border-box",
        flex: "1 1 90px",
      }}
    />

    <input
      name="numero"
      value={form.numero || ""}
      onChange={handleChange}
      placeholder="Sin 15"
      inputMode="numeric"
      maxLength={8}
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 10,
        border: "1px solid #d6dbe4",
        fontSize: 15,
        background: "#fff",
        boxSizing: "border-box",
        flex: "2 1 180px",
      }}
    />
  </div>
</label>

            <label>
  <span style={{ fontWeight: "700" }}>Intención de venta</span>
  <select
    name="intencion_venta"
    value={form.intencion_venta}
    onChange={handleChange}
    style={{
      display: "block",
      width: "100%",
      padding: 12,
      marginTop: 6,
      borderRadius: 10,
      border: "1px solid #d6dbe4",
      fontSize: 15,
      background: "#fff",
      boxSizing: "border-box",
    }}
  >
    <option value="">Seleccionar</option>
    <option value="Tengo decidido vender ahora">
      Tengo decidido vender ahora
    </option>
    <option value="Quiero publicar en 3 meses">
      Quiero vender en 3 meses aprox.
    </option>
    <option value="Quiero publicar en 6 meses">
      Quiero vender en 6 meses aprox.
    </option>
    <option value="Lo estoy analizando">
      Lo estoy analizando
    </option>
  </select>
</label>

            <button
              type="button"
              style={{
                padding: 14,
                borderRadius: 10,
                border: "none",
                background: "#19283F",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 8,
              }}
              onClick={capturarLeadYMostrarResultado}
            >
              Ver resultado
            </button>
          </div>
        </div>
      )}

      {paso === 3 && resultado && (
        <div style={{ marginTop: 30 }}>
          <h2 style={{ color: "#19283F", marginBottom: 16 }}>
            Resultado de tu tasación
          </h2>

          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 20,
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e5eaf1",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <strong style={{ color: "#19283F" }}>Valor base</strong>
              <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>
                USD {resultado.valor_base.toLocaleString("es-AR")}
              </div>
            </div>

            <div
              style={{
                background: "#eef4ff",
                border: "1px solid #d2def5",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <strong style={{ color: "#19283F" }}>Valor de venta estimado</strong>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#19283F",
                }}
              >
                USD {resultado.valor_final.toLocaleString("es-AR")}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e5eaf1",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <strong>Rango mínimo</strong>
                <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700 }}>
                  USD {resultado.rango_min.toLocaleString("es-AR")}
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #dce0e6",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <strong>Rango máximo</strong>
                <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700 }}>
                  USD {resultado.rango_max.toLocaleString("es-AR")}
                </div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 20, color: "#5b6577", lineHeight: 1.5 }}>
            Este valor es una estimación automática basada en datos del mercado.
            Podemos coordinar una tasación profesional sin costo para mayor precisión.
          </p>

          <button
  type="button"
  onClick={hablarPorWhatsApp}
  style={{
    marginTop: 20,
    marginLeft: "auto",
    marginRight: "auto",
    display: "block",
    width: "65%",
    padding: 16,
    borderRadius: 12,
    border: "none",
    background: "#25D366",
    color: "#fff",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
    transition: "all 0.2s ease",
  }}
  onMouseEnter={(e) => {
  e.currentTarget.style.transform = "scale(1.05)";
  e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)";
}}
>
  Quiero hablar por WhatsApp
</button>

        </div>
      )}

      {error && <p style={{ color: "red", marginTop: 20 }}>{error}</p>}
    </div>

    <div
      style={{
        textAlign: "center",
        marginTop: 16,
        marginBottom: 8,
        color: "#ffffff",
        fontSize: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
          marginBottom: 8,
        }}
      >
        <a
  href="https://instagram.com/nicolosipropiedades"
  target="_blank"
  rel="noopener noreferrer"
  style={{ display: "flex", alignItems: "center" }}
>
  <img
    src="/iconoig.png"
    alt="Instagram Nicolosi Propiedades"
    style={{
      height: 20,
      width: 20,
      objectFit: "contain",
    }}
  />
</a>

        <a
          href="mailto:nicolosipropiedades@gmail.com"
          style={{ color: "#ffffff", fontSize: 18, textDecoration: "none" }}
          aria-label="Enviar email a Nicolosi Propiedades"
        >
          ✉️
        </a>
      </div>

      <div style={{ opacity: 0.9 }}>
        © 2026 Nicolosi Propiedades
      </div>
    </div>
  </main>
);
      }
