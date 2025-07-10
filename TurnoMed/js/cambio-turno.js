document.addEventListener('DOMContentLoaded', () => {
  const nombreUsuarioActual = document.getElementById('nombreUsuarioActual');
  const usuarioActivo = JSON.parse(sessionStorage.getItem('usuarioActivo'));

  if (usuarioActivo && usuarioActivo.nombre) {
    nombreUsuarioActual.textContent = usuarioActivo.nombre;
  } else {
    nombreUsuarioActual.textContent = 'Invitado';
   
  }

  const listaTurnos = document.getElementById('listaTurnos');
  const formSeccion = document.getElementById('formSeccion');
  const formCambio = document.getElementById('formCambio');
  const mensajeRespuesta = document.getElementById('mensajeRespuesta');
  const cancelarBtn = document.getElementById('cancelarBtn');

  let turnoSeleccionado = null;

  function mostrarNotificacionesCambios() {
    const cambios = JSON.parse(localStorage.getItem('cambiosPropuestos')) || [];
    const ahora = new Date();

    const decisionesNuevas = cambios.filter(cambio =>
      usuarioActivo &&
      cambio.rutFuncionario === usuarioActivo.rut &&
      cambio.estado !== 'Pendiente' &&
      !cambio.leido &&
      (ahora - new Date(cambio.fechaSolicitud)) / (1000 * 60 * 60) <= 24
    );

    decisionesNuevas.forEach(cambio => {
      alert(`Tu solicitud de cambio de turno del ${new Date(cambio.fechaSolicitud).toLocaleDateString()} fue: ${cambio.estado}`);
      cambio.leido = true;
    });

    if (decisionesNuevas.length > 0) {
      localStorage.setItem('cambiosPropuestos', JSON.stringify(cambios));
    }
  }

  function mostrarTurnosProximos5Dias() {
    if (!usuarioActivo) {
      listaTurnos.innerHTML = '<li class="list-group-item text-danger">Debe iniciar sesión para ver sus turnos.</li>';
      return;
    }

    const turnos = JSON.parse(localStorage.getItem('turnosAsignados')) || [];
    const hoy = new Date();
    const limite = new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000);

    const turnosFiltrados = turnos.filter(t => {
      const inicio = new Date(t.fechaInicio);
      return (
        t.rutFuncionario === usuarioActivo.rut &&
        inicio >= hoy &&
        inicio <= limite
      );
    });

    listaTurnos.innerHTML = '';

    if (turnosFiltrados.length === 0) {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = 'No tienes turnos asignados en los próximos 5 días.';
      listaTurnos.appendChild(li);
      return;
    }

    turnosFiltrados.forEach(t => {
      const li = document.createElement('li');
      li.className = 'list-group-item list-group-item-action';
      const inicio = new Date(t.fechaInicio);
      const fin = new Date(t.fechaFin);
      li.textContent = `${inicio.toLocaleString()} - ${fin.toLocaleTimeString()}`;
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        turnoSeleccionado = t;
        mostrarFormularioCambio(t);
      });
      listaTurnos.appendChild(li);
    });
  }

  function mostrarFormularioCambio(turno) {
    formSeccion.style.display = 'block';
    mensajeRespuesta.textContent = '';
    mensajeRespuesta.className = '';

    formCambio.reset();

    const fechaInicio = new Date(turno.fechaInicio);
    document.getElementById('nuevaFecha').value = fechaInicio.toISOString().split('T')[0];
    document.getElementById('nuevaHoraInicio').value = fechaInicio.toTimeString().slice(0, 5);
    const fechaFin = new Date(turno.fechaFin);
    document.getElementById('nuevaHoraFin').value = fechaFin.toTimeString().slice(0, 5);

    formSeccion.scrollIntoView({ behavior: 'smooth' });
  }

  cancelarBtn.addEventListener('click', () => {
    formSeccion.style.display = 'none';
    turnoSeleccionado = null;
    mensajeRespuesta.textContent = '';
    mensajeRespuesta.className = '';
  });

  formCambio.addEventListener('submit', e => {
    e.preventDefault();

    if (!turnoSeleccionado) {
      alert('Selecciona un turno primero.');
      return;
    }

    const nuevaFecha = document.getElementById('nuevaFecha').value;
    const nuevaHoraInicio = document.getElementById('nuevaHoraInicio').value;
    const nuevaHoraFin = document.getElementById('nuevaHoraFin').value;
    const motivo = document.getElementById('motivo').value.trim();

    if (!nuevaFecha || !nuevaHoraInicio || !nuevaHoraFin || !motivo) {
      alert('Completa todos los campos.');
      return;
    }

    if (motivo.length > 200) {
      alert('El motivo debe tener máximo 200 caracteres.');
      return;
    }

    const nuevoInicio = new Date(`${nuevaFecha}T${nuevaHoraInicio}:00`);
    const nuevoFin = new Date(`${nuevaFecha}T${nuevaHoraFin}:00`);

    if (nuevoFin <= nuevoInicio) {
      alert('La hora de fin debe ser mayor que la hora de inicio.');
      return;
    }

    const hoy = new Date();
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    if (nuevoInicio < hoySinHora) {
      alert('La nueva fecha y hora de inicio no pueden ser anteriores a hoy.');
      return;
    }

    const turnos = JSON.parse(localStorage.getItem('turnosAsignados')) || [];
    const area = usuarioActivo.area;

    const solapa = turnos.some(t => {
      if (t.id === turnoSeleccionado.id) return false;
      if (t.area !== area) return false;
      const inicio = new Date(t.fechaInicio);
      const fin = new Date(t.fechaFin);
      return nuevoInicio < fin && nuevoFin > inicio;
    });

    if (solapa) {
      alert('El nuevo horario propuesto se solapa con otro turno en tu área. Por favor elige otro horario.');
      return;
    }

    const cambiosPropuestos = JSON.parse(localStorage.getItem('cambiosPropuestos')) || [];
    cambiosPropuestos.push({
      id: Date.now().toString(),
      rutFuncionario: usuarioActivo.rut,
      idTurnoOriginal: turnoSeleccionado.id,
      nuevoInicio: nuevoInicio.toISOString(),
      nuevoFin: nuevoFin.toISOString(),
      motivo,
      fechaSolicitud: new Date().toISOString(),
      estado: 'Pendiente',
      leido: false
    });
    localStorage.setItem('cambiosPropuestos', JSON.stringify(cambiosPropuestos));

    mensajeRespuesta.textContent = 'Propuesta de cambio enviada correctamente.';
    mensajeRespuesta.className = 'alert alert-success';

    formCambio.reset();
    formSeccion.style.display = 'none';
    turnoSeleccionado = null;

    mostrarTurnosProximos5Dias();
  });

  mostrarNotificacionesCambios();
  mostrarTurnosProximos5Dias();
});
