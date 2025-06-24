document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.getElementById('calendar');
  const btnAsignarTurno = document.getElementById('btnAsignarTurno');
  const modalTurnoEl = document.getElementById('modalTurno');
  const turnoForm = document.getElementById('turnoForm');
  const inputId = document.getElementById('inputId');
  const selectFuncionario = document.getElementById('funcionario');
  const selectArea = document.getElementById('area');
  const inputFecha = document.getElementById('inputFecha');
  const selectHorario = document.getElementById('horario');
  const errorTurno = document.getElementById('errorTurno');
  const btnEliminarTurno = document.getElementById('btnEliminarTurno');
  const noTurnosMsg = document.getElementById('noTurnosMsg');
  const mensajeNotificacion = document.getElementById('mensajeNotificacion');
  const toastElement = document.getElementById('notificacion');
  const notificacion = new bootstrap.Toast(toastElement);

  const cardBody = document.getElementById('cardBody');
  const toggleCard = document.getElementById('toggleCard');
  const iconToggle = document.getElementById('iconToggle');

  const funcionarioActual = 'Tú';

  let turnos = [
    { id: '1', title: 'Juan Pérez - Urgencias', start: '2025-06-21T08:00:00', end: '2025-06-21T14:00:00', area: 'Urgencias', funcionario: 'Juan Pérez', sueldo: 30000 },
    { id: '2', title: 'María Gómez - Pediatría', start: '2025-06-22T14:00:00', end: '2025-06-22T20:00:00', area: 'Pediatría', funcionario: 'María Gómez', sueldo: 35000 },
    { id: '3', title: 'Tú - Cirugía', start: '2025-06-23T20:00:00', end: '2025-06-24T02:00:00', area: 'Cirugía', funcionario: 'Tú', sueldo: 40000 }
  ];

  let calendar;
  let bsModal;
  let chart = null;

  // Guardar y cargar turnos en localStorage para persistencia
  function guardarTurnos() {
    localStorage.setItem('turnos', JSON.stringify(turnos));
  }

  function cargarTurnos() {
    const datosGuardados = localStorage.getItem('turnos');
    if (datosGuardados) {
      turnos = JSON.parse(datosGuardados);
    }
  }

  function cargarSelects() {
    const funcionarios = ['Juan Pérez', 'María Gómez', 'Carlos Díaz', 'Ana Martínez', 'Tú'];
    funcionarios.forEach(f => {
      const option = document.createElement('option');
      option.value = f;
      option.textContent = f;
      selectFuncionario.appendChild(option);
    });

    const areas = ['Urgencias', 'Pediatría', 'Cirugía'];
    areas.forEach(a => {
      const option = document.createElement('option');
      option.value = a;
      option.textContent = a;
      selectArea.appendChild(option);
    });
  }

  function inicializarCalendar() {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'es',
      headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
      events: turnos,
      navLinks: true,
      dayMaxEvents: true,
      eventClassNames: e => (e.event.extendedProps.funcionario === funcionarioActual ? ['fc-event-propio'] : ['fc-event-otro']),
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      eventContent: info => {
        const { funcionario } = info.event.extendedProps;
        const horaInicio = info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const horaFin = info.event.end ? info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        return {
          html: `<strong>${info.event.title}</strong><br>${horaInicio} - ${horaFin}<br><i>${funcionario}</i>`
        };
      },
      eventClick: info => {
        if (info.event.extendedProps.funcionario !== funcionarioActual) {
          alert(`Turno de ${info.event.extendedProps.funcionario}\nNo puedes editar turnos que no son tuyos.`);
          return;
        }
        abrirModalEditar(info.event);
      }
    });
    calendar.render();
    actualizarMensajeNoTurnos();
    actualizarGrafico(turnos);
    actualizarSueldo(turnos);
  }

  toggleCard.addEventListener('click', () => {
    if (cardBody.style.display === 'none') {
      cardBody.style.display = 'block';
      iconToggle.textContent = '▲';
    } else {
      cardBody.style.display = 'none';
      iconToggle.textContent = '▼';
    }
  });

  btnAsignarTurno.addEventListener('click', () => {
    limpiarFormulario();
    bsModal.show();
  });

  turnoForm.addEventListener('submit', e => {
    e.preventDefault();
    errorTurno.classList.add('d-none');

    const datos = obtenerDatosFormulario();
    if (!validarFormulario(datos)) return;

    const turnoNuevo = construirTurno(datos);

    if (turnoSolapado(turnoNuevo, datos.id)) {
      mostrarError('Turno solapado para este funcionario y área.');
      return;
    }

    if (datos.id) {
      const idx = turnos.findIndex(t => t.id === datos.id);
      if (idx !== -1) turnos[idx] = turnoNuevo;
      mostrarNotificacion('Turno editado correctamente.');
    } else {
      turnos.push(turnoNuevo);
      mostrarNotificacion('Turno asignado correctamente.');
    }

    guardarTurnos();

    calendar.removeAllEvents();
    calendar.addEventSource(turnos);
    actualizarMensajeNoTurnos();
    actualizarGrafico(turnos);
    actualizarSueldo(turnos);
    bsModal.hide();
  });

  btnEliminarTurno.addEventListener('click', () => {
    if (!inputId.value) return;
    if (!confirm('¿Seguro que quieres eliminar este turno?')) return;
    turnos = turnos.filter(t => t.id !== inputId.value);

    guardarTurnos();

    calendar.removeAllEvents();
    calendar.addEventSource(turnos);
    actualizarMensajeNoTurnos();
    actualizarGrafico(turnos);
    actualizarSueldo(turnos);
    bsModal.hide();
    mostrarNotificacion('Turno eliminado correctamente.');
  });

  function limpiarFormulario() {
    inputId.value = '';
    selectFuncionario.value = funcionarioActual;
    selectArea.value = '';
    inputFecha.value = '';
    selectHorario.value = '';
    errorTurno.classList.add('d-none');
    btnEliminarTurno.classList.add('d-none');
  }

  function abrirModalEditar(event) {
    inputId.value = event.id;
    selectFuncionario.value = event.extendedProps.funcionario;
    selectArea.value = event.extendedProps.area;
    inputFecha.value = event.startStr.slice(0, 10);
    selectHorario.value = calcularHorario(event.start, event.end);
    errorTurno.classList.add('d-none');
    btnEliminarTurno.classList.remove('d-none');
    bsModal.show();
  }

  function calcularHorario(start, end) {
    const inicio = start.toTimeString().slice(0, 5);
    const fin = end.toTimeString().slice(0, 5);
    return `${inicio} - ${fin}`;
  }

  function obtenerDatosFormulario() {
    return {
      id: inputId.value.trim(),
      funcionario: selectFuncionario.value,
      area: selectArea.value,
      fecha: inputFecha.value,
      horario: selectHorario.value
    };
  }

  function validarFormulario(datos) {
    if (!datos.funcionario || !datos.area || !datos.fecha || !datos.horario) {
      mostrarError('Por favor completa todos los campos.');
      return false;
    }
    const [horaInicio, horaFin] = datos.horario.split(' - ');
    const start = new Date(`${datos.fecha}T${horaInicio}:00`);
    const end = new Date(`${datos.fecha}T${horaFin}:00`);
    if (end <= start) {
      mostrarError('La hora de fin debe ser posterior a la hora de inicio.');
      return false;
    }
    return true;
  }

  function construirTurno(datos) {
    const [horaInicio, horaFin] = datos.horario.split(' - ');
    const start = new Date(`${datos.fecha}T${horaInicio}:00`);
    const end = new Date(`${datos.fecha}T${horaFin}:00`);
    return {
      id: datos.id || String(Date.now()),
      title: `${datos.funcionario} - ${datos.area}`,
      start: start.toISOString(),
      end: end.toISOString(),
      funcionario: datos.funcionario,
      area: datos.area,
      sueldo: calcularSueldo(datos.horario)
    };
  }

  function calcularSueldo(horario) {
    switch(horario) {
      case '08:00 - 16:00': return 30000;
      case '16:00 - 00:00': return 35000;
      case '00:00 - 08:00': return 40000;
      default: return 0;
    }
  }

  function turnoSolapado(nuevo, idEditar) {
    return turnos.some(t => {
      if (t.funcionario !== nuevo.funcionario) return false;
      if (t.area !== nuevo.area) return false;
      if (idEditar && t.id === idEditar) return false;
      const startA = new Date(t.start).getTime();
      const endA = new Date(t.end).getTime();
      const startB = new Date(nuevo.start).getTime();
      const endB = new Date(nuevo.end).getTime();
      return startB < endA && endB > startA;
    });
  }

  function mostrarError(msg) {
    errorTurno.textContent = msg;
    errorTurno.classList.remove('d-none');
  }

  function mostrarNotificacion(msg) {
    mensajeNotificacion.textContent = msg;
    toastElement.style.display = 'block';
    notificacion.show();
  }

  function actualizarMensajeNoTurnos() {
    if (turnos.length === 0) {
      noTurnosMsg.classList.remove('d-none');
    } else {
      noTurnosMsg.classList.add('d-none');
    }
  }

  function actualizarGrafico(data) {
    const ctx = document.getElementById('graficoTurnos').getContext('2d');
    const conteo = data.reduce((acc, t) => {
      acc[t.area] = (acc[t.area] || 0) + 1;
      return acc;
    }, {});
    const labels = Object.keys(conteo);
    const valores = labels.map(label => conteo[label]);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad de turnos',
          data: valores,
          backgroundColor: '#0d6efd'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            precision: 0,
            stepSize: 1,
            title: {
              display: true,
              text: 'Número de turnos'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Área'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  function actualizarSueldo(data) {
    const sueldoTotal = data
      .filter(t => t.funcionario === funcionarioActual)
      .reduce((acc, t) => acc + (t.sueldo || 0), 0);

    const texto = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(sueldoTotal);
    document.getElementById('sueldoEstimadoTexto').textContent = texto;
  }

  cargarSelects();
  cargarTurnos();
  inicializarCalendar();
  bsModal = new bootstrap.Modal(modalTurnoEl);
});
