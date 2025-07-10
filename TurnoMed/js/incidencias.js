document.addEventListener("DOMContentLoaded", function () {
  const listaTurnos = document.getElementById("listaTurnos");
  const formSeccion = document.getElementById("formSeccion");
  const formIncidencia = document.getElementById("formIncidencia");
  const descripcion = document.getElementById("descripcion");
  const categoria = document.getElementById("categoria");
  const mensajeRespuesta = document.getElementById("mensajeRespuesta");
  const cancelarBtn = document.getElementById("cancelarBtn");

  let turnoSeleccionado = null;

  const nombreFuncionario = localStorage.getItem("nombreUsuario") || "Funcionario";
  const saludoUsuario = document.getElementById("nombreUsuarioActual");
  if (saludoUsuario) saludoUsuario.textContent = "Hola, " + nombreFuncionario;

  const HORARIOS = ["08:00 - 16:00", "16:00 - 00:00", "00:00 - 08:00"];
  const AREAS = ["Urgencias", "Pediatría", "UCI"];

  function generarTurnosRecientes() {
    return Array.from({ length: 3 }, (_, i) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      return {
        id: (i + 1).toString(),
        fecha: fecha.toISOString().split("T")[0],
        hora: HORARIOS[i % HORARIOS.length],
        area: AREAS[i % AREAS.length],
      };
    });
  }

  function mostrarTurnos() {
    listaTurnos.innerHTML = "";
    turnos.forEach((turno) => {
      const li = document.createElement("li");
      li.className = "list-group-item list-group-item-action";
      li.textContent = `${turno.fecha} - ${turno.hora} - Área: ${turno.area}`;
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        turnoSeleccionado = turno;
        formSeccion.style.display = "block";
        mensajeRespuesta.classList.add("d-none");
        window.scrollTo({ top: formSeccion.offsetTop, behavior: "smooth" });
        mostrarResumenTurno(turno);
      });
      listaTurnos.appendChild(li);
    });
  }

  function mostrarResumenTurno(turno) {
    let resumen = document.getElementById("resumenTurno");
    if (!resumen) {
      resumen = document.createElement("div");
      resumen.id = "resumenTurno";
      resumen.className = "alert alert-info";
      formSeccion.insertBefore(resumen, formIncidencia);
    }
    resumen.textContent = `Reportando incidencia para el turno: ${turno.fecha} - ${turno.hora} - Área: ${turno.area}`;
  }

  function obtenerTurnoDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const fecha = params.get("fecha");
    const hora = params.get("hora");
    const area = params.get("area");
    if (id && fecha && hora && area) {
      return { id, fecha, hora, area };
    }
    return null;
  }

  const turnos = generarTurnosRecientes();
  const turnoURL = obtenerTurnoDesdeURL();

  if (turnoURL) {
    listaTurnos.style.display = "none";
    turnoSeleccionado = turnoURL;
    formSeccion.style.display = "block";
    mensajeRespuesta.classList.add("d-none");
    mostrarResumenTurno(turnoSeleccionado);
  } else {
    mostrarTurnos();
  }

  cancelarBtn.addEventListener("click", () => {
    formSeccion.style.display = "none";
    formIncidencia.reset();
    turnoSeleccionado = null;
  });

  formIncidencia.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!turnoSeleccionado) {
      alert("Debe seleccionar un turno primero.");
      return;
    }

    if (!descripcion.value.trim()) {
      alert("La descripción es obligatoria.");
      return;
    }

    if (!categoria.value) {
      alert("La categoría es obligatoria.");
      return;
    }

    const datosIncidencia = {
      descripcion: descripcion.value.trim(),
      categoria: categoria.value,
      fechaHoraReporte: new Date().toLocaleString(),
      funcionario: nombreFuncionario,
      turno: turnoSeleccionado,
    };

    let incidencias = [];
    try {
      incidencias = JSON.parse(localStorage.getItem("incidencias")) || [];
    } catch {
      incidencias = [];
    }
    incidencias.push(datosIncidencia);
    localStorage.setItem("incidencias", JSON.stringify(incidencias));

    console.log("Incidencia enviada:", datosIncidencia);

    mensajeRespuesta.className = "alert alert-success mt-3";
    mensajeRespuesta.textContent = "Incidencia enviada correctamente al coordinador.";
    mensajeRespuesta.classList.remove("d-none");

    formIncidencia.reset();
    formSeccion.style.display = "none";
    turnoSeleccionado = null;
  });
});
