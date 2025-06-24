document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const filtroArea = document.getElementById('filtroArea');
  const filtroFecha = document.getElementById('filtroFecha');

  const turnosFuncionario = [
    {
      title: 'Turno - Urgencias',
      start: '2025-06-19T08:00:00',
      end: '2025-06-19T16:00:00',
      area: 'Urgencias'
    },
    {
      title: 'Turno - Cirugía',
      start: '2025-06-21T16:00:00',
      end: '2025-06-21T23:59:00',
      area: 'Cirugía'
    },
    {
      title: 'Permiso - Pediatría',
      start: '2025-07-01',
      area: 'Pediatría'
    }
  ];

  const hoy = new Date();

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    firstDay: 1,
    initialDate: hoy,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: turnosFuncionario,
    height: 'auto',
    eventDisplay: 'block',

    eventContent: function (arg) {
      let icono = '';

      if (arg.event.extendedProps.area === 'Urgencias') {
        icono = '❓';
      } else if (arg.event.extendedProps.area === 'Cirugía') {
        icono = '🔪';
      } else if (arg.event.extendedProps.area === 'Pediatría') {
        icono = '🧒';
      }

      return {
        html: `<div>${icono} ${arg.event.title}</div>`
      };
    },

    datesSet: function (info) {
      const fechaActual = new Date();
      const mesHoy = fechaActual.getMonth();
      const añoHoy = fechaActual.getFullYear();

      const mesVista = info.start.getMonth();
      const añoVista = info.start.getFullYear();

      const botonPrev = document.querySelector('.fc-prev-button');

      if (añoVista < añoHoy || (añoVista === añoHoy && mesVista < mesHoy)) {
        botonPrev.setAttribute('disabled', 'disabled');
        botonPrev.classList.add('fc-button-disabled');
      } else {
        botonPrev.removeAttribute('disabled');
        botonPrev.classList.remove('fc-button-disabled');
      }
    }
  });

  calendar.render();

  function aplicarFiltros() {
    const area = filtroArea.value;
    const mesSeleccionado = filtroFecha.value;

    calendar.removeAllEvents();

    const filtrados = turnosFuncionario.filter(ev => {
      const coincideArea = !area || ev.area === area;
      const coincideMes = !mesSeleccionado || ev.start.startsWith(mesSeleccionado);
      return coincideArea && coincideMes;
    });

    calendar.addEventSource(filtrados);
  }

  filtroArea.addEventListener('change', aplicarFiltros);
  filtroFecha.addEventListener('change', aplicarFiltros);
});
