document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const rut = document.getElementById("rut").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorBox = document.getElementById("loginError");

    // Leer usuarios desde localStorage (donde los guarda registro.js)
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    const usuario = usuarios.find(u => u.rut === rut && u.contraseña === password);

    if (usuario) {
      sessionStorage.setItem("usuarioActivo", JSON.stringify(usuario));

      if (usuario.rol === "coordinador") {
        window.location.href = "coordinador.html";
      } else if (usuario.rol === "funcionario") {
        window.location.href = "funcionario.html";
      } else if (usuario.rol === "admin") {
        window.location.href = "gestionUsuario.html";
      }
    } else {
      errorBox.style.display = "block";
    }
  });
});
