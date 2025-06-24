document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const filtroArea = document.getElementById('filtroArea');
  const filtroTipo = document.getElementById('filtroTipo');
  const filtroEstado = document.getElementById('filtroEstado');
  const formTurno = document.getElementById('formTurno');
  const notificacion = document.getElementById('notificacion');

  const turnos = [
    {
      title: 'Ana G. - Urgencias',
      start: '2025-06-18T08:00:00',
      end: '2025-06-18T16:00:00',
      area: 'Urgencias',
      tipo: 'Diurno',
      estado: 'activo'
    },
    {
      title: 'Carlos M. - Cirugía',
      start: '2025-06-19T00:00:00',
      end: '2025-06-19T08:00:00',
      area: 'Cirugía',
      tipo: 'Nocturno',
      estado: 'permiso'
    },
    {
      title: 'Luisa O. - Pediatría',
      start: '2025-06-20',
      area: 'Pediatría',
      tipo: 'Diurno',
      estado: 'vacaciones'
    }
  ];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    dateClick: function (info) {
      const modal = new bootstrap.Modal(document.getElementById('modalTurno'));
      document.getElementById('formTurno').setAttribute('data-fecha', info.dateStr);
      modal.show();
    },
    events: turnos,
    eventDisplay: 'block'
  });

  calendar.render();

  formTurno.addEventListener('submit', function (e) {
    e.preventDefault();

    const funcionario = document.getElementById('inputFuncionario').value;
    const area = document.getElementById('inputArea').value;
    const horario = document.getElementById('inputHorario').value;
    const fecha = this.getAttribute('data-fecha');

    const [inicio, fin] = convertirHorario(horario, fecha);
    const tipo = obtenerTipoTurno(horario);

    const nuevoTurno = {
      title: `${funcionario} - ${area}`,
      start: inicio,
      end: fin,
      area,
      tipo,
      estado: 'activo'
    };

    turnos.push(nuevoTurno);
    calendar.addEvent(nuevoTurno);

    // Cierra modal
    bootstrap.Modal.getInstance(document.getElementById('modalTurno')).hide();
    mostrarNotificacion("✅ Turno asignado correctamente");
    formTurno.reset();
  });

  // Filtros
  [filtroArea, filtroTipo, filtroEstado].forEach(filtro => {
    filtro.addEventListener('change', aplicarFiltros);
  });

  function aplicarFiltros() {
    const area = filtroArea.value;
    const tipo = filtroTipo.value;
    const estado = filtroEstado.value;

    calendar.removeAllEvents();

    const filtrados = turnos.filter(ev =>
      (area === '' || ev.area === area) &&
      (tipo === '' || ev.tipo === tipo) &&
      (estado === '' || ev.estado === estado)
    );

    calendar.addEventSource(filtrados);
  }

  function mostrarNotificacion(texto) {
    document.getElementById('mensajeNotificacion').textContent = texto;
    notificacion.style.display = 'block';
    const toast = new bootstrap.Toast(notificacion);
    toast.show();
  }

  function convertirHorario(rango, fecha) {
    const [inicio, fin] = rango.split(' - ');
    return [
      `${fecha}T${inicio}:00`,
      fin === "00:00" ? `${fecha}T23:59:00` : `${fecha}T${fin}:00`
    ];
  }

  function obtenerTipoTurno(horario) {
    if (horario.includes("08:00")) return "Diurno";
    if (horario.includes("16:00")) return "Tarde";
    if (horario.includes("00:00")) return "Nocturno";
    return "Otro";
  }
});
