document.addEventListener('DOMContentLoaded', () => {
  const historialLista = document.getElementById('historialLista');
  const modalDetalleTurnoEl = document.getElementById('modalDetalleTurno');
  const detalleTurnoBody = document.getElementById('detalleTurnoBody');
  const modalDetalleTurno = new bootstrap.Modal(modalDetalleTurnoEl);

  // Usuario simulado (cambia según implementación real)
  const usuarioActivo = JSON.parse(sessionStorage.getItem('usuarioActivo')) || { rut: 'anonimo' };

  // Carga datos de localStorage (clave por rut usuario)
  let historialTurnos = JSON.parse(localStorage.getItem(`historialCambios-${usuarioActivo.rut}`)) || [];

  // Filtrar sólo últimos 6 meses
  const fechaLimite = new Date();
  fechaLimite.setMonth(fechaLimite.getMonth() - 6);
  historialTurnos = historialTurnos.filter(turno => new Date(turno.fechaCambio) >= fechaLimite);

  // Ordenar más reciente primero
  historialTurnos.sort((a, b) => new Date(b.fechaCambio) - new Date(a.fechaCambio));

  function formatearFecha(fechaStr) {
    const opciones = {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    };
    return new Date(fechaStr).toLocaleDateString('es-CL', opciones);
  }

  // Renderizar la lista de cambios
  function renderizarHistorial() {
    historialLista.innerHTML = '';
    if (historialTurnos.length === 0) {
      historialLista.innerHTML = `
        <li class="list-group-item text-center text-muted">
          No hay cambios de turno en los últimos 6 meses.
        </li>`;
      return;
    }

    historialTurnos.forEach(turno => {
      const li = document.createElement('li');
      li.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
      li.style.cursor = 'pointer';

      li.innerHTML = `
        <div>
          <strong>${formatearFecha(turno.fechaCambio)}</strong><br />
          Cambio: ${turno.turnoOriginal} → ${turno.turnoNuevo}<br />
          Funcionario: ${turno.funcionarioNuevo || turno.funcionario}
        </div>
        <span class="badge bg-primary rounded-pill">Ver</span>
      `;

      li.addEventListener('click', () => abrirModalDetalle(turno));
      historialLista.appendChild(li);
    });
  }

  // Mostrar detalles en modal
  function abrirModalDetalle(turno) {
    detalleTurnoBody.innerHTML = `
      <p><strong>Fecha de Cambio:</strong> ${formatearFecha(turno.fechaCambio)}</p>
      <p><strong>Turno Original:</strong> ${turno.turnoOriginal}</p>
      <p><strong>Turno Nuevo:</strong> ${turno.turnoNuevo}</p>
      <p><strong>Motivo:</strong> ${turno.motivo}</p>
      <p><strong>Coordinador que aceptó:</strong> ${turno.coordinador}</p>
      <p><strong>Funcionario:</strong> ${turno.funcionarioNuevo || turno.funcionario}</p>
    `;
    modalDetalleTurno.show();
  }

  renderizarHistorial();
});

const ejemploDatos = [
  {
    fechaCambio: new Date().toISOString(),
    turnoOriginal: 'Turno Mañana',
    turnoNuevo: 'Turno Tarde',
    motivo: 'Emergencia familiar',
    coordinador: 'Coordinador Juan',
    funcionario: 'María López',
    funcionarioNuevo: 'Carlos Díaz'
  },
  {
    fechaCambio: new Date(Date.now() - 1000 * 3600 * 24 * 30).toISOString(),
    turnoOriginal: 'Turno Noche',
    turnoNuevo: 'Turno Mañana',
    motivo: 'Motivo médico',
    coordinador: 'Coordinador Ana',
    funcionario: 'Carlos Díaz',
    funcionarioNuevo: 'Ana Méndez'
  }
];

localStorage.setItem('historialCambios-anonimo', JSON.stringify(ejemploDatos));
