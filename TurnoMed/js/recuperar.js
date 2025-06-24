document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recuperarForm');
  const mensaje = document.getElementById('mensaje');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const rut = form.rutRecuperar.value.trim();

    if (!rut) {
      mensaje.style.color = 'red';
      mensaje.textContent = 'Por favor, ingresa tu RUT.';
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};

    if (!usuarios[rut]) {
      mensaje.style.color = 'red';
      mensaje.textContent = 'El RUT no está registrado.';
      return;
    }

    sessionStorage.setItem('rutRecuperar', rut);

    mensaje.style.color = 'green';
    mensaje.textContent = 'Enlace de recuperación enviado. Revisa tu correo.';

    setTimeout(() => {
      window.location.href = 'recuperar-exito.html'; 
    }, 2000);
  });
});
