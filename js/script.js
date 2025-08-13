// Este script controla el comportamiento del menú desplegable de "Equipamiento".

// 1) Seleccionamos el contenedor del dropdown, su botón y el menú interno
const dropdown = document.querySelector('.dropdown');          // Contenedor principal del dropdown
const btn = dropdown?.querySelector('.dropbtn');               // Botón que abre/cierra el menú
const menu = dropdown?.querySelector('.dropdown-menu');        // Lista (<ul>) con los enlaces

// 2) Funciones utilitarias para abrir/cerrar el menú (agregan o quitan la clase .open)
function openMenu() {
  if (!dropdown || !btn) return;            // Seguridad por si no existe
  dropdown.classList.add('open');            // Muestra el menú vía CSS
  btn.setAttribute('aria-expanded', 'true'); // Actualiza estado accesible
}

function closeMenu() {
  if (!dropdown || !btn) return;            // Seguridad por si no existe
  dropdown.classList.remove('open');         // Oculta el menú vía CSS
  btn.setAttribute('aria-expanded', 'false');// Actualiza estado accesible
}

// 3) Alternar el menú al hacer clic en el botón
if (btn) {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();                     // Evita que el clic burbujee y cierre el menú
    const isOpen = dropdown.classList.contains('open');
    isOpen ? closeMenu() : openMenu();       // Abre si está cerrado, cierra si está abierto
  });
}

// 4) Cerrar el menú si se hace clic en cualquier parte fuera del dropdown
window.addEventListener('click', (e) => {
  if (!dropdown) return;                     // Seguridad
  if (!dropdown.contains(e.target)) {        // Si el clic NO fue dentro del dropdown
    closeMenu();                             // Cierra el menú
  }
});

// 5) Accesibilidad: controlar con teclado
if (btn && menu) {
  // a) En el botón: Enter o Espacio alternan el menú; Esc lo cierra
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();                    // Evita scroll con barra espaciadora
      const isOpen = dropdown.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
      if (!isOpen) {
        // Enfoca el primer enlace del submenú al abrir
        const firstLink = menu.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    } else if (e.key === 'Escape') {
      closeMenu();
      btn.focus();
    }
  });

  // b) Dentro del menú: Esc cierra y devuelve el foco al botón
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      btn.focus();
    }
  });
}
