document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("graficoTurnos").getContext("2d");
  const periodoSelect = document.getElementById("periodoSelect");

  const datosEjemplo = {
    mensual: {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      asistidos: [12, 15, 10, 18, 14, 20, 22, 19, 17, 13, 16, 18],
      autorizados: [3, 4, 5, 3, 6, 7, 6, 4, 5, 6, 7, 8],
      noAutorizados: [1, 0, 2, 1, 0, 1, 2, 3, 1, 0, 1, 2],
    },
    semestral: {
      labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"],
      asistidos: [45, 60, 50, 55, 65, 70],
      autorizados: [10, 15, 12, 14, 18, 20],
      noAutorizados: [3, 2, 4, 1, 3, 2],
    },
    anual: {
      labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
      asistidos: [500, 550, 600, 620, 580, 610],
      autorizados: [150, 160, 180, 175, 160, 170],
      noAutorizados: [30, 25, 20, 22, 19, 15],
    }
  };

  let chart;

  function crearGrafico(periodo) {
    const data = datosEjemplo[periodo];

    const datasets = [
      {
        label: "Turnos Asistidos",
        data: data.asistidos,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Turnos Cambiados Autorizados",
        data: data.autorizados,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Turnos Cambiados No Autorizados",
        data: data.noAutorizados,
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ];

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10
            }
          }
        },
        plugins: {
          legend: { position: "top" },
          title: {
            display: true,
            text: `Estadísticas de Turnos (${periodo.charAt(0).toUpperCase() + periodo.slice(1)})`,
            padding: { top: 10, bottom: 10 }
          },
        },
      },
    });
  }

  crearGrafico("mensual");

  periodoSelect.addEventListener("change", () => {
    crearGrafico(periodoSelect.value);
  });
});
