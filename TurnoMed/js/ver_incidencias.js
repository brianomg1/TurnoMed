document.addEventListener("DOMContentLoaded", function () {
  const tablaIncidencias = document.getElementById("tablaIncidencias");
  const nombreUsuario = document.getElementById("nombreUsuario");

  const usuarioActual = localStorage.getItem("nombreUsuario") || "Funcionario";
  const rol = localStorage.getItem("rolUsuario") || "funcionario"; 

  nombreUsuario.textContent = `Viendo incidencias como: ${usuarioActual}`;

  let incidencias = [];
  try {
    incidencias = JSON.parse(localStorage.getItem("incidencias")) || [];
  } catch {
    incidencias = [];
  }

  if (rol !== "admin") {
    incidencias = incidencias.filter(i => i.funcionario === usuarioActual);
  }

  if (incidencias.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="text-center text-muted">No hay incidencias registradas.</td>`;
    tablaIncidencias.appendChild(tr);
    return;
  }

  const thead = document.querySelector("thead tr");
  const thAccion = document.createElement("th");
  thAccion.textContent = "Acción";
  thead.appendChild(thAccion);

  incidencias.forEach((i, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.fechaHoraReporte}</td>
      <td>${i.funcionario}</td>
      <td>${i.turno.fecha} ${i.turno.hora}</td>
      <td>${i.turno.area}</td>
      <td>${i.categoria}</td>
      <td>${i.descripcion}</td>
    `;

    const tdAccion = document.createElement("td");
    const puedeBorrar = rol === "admin" || i.funcionario === usuarioActual;

    if (puedeBorrar) {
      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn btn-sm btn-outline-danger";
      btnEliminar.textContent = "Eliminar";
      btnEliminar.onclick = () => eliminarIncidencia(index);
      tdAccion.appendChild(btnEliminar);
    } else {
      tdAccion.textContent = "-";
    }

    tr.appendChild(tdAccion);
    tablaIncidencias.appendChild(tr);
  });

  function eliminarIncidencia(indexLocal) {
    if (!confirm("¿Estás seguro de eliminar esta incidencia?")) return;

    let todas = JSON.parse(localStorage.getItem("incidencias")) || [];

    const incidenciaAEliminar = incidencias[indexLocal];
    todas = todas.filter(i =>
      !(
        i.fechaHoraReporte === incidenciaAEliminar.fechaHoraReporte &&
        i.funcionario === incidenciaAEliminar.funcionario &&
        i.turno.fecha === incidenciaAEliminar.turno.fecha &&
        i.turno.hora === incidenciaAEliminar.turno.hora &&
        i.turno.area === incidenciaAEliminar.turno.area
      )
    );

    localStorage.setItem("incidencias", JSON.stringify(todas));
    alert("Incidencia eliminada correctamente.");
    location.reload();
  }

  const contenedorTabla = tablaIncidencias.closest("main");
  const botonera = document.createElement("div");
  botonera.className = "mb-3 text-end";

  const btnExcel = document.createElement("button");
  btnExcel.className = "btn btn-success me-2";
  btnExcel.textContent = "Exportar a Excel";
  btnExcel.onclick = () => exportarExcel(incidencias);

  const btnPDF = document.createElement("button");
  btnPDF.className = "btn btn-danger";
  btnPDF.textContent = "Exportar a PDF";
  btnPDF.onclick = () => exportarPDF(incidencias);

  botonera.appendChild(btnExcel);
  botonera.appendChild(btnPDF);
  contenedorTabla.insertBefore(botonera, contenedorTabla.children[2]);

  function exportarExcel(data) {
    const encabezados = ["Fecha Reporte", "Funcionario", "Fecha Turno", "Hora Turno", "Área", "Categoría", "Descripción"];
    const filas = data.map(i => [
      i.fechaHoraReporte,
      i.funcionario,
      i.turno.fecha,
      i.turno.hora,
      i.turno.area,
      i.categoria,
      i.descripcion,
    ]);
    const hoja = [encabezados, ...filas];
    const ws = XLSX.utils.aoa_to_sheet(hoja);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incidencias");
    XLSX.writeFile(wb, "Incidencias_TurnoMed.xlsx");
  }

  function exportarPDF(data) {
    const doc = new jspdf.jsPDF();
    doc.setFontSize(12);
    doc.text("Incidencias Registradas - TurnoMed", 14, 14);
    const filas = data.map(i => [
      i.fechaHoraReporte,
      i.funcionario,
      `${i.turno.fecha} ${i.turno.hora}`,
      i.turno.area,
      i.categoria,
      i.descripcion,
    ]);
    doc.autoTable({
      head: [["Fecha Reporte", "Funcionario", "Turno", "Área", "Categoría", "Descripción"]],
      body: filas,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
    });
    doc.save("Incidencias_TurnoMed.pdf");
  }
});
