document.addEventListener('DOMContentLoaded', () => {
  const listaTurnos = document.getElementById('listaTurnos');
  const formSeccion = document.getElementById('formSeccion');
  const formCambio = document.getElementById('formCambio');
  const mensajeRespuesta = document.getElementById('mensajeRespuesta');
  const cancelarBtn = document.getElementById('cancelarBtn');

  const turnos = JSON.parse(localStorage.getItem('turnos')) || [];
  const rutUsuario = localStorage.getItem('rutUsuario');
  const nombreUsuario = localStorage.getItem('nombreUsuario');

  const hoy = new Date();
  const cincoDiasDespues = new Date(hoy);
  cincoDiasDespues.setDate(hoy.getDate() + 5);

  const turnosFiltrados = turnos.filter(t => {
    const fechaTurno = new Date(t.fecha);
    return (
      t.rut === rutUsuario &&
      fechaTurno >= hoy &&
      fechaTurno <= cincoDiasDespues
    );
  });

  if (turnosFiltrados.length === 0) {
    listaTurnos.innerHTML = '<li class="list-group-item">No tienes turnos en los próximos 5 días.</li>';
    return;
  }

  turnosFiltrados.forEach(turno => {
    const item = document.createElement('li');
    item.className = 'list-group-item list-group-item-action';
    item.textContent = ` ${turno.fecha} |  ${turno.horaInicio} - ${turno.horaFin} | Área: ${turno.area}`;
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => seleccionarTurno(turno));
    listaTurnos.appendChild(item);
  });

  let turnoSeleccionado = null;

  function seleccionarTurno(turno) {
    turnoSeleccionado = turno;
    formSeccion.style.display = 'block';
  }

  formCambio.addEventListener('submit', e => {
    e.preventDefault();

    const nuevaFecha = document.getElementById('nuevaFecha').value;
    const nuevaHoraInicio = document.getElementById('nuevaHoraInicio').value;
    const nuevaHoraFin = document.getElementById('nuevaHoraFin').value;
    const motivo = document.getElementById('motivo').value.trim();

    if (!nuevaFecha || !nuevaHoraInicio || !nuevaHoraFin || !motivo) {
      mostrarMensaje('Todos los campos son obligatorios.', 'danger');
      return;
    }

    if (motivo.length > 200) {
      mostrarMensaje('El motivo no debe superar los 200 caracteres.', 'warning');
      return;
    }

    const conflicto = turnos.some(t => {
      if (t.area === turnoSeleccionado.area && t.fecha === nuevaFecha && t.rut === turnoSeleccionado.rut) {
        const inicioExistente = t.horaInicio;
        const finExistente = t.horaFin;
        return (
          (nuevaHoraInicio >= inicioExistente && nuevaHoraInicio < finExistente) ||
          (nuevaHoraFin > inicioExistente && nuevaHoraFin <= finExistente)
        );
      }
      return false;
    });

    if (conflicto) {
      mostrarMensaje('El nuevo horario se solapa con otro turno en tu área.', 'danger');
      return;
    }

    const solicitudes = JSON.parse(localStorage.getItem('solicitudesCambio')) || [];

    const nuevaSolicitud = {
      id: Date.now(),
      rut: rutUsuario,
      nombre: nombreUsuario,
      fechaOriginal: turnoSeleccionado.fecha,
      horaOriginalInicio: turnoSeleccionado.horaInicio,
      horaOriginalFin: turnoSeleccionado.horaFin,
      area: turnoSeleccionado.area,
      nuevaFecha,
      nuevaHoraInicio,
      nuevaHoraFin,
      motivo,
      estado: 'Pendiente',
      fechaSolicitud: new Date().toISOString()
    };

    solicitudes.push(nuevaSolicitud);
    localStorage.setItem('solicitudesCambio', JSON.stringify(solicitudes));

    mostrarMensaje('Solicitud enviada al coordinador. Recibirás una respuesta en 24 horas.', 'success');
    formCambio.reset();
    formSeccion.style.display = 'none';
  });

  cancelarBtn.addEventListener('click', () => {
    formSeccion.style.display = 'none';
    formCambio.reset();
    mensajeRespuesta.innerHTML = '';
  });

  function mostrarMensaje(texto, tipo) {
    mensajeRespuesta.innerHTML = `<div class="alert alert-${tipo}" role="alert">${texto}</div>`;
  }
});
