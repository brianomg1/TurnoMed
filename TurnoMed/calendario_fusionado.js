
const funcionarios = [
  { id: 1, nombre: "Juan Pérez", rut: "12345678-9" },
  { id: 2, nombre: "María Gómez", rut: "98765432-1" },
  { id: 3, nombre: "Carlos López", rut: "45678912-3" }
];

const areas = ["Urgencias", "Pediatría", "Cirugía", "Cardiología", "Neurología"];
const horarios = ["08:00 - 16:00", "16:00 - 00:00", "00:00 - 08:00"];

const sharedLinks = [];
const shiftChangeRequests = [];
const misTurnos = [
  { id: 1, fecha: "2025-04-04", area: "Urgencias", horario: "08:00 - 16:00", estado: "autorizado" },
  { id: 2, fecha: "2025-04-12", area: "Urgencias", horario: "16:00 - 00:00", estado: "autorizado" },
  { id: 3, fecha: "2025-04-15", area: "Urgencias", horario: "16:00 - 00:00", estado: "no autorizado" },
  { id: 4, fecha: "2025-04-20", area: "Urgencias", horario: "08:00 - 16:00", estado: "autorizado" },
  { id: 5, fecha: "2025-05-03", area: "Urgencias", horario: "00:00 - 08:00", estado: "autorizado" },
  { id: 6, fecha: "2025-05-07", area: "Urgencias", horario: "00:00 - 08:00", estado: "no autorizado" }
];

const allShifts = [
  { fecha: "2025-04-17", area: "Urgencias", horario: "08:00 - 16:00", funcionario: "Ana Silva" },
  { fecha: "2025-04-18", area: "Urgencias", horario: "08:00 - 16:00", funcionario: "Carlos López" },
  { fecha: "2025-04-19", area: "Urgencias", horario: "16:00 - 00:00", funcionario: "María Gómez" },
  { fecha: "2025-04-20", area: "Urgencias", horario: "08:00 - 16:00", funcionario: "Juan Pérez" },
  { fecha: "2025-04-21", area: "Urgencias", horario: "00:00 - 08:00", funcionario: "Pedro Sánchez" }
];

