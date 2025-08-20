# Página del Barrio María Cano

Esta es la versión de la web estática del **Barrio María Cano**, desplegada con **GitHub Pages**.


##  Detalles Básicos

- **HTML en la raíz**: archivos como *index.html*, *parques.html*, etc., que muestran distintas partes del contenido del sitio.
- **Toda la lógica y estilos organizados en `src/`**:
  - **`assets/`** contiene los datos geoespaciales (`.geojson`) y las imágenes.
  - **`css/`** agrupa estilos específicos por sección (parques, movilidad, problemas…) además de un `styles.css` general.
  - **`js/`** contiene los scripts relacionados con la funcionalidad de cada sección (por ejemplo, `parques.js` para el mapa de parques, `pm10.js` para contaminación, etc.).
- **`catastro3d.html`**: la única página que utiliza una clave de API (API key) para cargar el contenido de Cesium.js


## CLonar projecto

### Instalación (modo hipster técnico)
```bash
git clone https://github.com/tu_usuario/Pagina-Barrio-Maria-Cano.git

cd Pagina-Barrio-Maria-Cano
```

internamente ya puedes visualizarlo con ***live server***