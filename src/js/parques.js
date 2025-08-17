// ---- Config ----
const IMG_BASE   = './src/assets/img/';
const BARRIOS_URL = 'src/assets/barrios.geojson';
const PARQUES_URL = 'src/assets/parques.geojson';

// ---- Mapa ----
const map = L.map('map', { zoomControl: true });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// Estilos capa
const barrioStyle      = { color:'#2563eb', weight:2, fillOpacity:0 };
const parqueStyle      = { color:'#065f46', weight:1, fillColor:'#a7f3d0', fillOpacity:.55 };
const parqueHoverStyle = { color:'#059669', weight:3, fillOpacity:.75 };

// Panel
const detailsEl = document.getElementById('details');
const hintEl    = document.getElementById('hint');
let parquesLayer, lockedLayer = null;

function renderDetails(props){
  const nombre  = props.NOMBRE || props.NOMBRE_PAR || 'Parque sin nombre';
  const tipop   = props.TIPOPARQUE || '';
  const estrato = props.ESTRATO || '';
  const area    = (typeof props.SHAPE_AREA === 'number') ? Math.round(props.SHAPE_AREA) + ' m²' : '—';
  const imgSrc  = props.IMAGEN ? (IMG_BASE + props.IMAGEN) : null;

  hintEl.style.display = 'none';

  let html = `
    <h3 class="p-title">${nombre}</h3>
    <div class="badges">
      ${tipop ? `<span class="badge">${tipop}</span>` : ''}
      ${estrato ? `<span class="badge">Estrato ${estrato}</span>` : ''}
      <span class="badge">Área: ${area}</span>
    </div>
  `;
  if (imgSrc) html += `<img class="park-img" alt="Imagen de ${nombre}" src="${imgSrc}">`;
  html += props.DESCRIPCION ? `<div class="desc">${props.DESCRIPCION}</div>` : `<p class="muted">Sin descripción.</p>`;

  detailsEl.classList.remove('muted');
  detailsEl.innerHTML = html;
}

function clearDetails(){
  hintEl.style.display = '';
  detailsEl.classList.add('muted');
  detailsEl.innerHTML = 'Sin selección.';
}

// Barrios (para fitBounds)
fetch(BARRIOS_URL)
  .then(r => r.json())
  .then(data => {
    const layer = L.geoJSON(data, { style: barrioStyle }).addTo(map);
    map.fitBounds(layer.getBounds(), { padding:[16,16] });
  });

// Parques
fetch(PARQUES_URL)
  .then(r => r.json())
  .then(data => {
    parquesLayer = L.geoJSON(data, {
      style: parqueStyle,
      onEachFeature: (feature, layer) => {
        const nombre = feature.properties?.NOMBRE || feature.properties?.NOMBRE_PAR || 'Parque';
        layer.bindTooltip(nombre, { sticky:true });

        layer.on('mouseover', () => {
          if (lockedLayer && lockedLayer !== layer) return;
          layer.setStyle(parqueHoverStyle);
          renderDetails(feature.properties || {});
          layer.bringToFront && layer.bringToFront();
        });

        layer.on('mouseout', () => {
          if (lockedLayer && lockedLayer !== layer) return;
          parquesLayer.resetStyle(layer);
          if (!lockedLayer) clearDetails();
        });

        layer.on('click', () => {
          if (lockedLayer && lockedLayer !== layer){
            parquesLayer.resetStyle(lockedLayer);
            lockedLayer = null;
          }
          if (lockedLayer === layer){
            parquesLayer.resetStyle(layer);
            lockedLayer = null;
            clearDetails();
          } else {
            layer.setStyle(parqueHoverStyle);
            lockedLayer = layer;
            renderDetails(feature.properties || {});
            map.fitBounds(layer.getBounds(), { padding:[16,16] });
          }
        });
      }
    }).addTo(map);
  })
  .catch(err => console.error('Error cargando parques:', err));