// === FUNCIONES UTILITARIAS ===
function formatDate(year, month, day) {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
  let day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.className = `notification ${isError ? 'error' : ''}`;
  notification.innerHTML = `
    ${message}
    <span class="notification-close">×</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => notification.classList.remove('hidden'), 10);

  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.add('hidden');
    setTimeout(() => notification.remove(), 300);
  });

  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('hidden');
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function highlightActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const menuLinks = {
    'index.html': 'inicioLink',
    'coordinador.html': 'coordinadorLink',
    'funcionario.html': 'funcionarioLink'
  };

  for (const [page, linkId] of Object.entries(menuLinks)) {
    const linkElement = document.getElementById(linkId);
    if (linkElement && currentPage === page) {
      linkElement.style.backgroundColor = '#3498db';
    }
  }
}

// === INICIO ===
document.addEventListener('DOMContentLoaded', () => {
  highlightActiveLink();
  const view = document.body.dataset.view;
  if (view === 'coordinador') initCoordinadorFullCalendar();
  if (view === 'funcionario') initFuncionarioFullCalendar();
});

// A continuación se agregarán las funciones completas de:
// - initCoordinadorFullCalendar()
// - initFuncionarioFullCalendar()
// con integración de FullCalendar + gráficas + historial + sueldo + compartir

// === FUNCIÓN: initCoordinadorFullCalendar ===
function initCoordinadorFullCalendar() {
  const calendarEl = document.getElementById('calendar');
  const modal = document.getElementById('modalTurno');
  const form = document.getElementById('turnoForm');
  const notification = document.getElementById('notification');
  let calendar, lastEventId = null;

  calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'es',
    initialView: 'dayGridMonth',
    selectable: true,
    firstDay: 1,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    dateClick: info => abrirModal(info.dateStr),
    eventClick: info => {
      if (confirm(`¿Eliminar el turno de ${info.event.title}?`)) {
        info.event.remove();
        guardarTurnos();
        showNotification(`🗑️ Turno eliminado: ${info.event.title}`);
      }
    },
    eventDidMount(info) {
      const mensaje = info.event.extendedProps?.mensaje;
      if (mensaje?.trim()) {
        const icono = document.createElement('span');
        icono.innerText = " 📝";
        icono.title = mensaje;
        info.el.querySelector(".fc-event-title")?.appendChild(icono);
      }
    }
  });

  calendar.render();
  cargarTurnos();

  function abrirModal(fecha) {
    form.reset();
    form.dataset.fecha = fecha;
    const funcionarioSelect = form.elements['funcionario'];
    const areaSelect = form.elements['area'];
    funcionarioSelect.innerHTML = '<option value="">Selecciona funcionario</option>';
    areaSelect.innerHTML = '<option value="">Selecciona área</option>';
    funcionarios.forEach(f => {
      funcionarioSelect.innerHTML += `<option value="${f.nombre}">${f.nombre}</option>`;
    });
    areas.forEach(a => {
      areaSelect.innerHTML += `<option value="${a}">${a}</option>`;
    });
    modal.style.display = 'flex';
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const empleado = form.elements['funcionario'].value;
    const area = form.elements['area'].value;
    const fecha = form.dataset.fecha;
    const turno = form.elements['horario'].value;
    const mensaje = form.elements['mensaje']?.value || '';
    if (!empleado || !area || !turno || !fecha) return showNotification('⚠️ Completa todos los campos');
    const [inicio, fin] = turno.split(' - ').map(h => new Date(`${fecha}T${h}`));
    const nuevoEvento = {
      id: String(Date.now()),
      title: `${empleado} - ${area}`,
      start: inicio.toISOString(),
      end: fin.toISOString(),
      classNames: ['turno-asignado'],
      extendedProps: { funcionario: empleado, area, horario: turno, mensaje }
    };
    calendar.addEvent(nuevoEvento);
    lastEventId = nuevoEvento.id;
    guardarTurnos();
    showNotification(`✅ Turno asignado: ${empleado}, ${turno} en ${area}`);
    modal.style.display = 'none';
  });

  function guardarTurnos() {
    const eventos = calendar.getEvents().map(ev => ({
      id: ev.id,
      title: ev.title,
      start: ev.start.toISOString(),
      end: ev.end.toISOString(),
      classNames: ev.classNames,
      extendedProps: ev.extendedProps
    }));
    localStorage.setItem('turnos', JSON.stringify(eventos));
  }

  function cargarTurnos() {
    const datos = JSON.parse(localStorage.getItem('turnos') || '[]');
    datos.forEach(ev => calendar.addEvent(ev));
  }

  document.getElementById('undoButton')?.addEventListener('click', () => {
    if (lastEventId) {
      const ev = calendar.getEventById(lastEventId);
      if (ev) {
        ev.remove();
        guardarTurnos();
        showNotification('↩️ Turno deshecho');
        lastEventId = null;
      }
    }
  });

  document.querySelector('#modalTurno .close')?.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

// === FUNCIÓN: initFuncionarioFullCalendar ===
function initFuncionarioFullCalendar() {
  const calendarEl = document.getElementById('calendar');
  const funcionarioActual = funcionarios.find(f => f.id === 1);

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'es',
    initialView: 'dayGridMonth',
    firstDay: 1,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    events: misTurnos.map(turno => {
      return {
        id: turno.id,
        title: `${turno.area} - ${turno.horario}`,
        start: `${turno.fecha}T${turno.horario.split(' - ')[0]}`,
        end: `${turno.fecha}T${turno.horario.split(' - ')[1]}`,
        classNames: [turno.estado === 'autorizado' ? 'turno-autorizado' : 'turno-no-autorizado'],
        extendedProps: { ...turno }
      };
    }),
    eventDidMount(info) {
      if (info.event.extendedProps.estado === 'no autorizado') {
        info.el.style.opacity = '0.5';
        info.el.title = 'Turno no autorizado';
      }
    }
  });

  calendar.render();

  // Mostrar nombre y rut del funcionario actual
  const nombreEl = document.getElementById('nombreFuncionario');
  const rutEl = document.getElementById('rutFuncionario');
  if (nombreEl) nombreEl.textContent = funcionarioActual.nombre;
  if (rutEl) rutEl.textContent = funcionarioActual.rut;
}

// === FUNCIÓN EXTRA: Mostrar sueldo mensual por área ===
function mostrarSueldoFuncionario() {
  const currentMonth = new Date().getMonth() + 1;
  const valorPorHora = 10; // Valor por hora en USD
  const horasPorTurno = 8;
  const horasPorArea = {};

  areas.forEach(area => {
    const turnos = misTurnos.filter(t => {
      const mes = parseInt(t.fecha.split('-')[1]);
      return t.area === area && mes === currentMonth && t.estado === 'autorizado';
    });
    horasPorArea[area] = turnos.length * horasPorTurno;
  });

  const container = document.getElementById('sueldoContainer');
  if (!container) return;
  container.innerHTML = '<h3>💰 Sueldo estimado por área</h3>';
  const ul = document.createElement('ul');
  Object.entries(horasPorArea).forEach(([area, horas]) => {
    const li = document.createElement('li');
    li.textContent = `${area}: $${horas * valorPorHora} USD (${horas} horas)`;
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

// === FUNCIÓN EXTRA: Ver historial de solicitudes de cambio ===
function mostrarHistorialSolicitudes() {
  const modal = document.getElementById('historyModal');
  const body = document.getElementById('historyTableBody');
  if (!modal || !body) return;
  body.innerHTML = '';

  const requests = shiftChangeRequests.length ? shiftChangeRequests : [{
    originalDate: '07/05/2025', newDate: '08/05/2025', newTime: '08:00 - 16:00',
    reason: 'Cita médica personal', status: 'Pendiente'
  }];

  requests.forEach(req => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${req.originalDate}</td>
      <td>${req.newDate}</td>
      <td>${req.newTime}</td>
      <td>${req.reason}</td>
      <td>${req.status}</td>`;
    body.appendChild(row);
  });

  modal.style.display = 'flex';
}

