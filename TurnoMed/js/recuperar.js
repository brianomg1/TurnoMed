document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recuperarForm');
  const mensaje = document.getElementById('mensaje');
  const botonEnviar = form.querySelector('button[type="submit"]');

  emailjs.init('rMQab5HcPKfJ0qbV1'); 

  function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function mostrarMensaje(texto, clase) {
    mensaje.textContent = texto;
    mensaje.className = clase;
    console.log('Mensaje:', texto, 'Clase:', clase);
  }

  function buscarUsuarioPorCorreo(correo) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    console.log('Usuarios cargados:', usuarios);
    const usuario = usuarios.find(u => u.correo === correo);
    console.log('Usuario encontrado:', usuario);
    return usuario;
  }

  function generarEnlace(rut) {
    const token = Date.now();
    const url = `https://tusitio.com/reset-password.html?rut=${encodeURIComponent(rut)}&token=${token}`;
    console.log('Enlace generado:', url);
    return url;
  }

  function enviarCorreo(templateParams) {
    console.log('Enviando correo con params:', templateParams);
    return emailjs.send('service_kojeeu4', 'template_t55laxh', templateParams);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    mostrarMensaje('', '');

    const correo = form.correoRecuperar.value.trim();
    console.log('Correo ingresado:', correo);

    if (!correo) {
      mostrarMensaje('Por favor, ingresa tu correo.', 'error-message');
      return;
    }

    if (!validarEmail(correo)) {
      mostrarMensaje('Correo con formato inválido.', 'error-message');
      return;
    }

    const usuario = buscarUsuarioPorCorreo(correo);
    if (!usuario) {
      mostrarMensaje('Correo no registrado.', 'error-message');
      return;
    }

    const enlace = generarEnlace(usuario.rut);
    const templateParams = {
      to_email: usuario.correo,
      reset_link: enlace
    };

    botonEnviar.disabled = true;
    botonEnviar.textContent = 'Enviando...';

    enviarCorreo(templateParams)
      .then(() => {
        console.log('Correo enviado correctamente');
        mostrarMensaje('Correo enviado. Revisa tu bandeja de entrada.', 'success-message');
        form.reset();
      })
      .catch(error => {
        console.error('Error al enviar con EmailJS:', error);
        mostrarMensaje('Error al enviar correo. Intenta nuevamente.', 'error-message');
      })
      .finally(() => {
        botonEnviar.disabled = false;
        botonEnviar.textContent = 'Enviar enlace de recuperación';
      });
  });
});
