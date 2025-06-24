document.addEventListener('DOMContentLoaded', () => {
  const btnGenerar = document.getElementById('btnGenerar');
  const seccionEnlace = document.getElementById('seccionEnlace');
  const enlaceInput = document.getElementById('enlaceGenerado');
  const correosInput = document.getElementById('correos');
  const btnEnviar = document.getElementById('btnEnviar');
  const mensajeAccesos = document.getElementById('mensajeAccesos');
  const expiracion = document.getElementById('expiracion');

  let accesosRestantes = 3;
  let tiempoExpiracion = null;

  function generarEnlace() {
    const token = Math.random().toString(36).substr(2, 10);
    const enlace = `https://turnomed.cl/turnos/${token}`;
    enlaceInput.value = enlace;

    tiempoExpiracion = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas
    actualizarExpiracion();
    seccionEnlace.classList.remove('oculto');
    mensajeAccesos.textContent = `Accesos restantes: ${accesosRestantes} de 3`;
  }

  function actualizarExpiracion() {
    if (!tiempoExpiracion) return;

    const ahora = new Date();
    const diferencia = tiempoExpiracion - ahora;

    if (diferencia <= 0) {
      expiracion.textContent = "Enlace expirado.";
      enlaceInput.value = "";
      btnEnviar.disabled = true;
    } else {
      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      expiracion.textContent = `Expira en: ${horas}h ${minutos}min`;
    }
  }

  function validarCorreos(correosTexto) {
    const lista = correosTexto.split(',').map(c => c.trim()).filter(c => c !== "");
    if (lista.length > 3) {
      alert("Solo se permite compartir con un máximo de 3 personas.");
      return false;
    }
    return lista.every(correo => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo));
  }

  btnGenerar.addEventListener('click', () => {
    generarEnlace();
  });

  btnEnviar.addEventListener('click', () => {
    const correosTexto = correosInput.value;

    if (!validarCorreos(correosTexto)) {
      alert("Por favor ingresa hasta 3 correos válidos separados por coma.");
      return;
    }

    if (accesosRestantes <= 0) {
      alert("Límite de acceso alcanzado.");
      return;
    }

    accesosRestantes--;
    mensajeAccesos.textContent = `Accesos restantes: ${accesosRestantes} de 3`;

    alert("Enlace enviado correctamente a los correos especificados.");
    correosInput.value = "";

    if (accesosRestantes === 0) {
      btnEnviar.disabled = true;
    }
  });

  setInterval(actualizarExpiracion, 60000);
});
