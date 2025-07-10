document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorEl = document.getElementById('error');
  const rolLabel = document.querySelector('label[for="rol"]');
  const rolSelect = document.getElementById('rol');

  const rolUsuario = localStorage.getItem('rolUsuario');
  if (rolUsuario === 'admin') {
    rolLabel.style.display = 'block';
    rolSelect.style.display = 'block';
    rolSelect.setAttribute('required', '');
  } else {
    rolLabel.style.display = 'none';
    rolSelect.style.display = 'none';
    rolSelect.removeAttribute('required');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    const rut = form.rut.value.trim();
    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const password = form.password.value.trim();
    const password2 = form.password2.value.trim();

    const rol = rolSelect.style.display === 'block' ? rolSelect.value : 'empleado';

    if (!rut || !nombre || !correo || !password || !password2 || (rolSelect.style.display === 'block' && !rol)) {
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
    } catch {
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
      rol
    });

    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    errorEl.style.color = 'green';
    errorEl.textContent = 'Registro exitoso. Redirigiendo al login...';

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  });
});
