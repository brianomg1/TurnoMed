document.addEventListener('DOMContentLoaded', () => {
  const rol = localStorage.getItem('rolUsuario');
  const nombre = localStorage.getItem('nombreUsuario');

  if (rol !== 'admin') {
    alert('Acceso denegado: no eres administrador.');
    window.location.href = 'login.html';
    return;
  }

  console.log(`Bienvenido admin: ${nombre}`);

  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const titulo = card.querySelector('h2').textContent;
      alert(`Has seleccionado: ${titulo}`);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
});

function cerrarSesion() {
  localStorage.removeItem('rutUsuario');
  localStorage.removeItem('nombreUsuario');
  localStorage.removeItem('rolUsuario');
  window.location.href = 'login.html';
}
