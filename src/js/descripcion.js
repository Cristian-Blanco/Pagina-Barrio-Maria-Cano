// Opcional: marca el menú "Equipamiento" como cerrado al cargar
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".dropbtn");
  if (btn) btn.setAttribute("aria-expanded", "false");
});
