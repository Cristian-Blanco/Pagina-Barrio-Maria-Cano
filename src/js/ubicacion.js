// Coordenadas aproximadas del Barrio María Cano en Ciudad Bolívar, Bogotá
const barrioCoords = [4.5484, -74.1622]; 

// Inicializar el mapa
const map = L.map("map").setView(barrioCoords, 16);

// Cargar mapa base
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Crear marcador con popup
const marker = L.marker(barrioCoords).addTo(map);

// Contenido del popup (se muestra al pasar el mouse)
const popupContent = `
  <h3>Barrio María Cano</h3>
  <p><b>Localidad:</b> Ciudad Bolívar</p>
  <p><b>Coordenadas:</b> ${barrioCoords[0].toFixed(4)}, ${barrioCoords[1].toFixed(4)}</p>
  <img src="https://i.imgur.com/YpQ0B6U.jpg" alt="Barrio María Cano">
`;

// Evento para que el popup aparezca al pasar el mouse
marker.bindPopup(popupContent);

marker.on("mouseover", function () {
  marker.openPopup();
});
marker.on("mouseout", function () {
  marker.closePopup();
});