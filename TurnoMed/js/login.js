document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('error');
  const forgotLink = document.getElementById('forgotPassword');

  const adminPrivado = {
    rut: "12345678-9",
    contrasena: "admin123",
    nombre: "Administrador Privado",
    rol: "admin"
  };

  form.addEventListener('submit', e => {
    e.preventDefault();

    const rut = form.rut.value.trim();
    const password = form.password.value.trim();

    if (!rut || !password) {
      mostrarError('Por favor completa todos los campos.');
      return;
    }

    let usuarios = [];
    try {
      usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    } catch {
      usuarios = [];
    }

    const usuario = usuarios.find(u => u.rut === rut);

    if (!usuario) {
      if (rut === adminPrivado.rut && password === adminPrivado.contrasena) {
        guardarSesion(adminPrivado);
        mostrarExito('¡Inicio de sesión correcto! Redirigiendo...');
        redirigirPorRol(adminPrivado.rol);
      } else {
        mostrarError('Usuario no encontrado.');
      }
      return;
    }

    if (usuario.contrasena !== password) {
      mostrarError('Contraseña incorrecta.');
      return;
    }

    guardarSesion(usuario);
    mostrarExito('¡Inicio de sesión correcto! Redirigiendo...');
    redirigirPorRol(usuario.rol);
  });

  if (forgotLink) {
    forgotLink.addEventListener('click', e => {
      e.preventDefault();
      recuperarCuenta();
    });
  }

  function mostrarError(msg) {
    errorEl.style.color = 'red';
    errorEl.textContent = msg;
  }

  function mostrarExito(msg) {
    errorEl.style.color = 'green';
    errorEl.textContent = msg;
  }

  function guardarSesion(usuario) {
    localStorage.setItem('rutUsuario', usuario.rut);
    localStorage.setItem('nombreUsuario', usuario.nombre);
    localStorage.setItem('rolUsuario', usuario.rol);
  }

  function redirigirPorRol(rol) {
    setTimeout(() => {
      if (rol === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'inicio.html';
      }
    }, 1500);
  }

  function recuperarCuenta() {
    const rut = prompt('Ingresa tu RUT para recuperar tu cuenta:');
    if (!rut) return;

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const existe = usuarios.find(u => u.rut === rut);

    if (!existe) {
      alert('RUT no registrado.');
      return;
    }

    sessionStorage.setItem('rutRecuperar', rut);
    window.location.href = 'recuperar.html';
  }
});
