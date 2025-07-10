document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetForm');
  const mensaje = document.getElementById('mensaje');

  const params = new URLSearchParams(window.location.search);
  const rut = params.get('rut');

  if (!rut) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'Enlace no válido. Falta el RUT.';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nueva = document.getElementById('nuevaPassword').value.trim();
    const confirmar = document.getElementById('confirmarPassword').value.trim();

    if (!nueva || !confirmar) {
      mostrarMensaje('Completa todos los campos.', 'red');
      return;
    }

    if (nueva !== confirmar) {
      mostrarMensaje('Las contraseñas no coinciden.', 'red');
      return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    const usuario = usuarios.find(u => u.rut === rut);
    if (!usuario) {
      mostrarMensaje('Usuario no encontrado.', 'red');
      return;
    }

    usuario.contrasena = nueva;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    mostrarMensaje('Contraseña actualizada correctamente. Ahora puedes iniciar sesión.', 'green');
    form.reset();
  });

  function mostrarMensaje(texto, color) {
    mensaje.textContent = texto;
    mensaje.style.color = color;
  }
});
