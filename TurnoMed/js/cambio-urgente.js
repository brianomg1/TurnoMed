document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCambioUrgente');
  const mensajeExito = document.getElementById('mensajeExito');
  const tablaHistorial = document.getElementById('tablaHistorial');
  const bodyHistorial = document.getElementById('bodyHistorial');
  const seccionHistorial = document.getElementById('historialSeccion');
  const btnExportarExcel = document.getElementById('btnExportarExcel');

  const usuarioActivo = JSON.parse(sessionStorage.getItem('usuarioActivo')) || { rut: 'anonimo' };
  const claveStorage = `urgentes-${usuarioActivo.rut}`;

  mostrarHistorial();

  form.addEventListener('submit', e => {
    e.preventDefault();

    const colega = document.getElementById('colega').value.trim();
    const asunto = document.getElementById('asunto').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    const urgente = document.getElementById('urgente').checked;

    if (!colega || !asunto || !mensaje) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }
    if (mensaje.length > 200) {
      alert('El mensaje no debe superar los 200 caracteres.');
      return;
    }

    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    let historial = JSON.parse(localStorage.getItem(claveStorage)) || [];

    const enviosEsteMes = historial.filter(item => {
      const fecha = new Date(item.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    if (enviosEsteMes.length >= 2) {
      alert('Solo puedes realizar 2 solicitudes urgentes por mes.');
      return;
    }

    const nuevaSolicitud = {
      colega,
      asunto,
      mensaje,
      urgente,
      fecha: ahora.toISOString(),
      estado: 'Pendiente'
    };

    historial.push(nuevaSolicitud);
    localStorage.setItem(claveStorage, JSON.stringify(historial));

    mostrarHistorial();

    mensajeExito.style.display = 'flex';
    setTimeout(() => {
      mensajeExito.style.display = 'none';
    }, 4000);

    form.reset();
  });

  function mostrarHistorial() {
    let historial = JSON.parse(localStorage.getItem(claveStorage)) || [];

    const hoy = new Date();
    historial = historial.filter(item => {
      const fechaItem = new Date(item.fecha);
      return (
        fechaItem.getDate() === hoy.getDate() &&
        fechaItem.getMonth() === hoy.getMonth() &&
        fechaItem.getFullYear() === hoy.getFullYear()
      );
    });

    localStorage.setItem(claveStorage, JSON.stringify(historial));

    if (historial.length === 0) {
      tablaHistorial.style.display = 'none';
      seccionHistorial.style.display = 'none';
      return;
    }

    seccionHistorial.style.display = 'block';
    tablaHistorial.style.display = 'table';
    bodyHistorial.innerHTML = '';

    historial.slice().reverse().forEach(item => {
      const fila = document.createElement('tr');

      let accionHTML = '';
      if (item.estado === 'Pendiente') {
        accionHTML = `
          <button class="btn-aprobar btn btn-success btn-sm" data-fecha="${item.fecha}">Aprobar</button>
          <button class="btn-rechazar btn btn-danger btn-sm" data-fecha="${item.fecha}">Rechazar</button>
        `;
      } else {
        accionHTML = `<strong class="${item.estado.toLowerCase()}">${item.estado}</strong>`;
      }

      fila.innerHTML = `
        <td>${new Date(item.fecha).toLocaleString()}</td>
        <td>${item.colega}</td>
        <td>${item.asunto}</td>
        <td>${item.mensaje}</td>
        <td>${item.urgente ? 'Sí' : 'No'}</td>
        <td>${accionHTML}</td>
      `;

      bodyHistorial.appendChild(fila);
    });

    document.querySelectorAll('.btn-aprobar').forEach(btn => {
      btn.addEventListener('click', () => {
        actualizarEstadoSolicitud(btn.getAttribute('data-fecha'), 'Aprobado');
      });
    });

    document.querySelectorAll('.btn-rechazar').forEach(btn => {
      btn.addEventListener('click', () => {
        actualizarEstadoSolicitud(btn.getAttribute('data-fecha'), 'Rechazado');
      });
    });
  }

  function actualizarEstadoSolicitud(fecha, nuevoEstado) {
    let historial = JSON.parse(localStorage.getItem(claveStorage)) || [];

    if (nuevoEstado === 'Rechazado') {
      // Eliminar la solicitud
      historial = historial.filter(item => item.fecha !== fecha);
    } else {
      // Aprobar
      historial = historial.map(item => {
        if (item.fecha === fecha) {
          return { ...item, estado: nuevoEstado };
        }
        return item;
      });
    }

    localStorage.setItem(claveStorage, JSON.stringify(historial));
    mostrarHistorial();
  }

  if (btnExportarExcel) {
    btnExportarExcel.addEventListener('click', () => {
      const tabla = document.getElementById('tablaHistorial');
      if (!tabla) return;

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.table_to_sheet(tabla);
      XLSX.utils.book_append_sheet(wb, ws, 'Historial');

      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `historial_urgente_${fecha}.xlsx`);
    });
  }

  window.imprimirPDF = function() {
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
});
