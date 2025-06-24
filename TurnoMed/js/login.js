document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('error');
  const forgotLink = document.getElementById('forgotPassword');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const rut = form.rut.value.trim();
    const password = form.password.value.trim();

    let usuarios = [];
    try {
      usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      if (!Array.isArray(usuarios)) usuarios = [];
    } catch (e) {
      usuarios = [];
    }

    const usuario = usuarios.find(u => u.rut === rut);

    if (!usuario) {
      errorEl.style.color = 'red';
      errorEl.textContent = 'Usuario no encontrado.';
      return;
    }

    if (usuario.contrasena !== password) {
      errorEl.style.color = 'red';
      errorEl.textContent = 'Contraseña incorrecta.';
      return;
    }

    localStorage.setItem('rutUsuario', usuario.rut);
    localStorage.setItem('nombreUsuario', usuario.nombre);
    localStorage.setItem('rolUsuario', usuario.rol); 

    errorEl.style.color = 'green';
    errorEl.textContent = '¡Inicio de sesión correcto! Redirigiendo...';

    setTimeout(() => {
      if (usuario.rol === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'inicio.html';
      }
    }, 1500);
  });

  if (forgotLink) {
    forgotLink.addEventListener('click', e => {
      e.preventDefault();
      const rut = prompt('Ingresa tu RUT para recuperar tu cuenta:');
      if (!rut) return;

      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      if (!usuarios.find(u => u.rut === rut)) {
        alert('RUT no registrado.');
        return;
      }

      window.location.href = 'recuperar.html';
    });
  }
});
