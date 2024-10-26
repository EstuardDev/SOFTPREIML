document.addEventListener('DOMContentLoaded', function () {
    const formPerfil = document.getElementById('form-perfil');
    // const formUsuariosGrupos = document.getElementById('form-usuarios-grupos');
    const btnCancelar = document.getElementById('btnCancelar');
    // const selectUsuario = document.getElementById('usuario');
    // const selectGrupo = document.getElementById('grupo');

    // Manejar el envío del formulario de perfil
    formPerfil.addEventListener('submit', function (e) {
        e.preventDefault(); // Evita el envío normal del formulario

        const formData = new FormData(formPerfil);
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        fetch(formPerfil.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: 'Muy bien!',
                    text: data.message,
                    icon: 'success',
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    title: '¡Atención!',
                    text: data.message,
                    icon: 'warning',
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: '¡Error!',
                text: 'Ocurrió un problema al enviar la solicitud.',
                icon: 'error',
            });
        });
    });

    // Manejar el botón cancelar
    btnCancelar.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = "/inicio"; // Redirige a la página de inicio
    });

    // Manejar la selección del usuario para actualizar el grupo
   /* selectUsuario.addEventListener('change', function () {
        const usuarioId = this.value;

        if (usuarioId) {
            fetch(`/obtener-grupo-usuario/?usuario_id=${usuarioId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Limpiar el select de grupo
                        selectGrupo.innerHTML = '';

                        // Añadir los grupos disponibles
                        data.grupos_disponibles.forEach(grupo => {
                            const option = document.createElement('option');
                            option.value = grupo.id;
                            option.textContent = grupo.name;

                            // Seleccionar el grupo actual
                            if (grupo.name === data.grupo_actual) {
                                option.selected = true;
                            }

                            selectGrupo.appendChild(option);
                        });
                    } else {
                        console.error(data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }); */

    // Manejar el envío del formulario para actualizar el grupo del usuario
   /* formUsuariosGrupos.addEventListener('submit', function (e) {
        e.preventDefault(); // Evita el envío normal del formulario

        const formData = new FormData(formUsuariosGrupos);
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        fetch(formUsuariosGrupos.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: '¡Muy bien!',
                    text: data.message,
                    icon: 'success',
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    title: '¡Atención!',
                    text: data.message,
                    icon: 'warning',
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: '¡Error!',
                text: 'Ocurrió un problema al enviar la solicitud.',
                icon: 'error',
            });
        });
    }); */
});
