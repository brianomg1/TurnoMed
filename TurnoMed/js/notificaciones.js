document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formNotificacion");
  const alerta = document.getElementById("alertaResultado");
  const tablaHistorial = document.getElementById("tablaHistorial");

  let notificaciones = JSON.parse(localStorage.getItem("notificacionesProgramadas")) || [];

  mostrarHistorial();
  checkEnvios();
  setInterval(checkEnvios, 30000); 

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const grupo = document.getElementById("grupoUsuarios").value;
    const mensaje = document.getElementById("mensajeNotificacion").value.trim();
    const fecha = document.getElementById("fechaProgramacion").value;
    const hora = document.getElementById("horaProgramacion").value;

    if (!grupo || !mensaje || !fecha || !hora) {
      mostrarAlerta("Por favor, complete todos los campos.", "danger");
      return;
    }

    const fechaHora = new Date(`${fecha}T${hora}`);
    const ahora = new Date();

    if (fechaHora <= ahora) {
      mostrarAlerta("La fecha y hora de envío deben ser futuras.", "warning");
      return;
    }

    const nueva = {
      grupo,
      mensaje,
      fecha,
      hora,
      enviada: false
    };

    notificaciones.push(nueva);
    localStorage.setItem("notificacionesProgramadas", JSON.stringify(notificaciones));

    mostrarAlerta(" Notificación programada con éxito. Se enviará a través del sistema y correo electrónico.", "success");
    form.reset();
    mostrarHistorial();
  });

  function mostrarAlerta(texto, tipo) {
    alerta.textContent = texto;
    alerta.className = `alert alert-${tipo} mt-4`;
    alerta.classList.remove("d-none");
    setTimeout(() => alerta.classList.add("d-none"), 5000);
  }

  function mostrarHistorial() {
    tablaHistorial.innerHTML = "";
    if (notificaciones.length === 0) {
      tablaHistorial.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay notificaciones programadas.</td></tr>`;
      return;
    }

    notificaciones.slice().reverse().forEach(n => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${n.grupo}</td>
        <td>${n.mensaje}</td>
        <td>${n.fecha}</td>
        <td>${n.hora}</td>
        <td><span class="badge bg-${n.enviada ? "success" : "secondary"}">${n.enviada ? "Enviada" : "Pendiente"}</span></td>
      `;
      tablaHistorial.appendChild(tr);
    });
  }

  function checkEnvios() {
    const ahora = new Date();
    let actualizada = false;

    notificaciones.forEach(n => {
      if (!n.enviada) {
        const programada = new Date(`${n.fecha}T${n.hora}`);
        if (programada <= ahora) {
          console.log(` Notificación enviada a ${n.grupo}: ${n.mensaje}`);
          n.enviada = true;
          actualizada = true;
        }
      }
    });

    if (actualizada) {
      localStorage.setItem("notificacionesProgramadas", JSON.stringify(notificaciones));
      mostrarHistorial();
    }
  }
});