// === FUNCIÓN EXTRA: Compartir Turno ===
function compartirTurno(turnoId, destinatario) {
  const turno = misTurnos.find(t => t.id === turnoId);
  if (!turno) return showNotification('❌ Turno no encontrado.', true);

  let sharedLink = sharedLinks.find(link => link.turnoId === turnoId);
  if (!sharedLink) {
    sharedLink = {
      turnoId: turnoId,
      link: `http://turnos.com/share/${Math.random().toString(36).substr(2, 8)}`,
      created: new Date(),
      expires: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
      sharedWith: new Set()
    };
    sharedLinks.push(sharedLink);
  }

  if (sharedLink.sharedWith.size >= 3) {
    return showNotification('⚠️ Máximo 3 destinatarios permitidos.', true);
  }

  if (new Date() > sharedLink.expires) {
    return showNotification('⚠️ El enlace ha expirado.', true);
  }

  sharedLink.sharedWith.add(destinatario);
  const container = document.getElementById('sharedLink');
  if (container) {
    container.innerHTML = `
      <p>🔗 Enlace generado: <a href="${sharedLink.link}" target="_blank">${sharedLink.link}</a></p>
      <p>📤 Compartido con: ${Array.from(sharedLink.sharedWith).join(', ')}</p>
      <p>⏳ Válido hasta: ${sharedLink.expires.toLocaleString()}</p>
    `;
  }
  showNotification(`✅ Enlace enviado a ${destinatario}`);
}

// === FUNCIÓN EXTRA: Mostrar gráfico de turnos por área ===
function mostrarGraficoTurnosPorArea() {
  const turnoData = {};
  areas.forEach(area => turnoData[area] = 0);

  const eventos = JSON.parse(localStorage.getItem('turnos') || '[]');
  eventos.forEach(evento => {
    const area = evento.extendedProps?.area;
    if (turnoData[area] !== undefined) {
      turnoData[area]++;
    }
  });

  const labels = Object.keys(turnoData);
  const data = Object.values(turnoData);

  const ctx = document.getElementById('shiftsChart')?.getContext('2d');
  if (!ctx) return;

  if (window.shiftsChart instanceof Chart) {
    window.shiftsChart.destroy();
  }

  window.shiftsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cantidad de Turnos',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      },
      plugins: { legend: { display: false } },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}


