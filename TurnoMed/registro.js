document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const rut = document.getElementById("nuevoRut").value.trim();
    const password = document.getElementById("nuevoPassword").value.trim();
    const rol = document.getElementById("nuevoRol").value;
    const errorBox = document.getElementById("registroError");

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    if (usuarios.find(u => u.rut === rut)) {
      errorBox.textContent = "❌ Ese RUT ya está registrado.";
      return;
    }

    const nuevoUsuario = { rut, contraseña: password, rol };
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    errorBox.style.color = "green";
    errorBox.textContent = "✅ Usuario registrado exitosamente. Redirigiendo...";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  });
});
