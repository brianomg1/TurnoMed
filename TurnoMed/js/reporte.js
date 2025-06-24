document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formReporte');
  const tabla = document.getElementById('tablaReporte');
  const tbody = tabla.querySelector('tbody');
  const alertaDiv = document.getElementById('alertaInasistencias');
  const btnExcel = document.getElementById('exportarExcel');
  const btnPDF = document.getElementById('exportarPDF');

  function generarDatosAnuales() {
    const funcionarios = [
      { nombre: "Juan Pérez", area: "Urgencias" },
      { nombre: "María López", area: "Pediatría" },
      { nombre: "Carlos Gómez", area: "Traumatología" }
    ];

    const datos = [];
    const inicio = new Date("2025-01-01");
    const fin = new Date("2025-12-31");

    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      funcionarios.forEach(func => {
        const presente = Math.random() > 0.2; 
        const entrada = presente ? "08:00" : "";
        const salida = presente ? "17:00" : "";

        datos.push({
          funcionario: func.nombre,
          area: func.area,
          fecha: d.toISOString().slice(0, 10),
          entrada,
          salida,
          presente
        });
      });
    }

    return datos;
  }

  const datosAsistencia = generarDatosAnuales();

  let reporteActual = [];

  function calcularHoras(entrada, salida) {
    if (!entrada || !salida) return 0;
    const [hE, mE] = entrada.split(":").map(Number);
    const [hS, mS] = salida.split(":").map(Number);
    const inicio = hE + mE / 60;
    const fin = hS + mS / 60;
    return Math.max(0, (fin - inicio)).toFixed(2);
  }

  function generarReporte(fechaInicio, fechaFin, personaSeleccionada) {
    tbody.innerHTML = "";
    alertaDiv.innerHTML = "";
    reporteActual = [];

    const reportesFiltrados = datosAsistencia.filter(d => {
      const dentroRango = d.fecha >= fechaInicio && d.fecha <= fechaFin;
      const coincidePersona = !personaSeleccionada || d.funcionario === personaSeleccionada;
      return dentroRango && coincidePersona;
    });

    const inasistenciasPorFuncionario = {};

    for (const reg of reportesFiltrados) {
      if (!inasistenciasPorFuncionario[reg.funcionario]) {
        inasistenciasPorFuncionario[reg.funcionario] = 0;
      }
      if (!reg.presente) {
        inasistenciasPorFuncionario[reg.funcionario]++;
      }

      const horas = calcularHoras(reg.entrada, reg.salida);

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${reg.funcionario}</td>
        <td>${reg.area}</td>
        <td>${reg.fecha}</td>
        <td>${reg.entrada || '-'}</td>
        <td>${reg.salida || '-'}</td>
        <td>${horas}</td>
      `;
      tbody.appendChild(fila);

      reporteActual.push({
        Funcionario: reg.funcionario,
        Área: reg.area,
        Fecha: reg.fecha,
        "Hora Entrada": reg.entrada || '-',
        "Hora Salida": reg.salida || '-',
        "Horas Trabajadas": horas
      });
    }

    tabla.style.display = reportesFiltrados.length ? "table" : "none";

    for (const nombre in inasistenciasPorFuncionario) {
      if (inasistenciasPorFuncionario[nombre] > 5) {
        const alerta = document.createElement('p');
        alerta.textContent = `⚠️ ${nombre} tiene más de 5 inasistencias (${inasistenciasPorFuncionario[nombre]}).`;
        alertaDiv.appendChild(alerta);
      }
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inicio = form.fechaInicio.value;
    const fin = form.fechaFin.value;
    const persona = form.personaSelect.value;

    if (!inicio || !fin) {
      alert("Por favor completa ambas fechas.");
      return;
    }
    if (inicio > fin) {
      alert("La fecha inicio no puede ser mayor que la fecha fin.");
      return;
    }

    generarReporte(inicio, fin, persona);
  });

  btnExcel.addEventListener('click', () => {
    if (!reporteActual.length) return alert("Primero genera un reporte.");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reporteActual);
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `Reporte_TurnoMed_${new Date().toISOString().slice(0,10)}.xlsx`);
  });

  btnPDF.addEventListener('click', () => {
    if (!reporteActual.length) return alert("Primero genera un reporte.");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de Asistencia - TurnoMed", 14, 20);

    const columnas = ["Funcionario", "Área", "Fecha", "Hora Entrada", "Hora Salida", "Horas Trabajadas"];
    const filas = reporteActual.map(r => [r.Funcionario, r.Área, r.Fecha, r["Hora Entrada"], r["Hora Salida"], r["Horas Trabajadas"]]);

    doc.autoTable({
      head: [columnas],
      body: filas,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] }
    });

    doc.save(`Reporte_TurnoMed_${new Date().toISOString().slice(0,10)}.pdf`);
  });
});
