// =================== PM10 – Mapa (solo 2 capas) ===================
// Analítica desde: Historico_anual_contaminante_PM10_recortado.geojson
// Polígono de referencia (transparente): barrios.geojson

// ------------------- Configuración -------------------
const URL_PM10    = "src/assets/Historico_anual_contaminante_PM10_recortado.geojson";
const URL_BARRIOS = "src/assets/barrios.geojson";

const FALLBACK_CENTER = [4.65, -74.1];
const FALLBACK_ZOOM   = 12;

// ------------------- Utilidades -------------------
const tryFetch = async (url) => {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn(`[PM10] No se pudo cargar: ${url} ->`, e.message);
    return null;
  }
};

// Paleta discreta (7 clases)
const ramp = (i) => ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"][i];

// ------------------- Mapa -------------------
const map = L.map("mapa-pm10", { zoomControl: true, preferCanvas: true });

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap", maxZoom: 19
}).addTo(map);

const layers = { pm10: null, barrios: null };

// ------------------- Leyenda -------------------
const buildLegend = (breaks) => {
  const cont = document.getElementById("leyenda-pm10");
  if (!cont) return;

  cont.innerHTML = `
    <strong>Leyenda PM10 (Valor)</strong>
    <div class="grad" id="grad"></div>
    <div class="rangos" id="rangos" style="margin-top:6px;"></div>
  `;

  const grad = cont.querySelector("#grad");
  const rangos = cont.querySelector("#rangos");
  grad.innerHTML = "";
  rangos.innerHTML = "";

  for (let i = 0; i < breaks.length - 1; i++) {
    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.background = ramp(i);
    grad.appendChild(sw);
  }

  const labels = [];
  for (let i = 0; i < breaks.length - 1; i++) {
    const a = breaks[i], b = breaks[i + 1];
    labels.push(`[${a.toFixed(1)} – ${b.toFixed(1)}]`);
  }
  rangos.textContent = labels.join("  ");
};

// ------------------- Carga y render -------------------
(async () => {
  const [pm10, barriosGeo] = await Promise.all([ tryFetch(URL_PM10), tryFetch(URL_BARRIOS) ]);

  // ----- Capa de referencia: Barrios (solo contorno, transparente) -----
  if (barriosGeo) {
    layers.barrios = L.geoJSON(barriosGeo, {
      style: { color: "#e61340ff", weight: 5, fillOpacity: 0 },
      onEachFeature: (f, layer) => {
        const p = f.properties || {};
        const nombreBarrio = p.locnombre ?? p.barrio ?? p.NOMBRE ?? p.Nombre ?? "Barrio";
        layer.bindTooltip(`<strong>${nombreBarrio}</strong>`, { sticky: true });
      }
    }).addTo(map);
  }

  // ----- PM10: coropleta por campo "Valor"; atributos: uplnombre (UPZ) y locnombre (Barrio) -----
  if (pm10) {
    // valores para clasificar
    const values = (pm10.features || [])
      .map(f => {
        const p = f.properties || {};
        const v = p.Valor ?? p.VALOR ?? p.valor ?? p.PM10 ?? p.pm10;
        return (v !== undefined && v !== null) ? Number(v) : NaN;
      })
      .filter(Number.isFinite);

    // cuantiles para 7 clases
    const breaks = (() => {
      if (values.length === 0) return [0,1,2,3,4,5,6,7];
      const s = [...values].sort((a,b)=>a-b);
      const q = (p) => {
        const idx = (s.length-1)*p, lo = Math.floor(idx), hi = Math.ceil(idx);
        return lo===hi ? s[lo] : s[lo] + (s[hi]-s[lo])*(idx-lo);
      };
      return [0,1/6,2/6,3/6,4/6,5/6,1].map(q);
    })();

    const classify = (v) => {
      for (let i=0; i<breaks.length-1; i++) if (v <= breaks[i+1]) return i;
      return breaks.length-2;
    };

    layers.pm10 = L.geoJSON(pm10, {
      style: f => {
        const p = f.properties || {};
        const v = Number(p.Valor ?? p.VALOR ?? p.valor ?? p.PM10 ?? p.pm10 ?? NaN);
        const cls = Number.isFinite(v) ? classify(v) : 0;
        return { color:"#1b5e20", weight:1, fillColor:ramp(cls), fillOpacity:0.65 };
      },
      onEachFeature: (f, layer) => {
        const p = f.properties || {};
        const upz    = p.uplnombre ?? "N/D";
        const barrio = p.locnombre ?? "N/D";
        const valor  = p.Valor ?? p.VALOR ?? p.valor ?? p.PM10 ?? p.pm10 ?? "N/D";

        const html = `
          <div><strong>Unidad de Planeamiento Zonal (UPZ):</strong> ${upz}</div>
          <div><strong>Barrio:</strong> ${barrio}</div>
          <div><strong>Valor PM10:</strong> ${valor}</div>
        `;
        layer.bindTooltip(html, { sticky:true, opacity:0.9 });
        layer.bindPopup(html);

        layer.on({
          mouseover: () => layer.setStyle({ weight: 2.5, color: "#4FC3F7" }),
          mouseout:  () => layer.setStyle({ weight: 1,   color: "#1b5e20" })
        });
      }
    }).addTo(map);

    buildLegend(breaks);
  }

  // ----- Control de capas -----
  const overlays = {};
  if (layers.pm10)   overlays["PM10 (concentración)"] = layers.pm10;
  if (layers.barrios)overlays["Polígonos – Barrios (ref.)"] = layers.barrios;
  L.control.layers({}, overlays, { collapsed:false, position:"topright" }).addTo(map);

  // ----- Encadre inicial -----
  if (layers.pm10) {
    map.fitBounds(layers.pm10.getBounds(), { padding: [4, 4] });
  } else {
    map.setView(FALLBACK_CENTER, FALLBACK_ZOOM);
  }
})();
