document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formReporte");
  const tablaBody = document.querySelector("#tablaReporte tbody");
  const alertaInasistencia = document.getElementById("alertaInasistencia");
  const btnExportarPDF = document.getElementById("btnExportarPDF");
  const btnExportarExcel = document.getElementById("btnExportarExcel");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inicio = document.getElementById("fechaInicio").value;
    const fin = document.getElementById("fechaFin").value;

    if (inicio > fin) {
      alert("La fecha de inicio no puede ser posterior a la fecha final.");
      return;
    }

    const data = await obtenerDatosSimulados(inicio, fin);
    tablaBody.innerHTML = "";
    let inasistenciasPorFuncionario = {};

    data.forEach(registro => {
      const tr = document.createElement("tr");

      const horasTrabajadas = calcularHoras(registro.entrada, registro.salida);
      const inasistencia = registro.entrada === null || registro.salida === null;

      tr.innerHTML = `
        <td>${registro.nombre}</td>
        <td>${registro.fecha}</td>
        <td>${registro.entrada || "-"}</td>
        <td>${registro.salida || "-"}</td>
        <td>${inasistencia ? "0" : horasTrabajadas}</td>
        <td>${inasistencia ? "Sí" : "No"}</td>
      `;

      tablaBody.appendChild(tr);

      if (inasistencia) {
        inasistenciasPorFuncionario[registro.nombre] = (inasistenciasPorFuncionario[registro.nombre] || 0) + 1;
      }
    });

    let notificaciones = Object.entries(inasistenciasPorFuncionario)
      .filter(([_, count]) => count > 5)
      .map(([nombre, count]) => `⚠️ ${nombre} tiene ${count} inasistencias.`);

    if (notificaciones.length > 0) {
      alertaInasistencia.classList.remove("d-none");
      alertaInasistencia.innerHTML = notificaciones.join("<br>");
    } else {
      alertaInasistencia.classList.add("d-none");
      alertaInasistencia.innerHTML = "";
    }

    if (data.length > 0) {
      btnExportarPDF.disabled = false;
      btnExportarExcel.disabled = false;
    } else {
      btnExportarPDF.disabled = true;
      btnExportarExcel.disabled = true;
    }
  });

  function calcularHoras(horaInicio, horaFin) {
    if (!horaInicio || !horaFin) return 0;
    const [h1, m1] = horaInicio.split(":").map(Number);
    const [h2, m2] = horaFin.split(":").map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if(diff < 0) diff = 0;
    return (diff / 60).toFixed(2);
  }

  async function obtenerDatosSimulados(inicio, fin) {

    const fechas = generarFechasEntre(inicio, fin);

    const funcionarios = [
      "Juan Pérez",
      "Ana Torres",
      "Luis Rojas"
    ];

    const data = [];

    fechas.forEach(fecha => {
      funcionarios.forEach(nombre => {
        const inasistencia = Math.random() < 0.15; 
        if (inasistencia) {
          data.push({ nombre, fecha, entrada: null, salida: null });
        } else {
          const horaEntrada = generarHoraAleatoria(7, 9, 30);
          const horaSalida = sumarHoras(horaEntrada, 8);
          data.push({ nombre, fecha, entrada: horaEntrada, salida: horaSalida });
        }
      });
    });

    return data;
  }


  function generarFechasEntre(inicio, fin) {
    const fechas = [];
    let fechaActual = new Date(inicio);
    const fechaFin = new Date(fin);

    while (fechaActual <= fechaFin) {
      fechas.push(fechaActual.toISOString().slice(0, 10));
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    return fechas;
  }

  function generarHoraAleatoria(hMin, hMax, mMax) {
    const hora = Math.floor(Math.random() * (hMax - hMin + 1)) + hMin;
    const minuto = Math.floor(Math.random() * (mMax + 1));
    return `${String(hora).padStart(2,"0")}:${String(minuto).padStart(2,"0")}`;
  }

  function sumarHoras(horaStr, horasSumar) {
    const [h, m] = horaStr.split(":").map(Number);
    let totalMinutos = h * 60 + m + horasSumar * 60;
    let hFinal = Math.floor(totalMinutos / 60);
    let mFinal = totalMinutos % 60;
    if (hFinal >= 24) hFinal = hFinal - 24;
    return `${String(hFinal).padStart(2,"0")}:${String(mFinal).padStart(2,"0")}`;
  }

  document.getElementById("btnExportarPDF").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Reporte de Asistencia", 14, 16);

    const head = [["Funcionario", "Fecha", "Entrada", "Salida", "Horas Trabajadas", "Inasistencia"]];
    const body = [];

    document.querySelectorAll("#tablaReporte tbody tr").forEach(row => {
      const rowData = Array.from(row.children).map(td => td.textContent.trim());
      body.push(rowData);
    });

    doc.autoTable({
      head: head,
      body: body,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [13, 110, 253] }
    });

    doc.save("reporte_asistencia.pdf");
  });

  document.getElementById("btnExportarExcel").addEventListener("click", () => {
    const wb = XLSX.utils.book_new();
    const ws_data = [
      ["Funcionario", "Fecha", "Entrada", "Salida", "Horas Trabajadas", "Inasistencia"]
    ];

    document.querySelectorAll("#tablaReporte tbody tr").forEach(row => {
      const rowData = Array.from(row.children).map(td => td.textContent.trim());
      ws_data.push(rowData);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "reporte_asistencia.xlsx");
  });
});
