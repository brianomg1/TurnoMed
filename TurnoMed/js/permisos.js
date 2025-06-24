document.addEventListener("DOMContentLoaded", () => {
  const listaSolicitudes = document.getElementById("listaSolicitudes");
  const tablaHistorialBody = document.querySelector("#tablaHistorial tbody");
  const modalRespuesta = new bootstrap.Modal(document.getElementById("modalRespuesta"));
  const formRespuesta = document.getElementById("formRespuesta");
  const motivoRespuesta = document.getElementById("motivoRespuesta");
  const indiceSolicitudInput = document.getElementById("indiceSolicitud");
  const accionSolicitudInput = document.getElementById("accionSolicitud");
  const calendarioEl = document.getElementById("calendario");

  const MAX_PERMISOS_ANUALES = 15;

  let solicitudes = JSON.parse(localStorage.getItem("solicitudesPermisos")) || [
    { id: 1, funcionario: "Ana Torres", tipo: "Permiso", inicio: "2025-06-20", fin: "2025-06-22", estado: "Pendiente", motivo: "" },
    { id: 2, funcionario: "Luis Rojas", tipo: "Vacaciones", inicio: "2025-07-01", fin: "2025-07-15", estado: "Pendiente", motivo: "" },
  ];
  let historial = JSON.parse(localStorage.getItem("historialPermisos")) || [];

  const calendario = new FullCalendar.Calendar(calendarioEl, {
    initialView: "dayGridMonth",
    height: 450,
    locale: "es",
    firstDay: 1,
    events: [],
  });

  calendario.render();

  function calcularDias(fechaInicio, fechaFin) {
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  function diasUsados(funcionario) {
    return historial
      .filter(s => s.funcionario === funcionario && s.estado === "Aceptado")
      .reduce((acc, s) => acc + calcularDias(s.inicio, s.fin), 0);
  }

  function ordenarPorFechaInicio(array) {
    return array.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
  }

  function mostrarSolicitudes() {
    listaSolicitudes.innerHTML = "";
    let pendientes = solicitudes.filter(s => s.estado === "Pendiente");
    pendientes = ordenarPorFechaInicio(pendientes);

    if (pendientes.length === 0) {
      listaSolicitudes.innerHTML = `<p class="text-muted">No hay solicitudes pendientes.</p>`;
      return;
    }

    pendientes.forEach((sol, i) => {
      const usados = diasUsados(sol.funcionario);
      const duracion = calcularDias(sol.inicio, sol.fin);
      if (usados + duracion > MAX_PERMISOS_ANUALES) {
        const divAlerta = document.createElement("div");
        divAlerta.className = "alert alert-danger";
        divAlerta.textContent = `El funcionario ${sol.funcionario} ha agotado sus permisos anuales.`;
        listaSolicitudes.appendChild(divAlerta);
        return;
      }

      const div = document.createElement("div");
      div.className = "border rounded p-3 mb-3 bg-light d-flex justify-content-between align-items-center";
      div.innerHTML = `
        <div>
          <strong>${sol.funcionario}</strong> - ${sol.tipo} <br/>
          <small>${sol.inicio} a ${sol.fin}</small>
        </div>
        <div>
          <button class="btn btn-success btn-sm me-2" data-accion="aceptar" data-id="${sol.id}">Aceptar</button>
          <button class="btn btn-danger btn-sm" data-accion="rechazar" data-id="${sol.id}">Rechazar</button>
        </div>
      `;
      listaSolicitudes.appendChild(div);
    });
  }

  function mostrarHistorial() {
    tablaHistorialBody.innerHTML = "";
    if (historial.length === 0) {
      tablaHistorialBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay historial de decisiones.</td></tr>`;
      return;
    }
    let historialOrdenado = ordenarPorFechaInicio(historial);
    historialOrdenado.forEach(sol => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${sol.funcionario}</td>
        <td>${sol.tipo}</td>
        <td>${sol.inicio} a ${sol.fin}</td>
        <td>${sol.estado}</td>
        <td>${sol.motivo}</td>
      `;
      tablaHistorialBody.appendChild(tr);
    });
  }

  function actualizarCalendario() {
    calendario.removeAllEvents();
    historial.filter(s => s.estado === "Aceptado").forEach(sol => {
      calendario.addEvent({
        id: sol.id,
        title: `${sol.funcionario} - ${sol.tipo}`,
        start: sol.inicio,
        end: new Date(new Date(sol.fin).getTime() + 86400000).toISOString().substring(0, 10),
        color: sol.tipo === "Vacaciones" ? "green" : "orange",
      });
    });
  }

  listaSolicitudes.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") {
      const id = Number(e.target.dataset.id);
      const accion = e.target.dataset.accion;
      indiceSolicitudInput.value = id;
      accionSolicitudInput.value = accion;
      motivoRespuesta.value = "";
      motivoRespuesta.classList.remove("is-invalid");
      modalRespuesta.show();
    }
  });

  formRespuesta.addEventListener("submit", e => {
    e.preventDefault();
    const motivo = motivoRespuesta.value.trim();
    if (motivo.length < 5) {
      motivoRespuesta.classList.add("is-invalid");
      motivoRespuesta.focus();
      return;
    }

    const id = Number(indiceSolicitudInput.value);
    const accion = accionSolicitudInput.value;
    const index = solicitudes.findIndex(s => s.id === id);
    if (index === -1) return;

    solicitudes[index].estado = accion === "aceptar" ? "Aceptado" : "Rechazado";
    solicitudes[index].motivo = motivo;

    historial.push(solicitudes[index]);
    solicitudes.splice(index, 1);

    guardarDatos();
    mostrarSolicitudes();
    mostrarHistorial();
    actualizarCalendario();
    modalRespuesta.hide();
  });

  function guardarDatos() {
    solicitudes = ordenarPorFechaInicio(solicitudes);
    historial = ordenarPorFechaInicio(historial);

    localStorage.setItem("solicitudesPermisos", JSON.stringify(solicitudes));
    localStorage.setItem("historialPermisos", JSON.stringify(historial));
  }

  mostrarSolicitudes();
  mostrarHistorial();
  actualizarCalendario();
});
