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
  const cardBody = document.getElementById('cardBody');
  const toggleCard = document.getElementById('toggleCard');
  const iconToggle = document.getElementById('iconToggle');
  const canvasGrafico = document.getElementById('graficoTurnos');
  const sueldoEstimadoTexto = document.getElementById('sueldoEstimadoTexto');

  let bsModal = modalTurnoEl ? new bootstrap.Modal(modalTurnoEl) : null;
  let notificacion = toastElement ? new bootstrap.Toast(toastElement) : null;
  let calendar = null;
  let chart = null;
  const funcionarioActual = 'Tú';
  let turnos = [];

  if (!calendarEl) {
    console.error('No se encontró el elemento con id "calendar"');
    return;
  }

  cargarDatosIniciales();
  inicializarCalendar();
  actualizarUI();
  asignarEventos();

  function cargarDatosIniciales() {
    cargarSelects();
    cargarTurnosDesdeStorage();
  }

  function cargarSelects() {
    if (!selectFuncionario || !selectArea) return;

    const funcionarios = ['Juan Pérez', 'María Gómez', 'Carlos Díaz', 'Ana Martínez', 'Tú'];
    const areas = ['Urgencias', 'Pediatría', 'Cirugía'];

    funcionarios.forEach(f => {
      const option = document.createElement('option');
      option.value = f;
      option.textContent = f;
      selectFuncionario.appendChild(option);
    });

    areas.forEach(a => {
      const option = document.createElement('option');
      option.value = a;
      option.textContent = a;
      selectArea.appendChild(option);
    });
  }

  function cargarTurnosDesdeStorage() {
    const datos = localStorage.getItem('turnos');
    if (datos) {
      try {
        turnos = JSON.parse(datos);
      } catch {
        turnos = [];
        console.warn('Error al parsear turnos en localStorage, se inicializa vacío.');
      }
    } else {
      turnos = [
        { id: '1', title: 'Juan Pérez - Urgencias', start: '2025-06-21T08:00:00', end: '2025-06-21T14:00:00', area: 'Urgencias', funcionario: 'Juan Pérez', sueldo: 30000 },
        { id: '2', title: 'María Gómez - Pediatría', start: '2025-06-22T14:00:00', end: '2025-06-22T20:00:00', area: 'Pediatría', funcionario: 'María Gómez', sueldo: 35000 },
        { id: '3', title: 'Tú - Cirugía', start: '2025-06-23T20:00:00', end: '2025-06-24T02:00:00', area: 'Cirugía', funcionario: 'Tú', sueldo: 40000 }
      ];
      guardarTurnos();
    }
  }

  function guardarTurnos() {
    localStorage.setItem('turnos', JSON.stringify(turnos));
  }

  function inicializarCalendar() {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'es',
      firstDay: 1,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: turnos,
      navLinks: true,
      dayMaxEvents: true,
      dateClick: manejarDateClick,
      eventClick: manejarEventClick,
      eventClassNames: asignarClaseEvento,
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      eventContent: customEventContent
    });
    calendar.render();
  }

  function asignarEventos() {
    if (toggleCard) toggleCard.addEventListener('click', toggleCardBodyVisibility);
    if (btnAsignarTurno) btnAsignarTurno.addEventListener('click', abrirModalNuevoTurno);
    if (turnoForm) turnoForm.addEventListener('submit', manejarSubmitTurno);
    if (btnEliminarTurno) btnEliminarTurno.addEventListener('click', manejarEliminarTurno);
  }

  function actualizarUI() {
    actualizarCalendario();
    actualizarMensajeNoTurnos();
    actualizarGrafico();
    actualizarSueldo();
  }

  function actualizarCalendario() {
    if (!calendar) return;
    calendar.removeAllEvents();
    calendar.addEventSource(turnos);
  }

  function actualizarMensajeNoTurnos() {
    if (!noTurnosMsg) return;
    noTurnosMsg.classList.toggle('d-none', turnos.length > 0);
  }

  function actualizarGrafico() {
    if (!canvasGrafico) return;

    const conteo = turnos.reduce((acc, t) => {
      acc[t.area] = (acc[t.area] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(conteo);
    const valores = labels.map(l => conteo[l]);

    if (chart) chart.destroy();

    chart = new Chart(canvasGrafico.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
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
            title: { display: true, text: 'Número de turnos' }
          },
          x: {
            title: { display: true, text: 'Área' }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  function actualizarSueldo() {
    if (!sueldoEstimadoTexto) return;

    const total = turnos
      .filter(t => t.funcionario === funcionarioActual)
      .reduce((acc, t) => acc + (t.sueldo || 0), 0);

    sueldoEstimadoTexto.textContent = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(total);
  }

  function toggleCardBodyVisibility() {
    if (!cardBody || !iconToggle) return;

    const isOculto = cardBody.style.display === 'none';
    cardBody.style.display = isOculto ? 'block' : 'none';
    iconToggle.textContent = isOculto ? '▲' : '▼';
  }

  function abrirModalNuevoTurno() {
    limpiarFormulario();
    if (selectFuncionario) selectFuncionario.value = funcionarioActual;
    if (btnEliminarTurno) btnEliminarTurno.classList.add('d-none');
    ocultarError();
    bsModal?.show();
  }

  function manejarDateClick(info) {
    limpiarFormulario();
    if (inputFecha) inputFecha.value = info.dateStr;
    if (selectFuncionario) selectFuncionario.value = funcionarioActual;
    btnEliminarTurno?.classList.add('d-none');
    document.getElementById('modalTurnoLabel').textContent = 'Nuevo Turno';
    bsModal?.show();
  }

  function manejarEventClick(info) {
    if (info.event.extendedProps.funcionario !== funcionarioActual) {
      alert(`Turno de ${info.event.extendedProps.funcionario}\nNo puedes editar turnos que no son tuyos.`);
      return;
    }
    abrirModalEditarTurno(info.event);
  }

  function abrirModalEditarTurno(event) {
    if (!inputId || !selectFuncionario || !selectArea || !inputFecha || !selectHorario || !btnEliminarTurno || !errorTurno || !bsModal) return;

    inputId.value = event.id;
    selectFuncionario.value = event.extendedProps.funcionario;
    selectArea.value = event.extendedProps.area;
    inputFecha.value = event.startStr.slice(0, 10);
    selectHorario.value = formatHorario(event.start, event.end);
    btnEliminarTurno.classList.remove('d-none');
    ocultarError();
    bsModal.show();
  }

  function limpiarFormulario() {
    if (!inputId || !selectFuncionario || !selectArea || !inputFecha || !selectHorario || !errorTurno || !btnEliminarTurno) return;
    inputId.value = '';
    selectFuncionario.value = '';
    selectArea.value = '';
    inputFecha.value = '';
    selectHorario.value = '';
    ocultarError();
    btnEliminarTurno.classList.add('d-none');
  }

  function formatHorario(start, end) {
    const inicio = start.toTimeString().slice(0, 5);
    const fin = end.toTimeString().slice(0, 5);
    return `${inicio} - ${fin}`;
  }

  function manejarSubmitTurno(e) {
    e.preventDefault();
    ocultarError();

    const datos = obtenerDatosFormulario();

    if (!validarFormulario(datos)) return;

    const turnoNuevo = construirTurno(datos);

    if (turnoSolapado(turnoNuevo, datos.id)) {
      mostrarErrorSolapamiento(turnoNuevo);
      return;
    }

    if (datos.id) {
      actualizarTurnoExistente(datos.id, turnoNuevo);
      mostrarNotificacion('Turno editado correctamente.');
    } else {
      agregarNuevoTurno(turnoNuevo);
      mostrarNotificacion('Turno asignado correctamente.');
    }

    guardarTurnos();
    actualizarUI();
    bsModal?.hide();
  }

  function manejarEliminarTurno() {
    if (!inputId?.value) return;
    if (!confirm('¿Seguro que quieres eliminar este turno?')) return;

    turnos = turnos.filter(t => t.id !== inputId.value);
    guardarTurnos();
    actualizarUI();
    bsModal?.hide();
    mostrarNotificacion('Turno eliminado correctamente.');
  }

  function obtenerDatosFormulario() {
    return {
      id: inputId?.value.trim() || '',
      funcionario: selectFuncionario?.value || '',
      area: selectArea?.value || '',
      fecha: inputFecha?.value || '',
      horario: selectHorario?.value || ''
    };
  }

  function validarFormulario({ funcionario, area, fecha, horario }) {
    if (!funcionario || !area || !fecha || !horario) {
      mostrarError('Por favor completa todos los campos.');
      return false;
    }

    const [horaInicio, horaFin] = horario.split(' - ');
    const start = new Date(`${fecha}T${horaInicio}:00`);
    const end = new Date(`${fecha}T${horaFin}:00`);

    if (end <= start) {
      mostrarError('La hora de fin debe ser posterior a la hora de inicio.');
      return false;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date();
    limite.setDate(hoy.getDate() + 14);

    if (start < hoy || start > limite) {
      mostrarError('El turno debe estar dentro de los próximos 14 días.');
      return false;
    }

    return true;
  }

  function construirTurno({ id, funcionario, area, fecha, horario }) {
    const [horaInicio, horaFin] = horario.split(' - ');
    const start = new Date(`${fecha}T${horaInicio}:00`);
    const end = new Date(`${fecha}T${horaFin}:00`);

    return {
      id: id || String(Date.now()),
      title: `${funcionario} - ${area}`,
      start: start.toISOString(),
      end: end.toISOString(),
      funcionario,
      area,
      sueldo: calcularSueldo(horario)
    };
  }

  function calcularSueldo(horario) {
    switch (horario) {
      case '08:00 - 16:00': return 30000;
      case '16:00 - 00:00': return 35000;
      case '00:00 - 08:00': return 40000;
      default: return 0;
    }
  }

  function turnoSolapado(nuevo, idEditar) {
    const margen = 30 * 60 * 1000;
    const nuevoInicio = new Date(nuevo.start).getTime();
    const nuevoFin = new Date(nuevo.end).getTime();

    return turnos.some(t => {
      if (t.funcionario !== nuevo.funcionario) return false;
      if (t.area !== nuevo.area) return false;
      if (idEditar && t.id === idEditar) return false;

      const tInicio = new Date(t.start).getTime();
      const tFin = new Date(t.end).getTime();

      if ((nuevoInicio < tFin + margen) && (nuevoFin > tInicio - margen)) {
        return true;
      }

      return false;
    });
  }

  function mostrarErrorSolapamiento(turnoNuevo) {
    const margen = 30 * 60 * 1000;
    const nuevoInicio = new Date(turnoNuevo.start).getTime();
    const nuevoFin = new Date(turnoNuevo.end).getTime();

    const conflicto = turnos.find(t => {
      if (t.funcionario !== turnoNuevo.funcionario) return false;
      if (t.area !== turnoNuevo.area) return false;

      const tInicio = new Date(t.start).getTime();
      const tFin = new Date(t.end).getTime();

      return (nuevoInicio < tFin + margen) && (nuevoFin > tInicio - margen);
    });

    if (conflicto) {
      mostrarError(`Turno solapado con: ${conflicto.funcionario} (${conflicto.area}) del ${new Date(conflicto.start).toLocaleString()} al ${new Date(conflicto.end).toLocaleString()}`);
    } else {
      mostrarError('Turno solapado detectado.');
    }
  }

  function actualizarTurnoExistente(id, turnoNuevo) {
    const index = turnos.findIndex(t => t.id === id);
    if (index !== -1) {
      turnos[index] = turnoNuevo;
    }
  }

  function agregarNuevoTurno(turnoNuevo) {
    turnos.push(turnoNuevo);
  }

  function mostrarError(msg) {
    if (!errorTurno) return;
    errorTurno.textContent = msg;
    errorTurno.classList.remove('d-none');
  }

  function ocultarError() {
    if (!errorTurno) return;
    errorTurno.classList.add('d-none');
  }

  function mostrarNotificacion(msg) {
    if (!mensajeNotificacion || !toastElement || !notificacion) return;
    mensajeNotificacion.textContent = msg;
    toastElement.style.display = 'block';
    notificacion.show();
  }

  function asignarClaseEvento(info) {
    return info.event.extendedProps.funcionario === funcionarioActual ? ['fc-event-propio'] : ['fc-event-otro'];
  }

  function customEventContent(info) {
    const { funcionario, area } = info.event.extendedProps;
    const horaInicio = info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const horaFin = info.event.end ? info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return {
      html: `
        <div style="font-size:0.85em;">
          <strong>${funcionario}</strong><br>
          <small>${area}</small><br>
          <small>${horaInicio} - ${horaFin}</small>
        </div>
      `
    };
  }
});
