document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCambioUrgente');
  const mensajeExito = document.getElementById('mensajeExito');
  const tablaHistorial = document.getElementById('tablaHistorial');
  const bodyHistorial = document.getElementById('bodyHistorial');
  const seccionHistorial = document.getElementById('historialSeccion');
  const btnExportarExcel = document.getElementById('btnExportarExcel');
  const tablaRecibidas = document.getElementById('tablaRecibidas');
  const bodyRecibidas = document.getElementById('bodyRecibidas');
  const filtroEstado = document.getElementById('filtroEstado'); 
  const inputBusqueda = document.getElementById('inputBusqueda'); 

  const usuarioActivo = JSON.parse(sessionStorage.getItem('usuarioActivo')) || {
    rut: 'anonimo',
    nombre: 'Invitado',
    area: 'General'
  };

  const claveStorage = `urgentes-${usuarioActivo.rut}`;

  cargarEventos();
  mostrarHistorial();
  mostrarSolicitudesRecibidas();

  function cargarEventos() {
    if (form) form.addEventListener('submit', manejarEnvioSolicitud);

    if (btnExportarExcel) {
      btnExportarExcel.addEventListener('click', exportarHistorialExcel);
    }

    if (filtroEstado) {
      filtroEstado.addEventListener('change', () => {
        mostrarHistorial();
      });
    }

    if (inputBusqueda) {
      inputBusqueda.addEventListener('input', () => {
        mostrarHistorial();
      });
    }
  }

  function manejarEnvioSolicitud(e) {
    e.preventDefault();

    const colega = form.querySelector('#colega')?.value.trim() || '';
    const asunto = form.querySelector('#asunto')?.value.trim() || '';
    const mensaje = form.querySelector('#mensaje')?.value.trim() || '';
    const urgente = form.querySelector('#urgente')?.checked || false;

    if (!colega || !asunto || !mensaje) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }
    if (mensaje.length > 200) {
      alert('El mensaje no debe superar los 200 caracteres.');
      return;
    }

    if (!esTiempoValidoParaEnvio()) {
      alert('La solicitud debe enviarse con al menos 1 hora de anticipación al cierre del turno.');
      return;
    }

    if (!puedeEnviarSolicitudEsteMes()) {
      alert('Solo puedes realizar 2 solicitudes urgentes por mes.');
      return;
    }

    const nuevaSolicitud = crearNuevaSolicitud(colega, asunto, mensaje, urgente);

    guardarSolicitudUsuario(nuevaSolicitud);

    guardarSolicitudGlobal(nuevaSolicitud);

    mostrarHistorial();
    mostrarSolicitudesRecibidas();

    mostrarMensajeExito('Solicitud enviada correctamente.');

    form.reset();

    if (colega === usuarioActivo.rut) {
      alert('Has enviado una solicitud a ti mismo.');
    } else {
      alert(`Notificación enviada a ${colega} para revisión de solicitud urgente.`);
    }
  }

  function esTiempoValidoParaEnvio() {
    const ahora = new Date();
    const cierreTurno = new Date();
    cierreTurno.setHours(18, 0, 0, 0);
    return (cierreTurno - ahora) >= 3600000;
  }

  function puedeEnviarSolicitudEsteMes() {
    const historial = JSON.parse(localStorage.getItem(claveStorage)) || [];
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();
    const enviosEsteMes = historial.filter(item => {
      const fecha = new Date(item.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });
    return enviosEsteMes.length < 2;
  }

  function crearNuevaSolicitud(colega, asunto, mensaje, urgente) {
    const ahora = new Date();
    return {
      id: Date.now().toString(),
      colega,
      asunto,
      mensaje,
      urgente,
      fecha: ahora.toISOString(),
      estado: 'Pendiente',
      deRut: usuarioActivo.rut,
      deNombre: usuarioActivo.nombre
    };
  }

  function guardarSolicitudUsuario(solicitud) {
    let historial = JSON.parse(localStorage.getItem(claveStorage)) || [];
    historial.push(solicitud);
    localStorage.setItem(claveStorage, JSON.stringify(historial));
  }

  function guardarSolicitudGlobal(solicitud) {
    let globales = JSON.parse(localStorage.getItem('solicitudesUrgentes')) || [];
    globales.push({
      id: solicitud.id,
      de: solicitud.deNombre,
      deRut: solicitud.deRut,
      para: solicitud.colega,
      area: usuarioActivo.area || 'General',
      asunto: solicitud.asunto,
      motivo: solicitud.mensaje,
      estado: 'pendiente',
      fecha: solicitud.fecha
    });
    localStorage.setItem('solicitudesUrgentes', JSON.stringify(globales));
  }

  function mostrarHistorial() {
    let historial = JSON.parse(localStorage.getItem(claveStorage)) || [];

    if (filtroEstado && filtroEstado.value !== 'todos') {
      const estadoFiltro = filtroEstado.value.toLowerCase();
      historial = historial.filter(item => item.estado.toLowerCase() === estadoFiltro);
    }

    if (inputBusqueda && inputBusqueda.value.trim() !== '') {
      const busq = inputBusqueda.value.trim().toLowerCase();
      historial = historial.filter(item =>
        item.colega.toLowerCase().includes(busq) ||
        item.asunto.toLowerCase().includes(busq) ||
        item.mensaje.toLowerCase().includes(busq)
      );
    }

    // Mostrar
    if (historial.length === 0) {
      if (tablaHistorial) tablaHistorial.style.display = 'none';
      if (seccionHistorial) seccionHistorial.style.display = 'none';
      return;
    }

    if (tablaHistorial) tablaHistorial.style.display = 'table';
    if (seccionHistorial) seccionHistorial.style.display = 'block';
    if (bodyHistorial) bodyHistorial.innerHTML = '';

    historial.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(item => {
      const fila = document.createElement('tr');
      let estadoHTML = `<strong class="${item.estado.toLowerCase()}">${item.estado}</strong>`;
      fila.innerHTML = `
        <td>${new Date(item.fecha).toLocaleString()}</td>
        <td>${item.colega}</td>
        <td>${item.asunto}</td>
        <td>${item.mensaje}</td>
        <td>${item.urgente ? 'Sí' : 'No'}</td>
        <td>${estadoHTML}</td>
      `;
      bodyHistorial.appendChild(fila);
    });
  }

  function mostrarSolicitudesRecibidas() {
    const todasSolicitudes = JSON.parse(localStorage.getItem('solicitudesUrgentes')) || [];
    const recibidas = todasSolicitudes.filter(s => s.para === usuarioActivo.rut && s.estado === 'pendiente');

    if (!bodyRecibidas || !tablaRecibidas) return;

    bodyRecibidas.innerHTML = '';

    if (recibidas.length === 0) {
      tablaRecibidas.style.display = 'none';
      return;
    }

    tablaRecibidas.style.display = 'table';

    recibidas.forEach(solicitud => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${new Date(solicitud.fecha).toLocaleString()}</td>
        <td>${solicitud.de}</td>
        <td>${solicitud.asunto}</td>
        <td>${solicitud.motivo}</td>
        <td>
          <button class="btn btn-success btn-sm btn-aceptar" data-id="${solicitud.id}">Aceptar</button>
          <button class="btn btn-danger btn-sm btn-rechazar" data-id="${solicitud.id}">Rechazar</button>
        </td>
      `;
      bodyRecibidas.appendChild(fila);
    });

    document.querySelectorAll('.btn-aceptar').forEach(btn => {
      btn.addEventListener('click', () => decidirSolicitud(btn.dataset.id, 'aceptada'));
    });
    document.querySelectorAll('.btn-rechazar').forEach(btn => {
      btn.addEventListener('click', () => decidirSolicitud(btn.dataset.id, 'rechazada'));
    });
  }

  function decidirSolicitud(id, decision) {
    const todasSolicitudes = JSON.parse(localStorage.getItem('solicitudesUrgentes')) || [];
    const solicitud = todasSolicitudes.find(s => s.id === id);
    if (!solicitud) return;

    solicitud.estado = decision;

    localStorage.setItem('solicitudesUrgentes', JSON.stringify(todasSolicitudes));

    if (solicitud.deRut === usuarioActivo.rut) {
      let historial = JSON.parse(localStorage.getItem(claveStorage)) || [];
      historial = historial.map(item => {
        if (item.id === id) {
          return { ...item, estado: decision === 'aceptada' ? 'Aprobado' : 'Rechazado' };
        }
        return item;
      });
      localStorage.setItem(claveStorage, JSON.stringify(historial));
      mostrarHistorial();
    }

    mostrarSolicitudesRecibidas();

    alert(`Coordinador notificado: Solicitud de ${solicitud.de} ha sido ${decision === 'aceptada' ? 'aceptada' : 'rechazada'}.`);
  }

  function exportarHistorialExcel() {
    const tabla = tablaHistorial;
    if (!tabla) return;

    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.table_to_sheet(tabla);
      XLSX.utils.book_append_sheet(wb, ws, 'Historial');

      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `historial_urgente_${fecha}.xlsx`);
    } catch (error) {
      alert('Error al exportar a Excel: ' + error.message);
    }
  }

  window.imprimirPDF = function () {
    const usuarioPrint = document.getElementById('nombreUsuarioPrint');
    const fechaPrint = document.getElementById('fechaHoyPrint');

    if (usuarioPrint) usuarioPrint.textContent = usuarioActivo.rut || 'Desconocido';
    if (fechaPrint) {
      const hoy = new Date();
      fechaPrint.textContent = hoy.toLocaleDateString('es-CL', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    window.print();
  };

  function mostrarMensajeExito(texto) {
    if (!mensajeExito) return;
    mensajeExito.textContent = texto;
    mensajeExito.style.display = 'flex';
    setTimeout(() => {
      mensajeExito.style.display = 'none';
    }, 4000);
  }
});
