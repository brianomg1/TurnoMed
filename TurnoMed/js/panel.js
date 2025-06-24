document.addEventListener('DOMContentLoaded', () => {
  const rut = localStorage.getItem("rutUsuario");
  const nombre = localStorage.getItem("nombreUsuario");
  const nombreEl = document.getElementById("nombreUsuarioActual");

  if (!rut || !nombre) {
    window.location.href = "login.html";
    return;
  }

  if (nombreEl) {
    nombreEl.textContent = `Hola, ${nombre}`;
  }
});

function cerrarSesion() {
  localStorage.removeItem("rutUsuario");
  localStorage.removeItem("nombreUsuario");
  localStorage.removeItem("turnos"); 
  window.location.href = "login.html";
}
