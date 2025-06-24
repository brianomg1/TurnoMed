const datosSueldos = {
  2023: [
    { mes: 0, horas: 150, valorHora: 1400 },
    { mes: 1, horas: 160, valorHora: 1400 },
    { mes: 2, horas: 155, valorHora: 1400 },
    { mes: 3, horas: 158, valorHora: 1400 },
    { mes: 4, horas: 162, valorHora: 1400 },
    { mes: 5, horas: 150, valorHora: 1400 },
    { mes: 6, horas: 148, valorHora: 1400 },
    { mes: 7, horas: 155, valorHora: 1400 },
    { mes: 8, horas: 160, valorHora: 1400 },
    { mes: 9, horas: 158, valorHora: 1400 },
    { mes: 10, horas: 154, valorHora: 1400 },
    { mes: 11, horas: 160, valorHora: 1400 },
  ],
  2024: [
    { mes: 0, horas: 160, valorHora: 1450 },
    { mes: 1, horas: 155, valorHora: 1450 },
    { mes: 2, horas: 162, valorHora: 1450 },
    { mes: 3, horas: 160, valorHora: 1450 },
    { mes: 4, horas: 165, valorHora: 1450 },
    { mes: 5, horas: 158, valorHora: 1450 },
    { mes: 6, horas: 160, valorHora: 1450 },
    { mes: 7, horas: 162, valorHora: 1450 },
    { mes: 8, horas: 168, valorHora: 1450 },
    { mes: 9, horas: 160, valorHora: 1450 },
    { mes: 10, horas: 163, valorHora: 1450 },
    { mes: 11, horas: 165, valorHora: 1450 },
  ],
  2025: [
    { mes: 0, horas: 165, valorHora: 1500 },
    { mes: 1, horas: 160, valorHora: 1500 },
    { mes: 2, horas: 168, valorHora: 1500 },
    { mes: 3, horas: 170, valorHora: 1500 },
    { mes: 4, horas: 172, valorHora: 1500 },
    { mes: 5, horas: 168, valorHora: 1500 },
  ]
};

const mesesNombres = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const selectAno = document.getElementById('selectAno');
const selectMes = document.getElementById('selectMes');
const tablaSueldos = document.getElementById('tabla-sueldos');
const ctx = document.getElementById('graficoSueldos').getContext('2d');
const btnExportar = document.getElementById('btnExportar');
const btnImprimir = document.getElementById('btnImprimir');

let chart = null;

function llenarSelectAnios() {
  const años = [2023, 2024, 2025];
  años.forEach(año => {
    const option = document.createElement('option');
    option.value = año;
    option.textContent = año;
    selectAno.appendChild(option);
  });
  selectAno.value = 2024; 
}

function actualizarSelectMeses(año) {
  const datosAño = datosSueldos[año];
  const mesesDisponibles = datosAño ? datosAño.map(d => d.mes) : [];

  selectMes.innerHTML = '';

  const optionTodos = document.createElement('option');
  optionTodos.value = -1;
  optionTodos.textContent = 'Todos';
  selectMes.appendChild(optionTodos);

  for(let m=0; m < 12; m++) {
    if(mesesDisponibles.includes(m)) {
      const option = document.createElement('option');
      option.value = m;
      option.textContent = mesesNombres[m];
      selectMes.appendChild(option);
    }
  }
  selectMes.value = -1;
}

function mostrarDetalleSueldo(año, mes) {
  tablaSueldos.innerHTML = '';
  const datosAño = datosSueldos[año];
  if(!datosAño) {
    tablaSueldos.innerHTML = `<tr><td colspan="4">No hay datos para el año ${año}</td></tr>`;
    return;
  }
  if(mes === -1) {
    // Todos meses disponibles
    datosAño.forEach(d => {
      const sueldo = d.horas * d.valorHora;
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${mesesNombres[d.mes]}</td>
        <td>${d.horas}</td>
        <td>$${d.valorHora.toLocaleString()}</td>
        <td>$${sueldo.toLocaleString()}</td>
      `;
      tablaSueldos.appendChild(fila);
    });
  } else {
    const d = datosAño.find(x => x.mes === mes);
    if(!d) {
      tablaSueldos.innerHTML = `<tr><td colspan="4">No hay datos para ${mesesNombres[mes]} ${año}</td></tr>`;
      return;
    }
    const sueldo = d.horas * d.valorHora;
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${mesesNombres[d.mes]}</td>
      <td>${d.horas}</td>
      <td>$${d.valorHora.toLocaleString()}</td>
      <td>$${sueldo.toLocaleString()}</td>
    `;
    tablaSueldos.appendChild(fila);
  }
}

function mostrarGraficoBarras(año) {
  const datosAño = datosSueldos[año];
  if(!datosAño) return;

  const labels = mesesNombres;
  const sueldos = [];

  for(let m=0; m < 12; m++) {
    const d = datosAño.find(x => x.mes === m);
    sueldos.push(d ? d.horas * d.valorHora : 0);
  }

  if(chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: `Sueldo mensual ${año}`,
        data: sueldos,
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: val => '$' + val.toLocaleString()
          }
        }
      },
      plugins: {
        legend: { display: true, position: 'top' }
      }
    }
  });
}

function exportarExcel() {
  let csv = 'Mes,Horas,Valor Hora,Sueldo\n';
  const filas = tablaSueldos.querySelectorAll('tr');
  filas.forEach(fila => {
    const cols = fila.querySelectorAll('td');
    if(cols.length === 4){
      const linea = Array.from(cols).map(td => td.textContent.replace(/\$/g, '').replace(/\./g, '')).join(',');
      csv += linea + '\n';
    }
  });

  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sueldos.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function imprimir() {
  const contenido = document.querySelector('.container').innerHTML;
  const ventanaImpresion = window.open('', '', 'width=800,height=600');
  ventanaImpresion.document.write(`
    <html>
      <head>
        <title>Imprimir sueldo</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px;}
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center;}
        </style>
      </head>
      <body>
        ${contenido}
      </body>
    </html>
  `);
  ventanaImpresion.document.close();
  ventanaImpresion.focus();
  ventanaImpresion.print();
  ventanaImpresion.close();
}

selectAno.addEventListener('change', () => {
  const año = parseInt(selectAno.value);
  actualizarSelectMeses(año);
  mostrarDetalleSueldo(año, -1);
  mostrarGraficoBarras(año);
});
selectMes.addEventListener('change', () => {
  const año = parseInt(selectAno.value);
  const mes = parseInt(selectMes.value);
  mostrarDetalleSueldo(año, mes);
});
btnExportar.addEventListener('click', exportarExcel);
btnImprimir.addEventListener('click', imprimir);

llenarSelectAnios();
const añoInicial = parseInt(selectAno.value);
actualizarSelectMeses(añoInicial);
mostrarDetalleSueldo(añoInicial, -1);
mostrarGraficoBarras(añoInicial);
