document.addEventListener("DOMContentLoaded", function () {
  const listaTurnos = document.getElementById("listaTurnos");
  const formSeccion = document.getElementById("formSeccion");
  const formIncidencia = document.getElementById("formIncidencia");
  const descripcion = document.getElementById("descripcion");
  const categoria = document.getElementById("categoria");
  const mensajeRespuesta = document.getElementById("mensajeRespuesta");
  const cancelarBtn = document.getElementById("cancelarBtn");

  let turnoSeleccionado = null;
  const nombreFuncionario = "Juan Pérez"; 
  

  const turnos = generarTurnosRecientes();

  function generarTurnosRecientes() {
    const hoy = new Date();
    return [0, 1, 2].map((i) => {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      return {
        id: i + 1,
        fecha: fecha.toISOString().split("T")[0],
        hora: "08:00 - 16:00",
        area: ["Urgencias", "Pediatría", "UCI"][i],
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
      });
      listaTurnos.appendChild(li);
    });
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

    const datosIncidencia = {
      descripcion: descripcion.value.trim(),
      categoria: categoria.value,
      fechaHoraReporte: new Date().toLocaleString(),
      funcionario: nombreFuncionario,
      turno: turnoSeleccionado,
    };

    console.log("Incidencia enviada:", datosIncidencia); 

    mensajeRespuesta.className = "alert alert-success mt-3";
    mensajeRespuesta.textContent = "Incidencia enviada correctamente al coordinador.";
    mensajeRespuesta.classList.remove("d-none");
    formIncidencia.reset();
    formSeccion.style.display = "none";
    turnoSeleccionado = null;
  });

  mostrarTurnos();

  document.addEventListener('DOMContentLoaded', () => {
  const nombre = localStorage.getItem("nombreUsuario");
  const nombreEl = document.getElementById("nombreUsuarioActual");

  if (nombre && nombreEl) {
    nombreEl.textContent = `Hola, ${nombre}`;
  }
});

});
