let usuarios = [];
try {
  usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  if (!Array.isArray(usuarios)) usuarios = [];
} catch (e) {
  usuarios = [];
}

const formUsuario = document.getElementById('formUsuario');
const tablaUsuarios = document.getElementById('tablaUsuarios');
const btnCancelar = document.getElementById('btnCancelar');

const inputId = document.getElementById('usuarioId');
const inputRut = document.getElementById('rut');
const inputNombre = document.getElementById('nombre');
const inputCorreo = document.getElementById('correo');
const inputContrasena = document.getElementById('contrasena');
const inputCargo = document.getElementById('cargo');
const inputArea = document.getElementById('area');
const selectRol = document.getElementById('rol');

function renderizarUsuarios() {
  tablaUsuarios.innerHTML = '';
  if (usuarios.length === 0) {
    tablaUsuarios.innerHTML = `<tr><td colspan="7">No hay usuarios registrados.</td></tr>`;
    return;
  }
  usuarios.forEach((usuario, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario.rut}</td>
      <td>${usuario.nombre}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.cargo}</td>
      <td>${usuario.area}</td>
      <td>${usuario.rol}</td>
      <td>
        <button class="accion editar" data-index="${index}">Editar</button>
        <button class="accion eliminar" data-index="${index}">Eliminar</button>
      </td>
    `;
    tablaUsuarios.appendChild(tr);
  });
}

function guardarUsuario(e) {
  e.preventDefault();
  let id = inputId.value;
  const nuevoUsuario = {
    rut: inputRut.value.trim(),
    nombre: inputNombre.value.trim(),
    correo: inputCorreo.value.trim(),
    contrasena: inputContrasena.value.trim(),
    cargo: inputCargo.value.trim(),
    area: inputArea.value.trim(),
    rol: selectRol.value
  };

  if (!nuevoUsuario.rut || !nuevoUsuario.nombre || !nuevoUsuario.correo || !nuevoUsuario.cargo || !nuevoUsuario.area) {
    alert('Por favor complete todos los campos obligatorios.');
    return;
  }
  if (id === '' && !nuevoUsuario.contrasena) {
    alert('La contraseña es obligatoria para un nuevo usuario.');
    return;
  }

  if (id === '') {
    usuarios.push(nuevoUsuario);
  } else {
    id = Number(id);
    if (id >= 0 && id < usuarios.length) {
      if (!nuevoUsuario.contrasena) {
        nuevoUsuario.contrasena = usuarios[id].contrasena;
      }
      usuarios[id] = nuevoUsuario;
    } else {
      alert('Error: índice de usuario no válido');
      return;
    }
  }
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  resetFormulario();
  renderizarUsuarios();
}

function editarUsuario(index) {
  const usuario = usuarios[index];
  inputId.value = index;
  inputRut.value = usuario.rut;
  inputNombre.value = usuario.nombre;
  inputCorreo.value = usuario.correo;
  inputCargo.value = usuario.cargo;
  inputArea.value = usuario.area;
  selectRol.value = usuario.rol;
  inputContrasena.value = ''; 
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function eliminarUsuario(index) {
  if (confirm('¿Está seguro que desea eliminar este usuario?')) {
    usuarios.splice(index, 1);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    renderizarUsuarios();
  }
}

function resetFormulario() {
  formUsuario.reset();
  inputId.value = '';
}

formUsuario.addEventListener('submit', guardarUsuario);
btnCancelar.addEventListener('click', resetFormulario);
tablaUsuarios.addEventListener('click', (e) => {
  if (e.target.classList.contains('editar')) {
    const index = e.target.getAttribute('data-index');
    editarUsuario(index);
  } else if (e.target.classList.contains('eliminar')) {
    const index = e.target.getAttribute('data-index');
    eliminarUsuario(index);
  }
});

renderizarUsuarios();
