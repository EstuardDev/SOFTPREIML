document.addEventListener("DOMContentLoaded", () => {
  // 1. Constantes para los elementos DOM
  const hamBurger = document.querySelector(".toggle-btn");
  const sidebar = document.querySelector("#sidebar");
  const modeToggle = document.querySelector(".mode");
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const currentPath = window.location.pathname;

  /*// Obtener el botón del menú y las opciones
  const botonMenu = document.getElementById('boton-menu');
  const opcionesMenu = document.getElementById('opciones-menu');

  // Agregar evento de clic al botón del menú
  botonMenu.addEventListener('click', (e) => {
    // Prevenir el comportamiento predeterminado del enlace
    e.preventDefault();

    // Mostrar u ocultar las opciones del menú
    opcionesMenu.classList.toggle('mostrar-opciones');
  });

  // Agregar evento de clic a las opciones del menú
  opcionesMenu.addEventListener('click', (e) => {
    // Obtener el idioma seleccionado
    const idioma = e.target.getAttribute('data-idioma');

    // Realizamos la acción correspondiente al idioma seleccionado
    if (idioma === 'es') {
      console.log('Se seleccionó el idioma español');
    } else if (idioma === 'en') {
      console.log('Se seleccionó el idioma inglés');
    }
  });

  // Agregar clase para mostrar las opciones del menú
  opcionesMenu.classList.add('opciones-menu');

  // Agregar evento de clic fuera del menú para ocultar las opciones
  document.addEventListener('click', (e) => {
    if (!opcionesMenu.contains(e.target) && !botonMenu.contains(e.target)) {
      opcionesMenu.classList.remove('mostrar-opciones');
    }
  });*/

  // 2. Inicializa el tema (oscuro o claro) al cargar la página
  initializeTheme();

  // 3. Marca el ítem del sidebar que corresponde a la página actual
  activateSidebarItems();

  // 4. Agrega el evento para alternar el menú lateral cuando se hace clic en el botón
  hamBurger.addEventListener("click", toggleSidebar);

  // 5. Escucha el cambio de tema cuando el usuario hace clic en el botón
  modeToggle.addEventListener("click", toggleTheme);

  // Función para alternar el menú lateral
  function toggleSidebar() {
    sidebar.classList.toggle("expand");
  }

  // Función para aplicar la clase "active" en el ítem del sidebar según la URL actual
  function activateSidebarItems() {
    sidebarItems.forEach((item) => {
      const link = item.querySelector(".sidebar-link");

      if (link.getAttribute("href") === currentPath) {
        item.classList.add("active");
      }

      item.addEventListener("click", () => {
        clearActiveSidebarItems();
        item.classList.add("active");
      });
    });
  }

  // Limpia la clase "active" de todos los ítems del sidebar
  function clearActiveSidebarItems() {
    sidebarItems.forEach((i) => i.classList.remove("active"));
  }

  // Inicializa el tema almacenado o aplica el tema claro por defecto
  function initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || "theme-light";
    document.body.classList.add(savedTheme);
    updateThemeStyles(savedTheme);

    if (savedTheme === "theme-dark") {
      modeToggle.classList.add("active");
    }
  }

  // Cambia el tema y guarda la preferencia en localStorage
  function toggleTheme() {
    const isDarkMode = document.body.classList.contains("theme-dark");
    const newTheme = isDarkMode ? "theme-light" : "theme-dark";

    document.body.classList.replace(isDarkMode ? "theme-dark" : "theme-light", newTheme);
    localStorage.setItem("theme", newTheme);
    modeToggle.classList.toggle("active", newTheme === "theme-dark");

    updateThemeStyles(newTheme);
  }

  // Aplica los estilos de tema en los elementos del DOM
  function updateThemeStyles(theme) {
    const isDark = theme === "theme-dark";
    sidebar.classList.toggle("dark", isDark);
    document.querySelector(".navbar").classList.toggle("dark", isDark);
    // Puedes descomentar el siguiente código si el footer requiere del tema
    // document.querySelector(".footer").classList.toggle("dark", isDark);
  }
});
