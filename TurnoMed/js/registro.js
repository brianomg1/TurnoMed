document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorEl = document.getElementById('error');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const rut = form.rut.value.trim();
    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const password = form.password.value.trim();
    const password2 = form.password2.value.trim();

    if (!rut || !nombre || !correo || !password || !password2) {
      errorEl.style.color = 'red';
      errorEl.textContent = 'Por favor completa todos los campos.';
      return;
    }

    if (password !== password2) {
      errorEl.style.color = 'red';
      errorEl.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    let usuarios = [];
    try {
      usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      if (!Array.isArray(usuarios)) usuarios = [];
    } catch (e) {
      usuarios = [];
    }

    if (usuarios.some(u => u.rut === rut)) {
      errorEl.style.color = 'red';
      errorEl.textContent = 'Este RUT ya está registrado.';
      return;
    }

    usuarios.push({
      rut,
      nombre,
      correo,
      contrasena: password,
      cargo: 'No asignado',
      area: 'No asignado',
      rol: 'empleado'
    });

    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    errorEl.style.color = 'green';
    errorEl.textContent = 'Registro exitoso. Redirigiendo...';

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  });
});
