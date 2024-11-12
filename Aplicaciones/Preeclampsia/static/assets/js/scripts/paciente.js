document.addEventListener('DOMContentLoaded', function () {

    const formPaciente = document.getElementById('form-Paciente');
    const btnLimpiar = formPaciente.querySelector('.btnLimpiar');
    const btnEliminar = document.querySelectorAll(".btnEliminar");
    const btnEditar = document.querySelectorAll(".btnEditar");
    const btnActivar = document.querySelectorAll(".btnActivar");
    const filtroDniNombre = document.getElementById('filtroDni');
    const filtroEstado = document.getElementById('filtroEstado');
    const filtroHistoriaC = document.getElementById('filtroHistoriaC'); 

    const dniInput = document.getElementById('txtdni');
    const nombreInput = document.getElementById('txtnombre');
    const apellidoInput = document.getElementById('txtapellido');
    const edadInput = document.getElementById('txtedad');
    const ngestacionInput = document.getElementById('txtnumgestacion');

    const editNombreInput = document.getElementById('txteditnombre');
    const editApellidoInput = document.getElementById('txteditapellido');
    const editEdadInput = document.getElementById('txteditedad');
    const editNgestacionInput = document.getElementById('txteditngestacion');

    let isSubmitting = false;

    const validateDNI = () => {
        const dni = dniInput.value.trim();
        if (dni.length !== 8) {
            showWarning('El DNI debe tener 8 dígitos.');
            isSubmitting = false;
            return false;
        }
        if (!/^\d+$/.test(dni)) {
            showWarning('Por favor, ingresa un DNI válido (solo números).');
            isSubmitting = false;
            return false;
        }
        if (/^(\d)\1+$/.test(dni)) { 
            showWarning('El DNI no puede contener dígitos repetidos. Ingrese un DNI válido.');
            isSubmitting = false;
            return false;
        }
        return true;
    };

    const validateNombre = () => {
        const nombre = nombreInput.value.trim();
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre)) {
            showWarning('El nombre solo puede contener letras y espacios. Por favor, verifica tu nombre.');
            isSubmitting = false;
            return false;
        }
        return true;
    };

    const validateApellidos = () => {
        const apellidos = apellidoInput.value.trim();
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(apellidos)) {
            showWarning('Los apellidos solo pueden contener letras y espacios. Por favor, verifica tus apellidos.');
            isSubmitting = false;
            return false;
        }
        return true;
    };

    const validateEdad = () => {
        const edad = edadInput.value.trim();
        if (!/^\d+$/.test(edad)) {
            showWarning('La edad debe ser un número. Por favor, ingresa una edad válida.');
            isSubmitting = false;
            return false;
        }
        const edadNum = parseInt(edad, 10);
        if (edadNum < 10 || edadNum > 100) {
            showWarning('La edad debe estar entre 10 y 100 años.');
            isSubmitting = false;
            return false;
        }
        return true;
    };

    const validateNumGestacion = () => {
        const ngestacion = ngestacionInput.value.trim();
        if (!/^\d+$/.test(ngestacion)) {
            showWarning('El número de gestaciones debe ser un número entero.');
            isSubmitting = false;
            return false;
        }
        const ngestacionNum = parseInt(ngestacion, 10);
        if (ngestacionNum < 20) {
            showWarning('El número de semanas de gestación no puede ser menor a 20.');
            isSubmitting = false;
            return false;
        }
        return true;
    };

    const validateEditNombre = () => {
        const nombre = editNombreInput.value.trim();
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre)) {
            showWarning('El nombre solo puede contener letras y espacios. Por favor, verifica tu nombre.');
            isSubmitting = false;
            return false;
        }
        return true;
    };

    const validateEditApellidos = () => {
        const apellidos = editApellidoInput.value.trim();
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(apellidos)) {
            showWarning('Los apellidos solo pueden contener letras y espacios. Por favor, verifica tus apellidos.');
            isSubmitting = false;
            return false;
        }
        return true;
    };

    const validateEditEdad = () => {
        const edad = editEdadInput.value.trim();
        if (!/^\d+$/.test(edad)) {
            showWarning('La edad debe ser un número. Por favor, ingresa una edad válida.');
            isSubmitting = false;
            return false;
        }
        const edadNum = parseInt(edad, 10);
        if (edadNum < 10 || edadNum > 100) {
            showWarning('La edad debe estar entre 10 y 100 años.');
            isSubmitting = false;
            return false;
        }
        return true;
    };

    const validateEditNumGestacion = () => {
        const ngestacion = editNgestacionInput.value.trim();
        if (!/^\d+$/.test(ngestacion)) {
            showWarning('El número de gestaciones debe ser un número entero.');
            isSubmitting = false;
            return false;
        }
        const ngestacionNum = parseInt(ngestacion, 10);
        if (ngestacionNum < 20) {
            showWarning('El número de semanas de gestación no puede ser menor a 20.');
            isSubmitting = false;
            return false;
        }
        return true;
    };

    const showWarning = (message) => {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: message,
        });
    };

    const validarFormRegistro = () => {
        return validateDNI() && validateNombre() && validateApellidos() && validateEdad() && validateNumGestacion();
    };

    const validarFormEdicion = () => {
        return validateEditNombre() && validateEditApellidos() && validateEditEdad() && validateEditNumGestacion();
    };

    filtroEstado.addEventListener('change', filterRows);
    filtroHistoriaC.addEventListener('input', filterRows); 

    let rows = []; // Almacenar todas las filas

    // Filtrar las filas de la tabla
    function filterRows() {
        const dniFilterValue = filtroDniNombre.value.toLowerCase();
        const estadoFilterValue = filtroEstado.value.toLowerCase();
        const historiaFilterValue = filtroHistoriaC.value.toLowerCase();

        const filteredRows = rows.filter(row => {
            const dni = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const nombre = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            const apellidos = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            const historiaC = row.querySelector('td:nth-child(6)').textContent.toLowerCase();
            const estadoBadge = row.querySelector('td:nth-child(8) span.badge'); // Asegúrate de que este sea el índice correcto para el estado

            let estado = '';
            if (estadoBadge.classList.contains('bg-success')) {
                estado = 'activo';
            } else if (estadoBadge.classList.contains('bg-danger')) {
                estado = 'inactivo';
            }

            const estadoMatch = estadoFilterValue === 'activo' ? estado === 'activo' : estadoFilterValue === 'inactivo' ? estado === 'inactivo' : true;

            return (dni.includes(dniFilterValue) || nombre.includes(dniFilterValue) || apellidos.includes(dniFilterValue)) &&
                estadoMatch && historiaC.includes(historiaFilterValue);
        });

        updateTable(filteredRows); // Actualiza la tabla con las filas filtradas
    }

    filtroDniNombre.addEventListener('input', filterRows);
    filtroEstado.addEventListener('input', filterRows);

    // Función para actualizar la tabla con nuevas filas
    function updateTable(filteredRows) {
        const tbody = document.querySelector('#tablaPaciente tbody');
        tbody.innerHTML = ''; // Limpiar el cuerpo de la tabla

        filteredRows.forEach(row => tbody.appendChild(row));

        // Actualizar la paginación después de filtrar
        setupPagination(filteredRows);
        displayRows(currentPage, filteredRows);
    }

    // Manejar el envío del formulario de agregar Paciente
    formPaciente.addEventListener('submit', function (e) {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;

        if (validarFormRegistro()) {
            const formData = new FormData(this);
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            title: "Guardado!",
                            text: data.message,
                            icon: "success",
                        }).then(() => {
                            $('#exampleModalP').modal('hide'); 
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: data.message,
                            icon: "error",
                        });
                    }
                    isSubmitting = false;
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: "Error!",
                        text: "Ocurrió un error al guardar el médico.",
                        icon: "error",
                    });
                    isSubmitting = false;
                });
        } else {
            isSubmitting = false; // Resetear la bandera si no pasa la validación
        }
    });

    // Manejar la funcionalidad del botón Limpiar
    btnLimpiar.addEventListener('click', function (e) {
        e.preventDefault();
        formPaciente.reset();
    });

    // Manejar el envío del formulario de edición
    document.getElementById('form-Epaciente').addEventListener('submit', function (e) {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;

        if (validarFormEdicion()) {
            const formData = new FormData(this);
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            title: "Actualizado!",
                            text: data.message,
                            icon: "success",
                        }).then(() => {
                            $('#editModalP').modal('hide'); // Cierra el modal
                            location.reload(); // Opcional: Actualiza la página para reflejar los cambios
                        });
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: data.message,
                            icon: "error",
                        });
                    }
                    isSubmitting = false;
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: "Error!",
                        text: "Ocurrió un error al actualizar los datos.",
                        icon: "error",
                    });
                    isSubmitting = false;
                });
        } else {
            isSubmitting = false;
        }
    });

    // Manejar la eliminación de pacientes
    btnEliminar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const url = e.target.closest('a').href;
            Swal.fire({
                title: "¿Desea eliminar al Paciente?",
                text: "No podrás revertir esto!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí",
                cancelButtonText: "No",
                allowOutsideClick: () => false,
                allowEscapeKey: () => false,
                showLoaderOnConfirm: true
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(url, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                        }
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                Swal.fire({
                                    title: "Eliminado!",
                                    text: data.message,
                                    icon: "success",
                                }).then(() => {
                                    location.reload(); // Actualiza la página para reflejar los cambios
                                });
                            } else {
                                Swal.fire({
                                    title: "Error!",
                                    text: data.message,
                                    icon: "error",
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            Swal.fire({
                                title: "Error!",
                                text: "Ocurrió un error al eliminar al paciente.",
                                icon: "error",
                            });
                        });
                }
            });
        });
    });

    //Manejar la visualizacion del historial del paciente
    document.querySelectorAll('.btnVisualizar').forEach(button => {
        button.addEventListener('click', function () {
            const pacienteId = this.getAttribute('data-id');
    
            // Realizar una solicitud AJAX para obtener los datos del historial
            fetch(`/historialPaciente/${pacienteId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const historial = data.historialPac;
                        const nombrePaciente = data.nombrePaciente;
                        const apellidoPaciente = data.apellidoPaciente;
                        const tbody = document.querySelector('#tablaVisualizarHpac tbody');
                        tbody.innerHTML = ''; 
    
                        if (historial.length > 0) {
                            const Toast = Swal.mixin({
                                toast: true,
                                position: 'bottom',
                                showConfirmButton: false,
                                timer: 1000,
                                timerProgressBar: true,
                                didOpen: (toast) => {
                                    toast.onmouseenter = Swal.stopTimer;
                                    toast.onmouseleave = Swal.resumeTimer;
                                }  
                            });
                            Toast.fire({
                                icon: "success",
                                title: "Historial cargado correctamente."
                            }).then(() => {
                                document.querySelector('#nombre-paciente').textContent = `${nombrePaciente} ${apellidoPaciente}`;
    
                                historial.forEach((item, index) => {
                                    const fechaConsulta = new Date(item.fechaconsulta);
                                    const fechaRegistro = new Date(item.fecharegistro);
    
                                    if (isNaN(fechaConsulta.getTime())) {
                                        console.error('Fecha de consulta inválida:', item.fechaconsulta);
                                    }
                                    if (isNaN(fechaRegistro.getTime())) {
                                        console.error('Fecha de registro inválida:', item.fecharegistro);
                                    }
    
                                    const fechaConsultaFormateada = fechaConsulta.toISOString().split('T')[0].split('-').reverse().join('-');
    
                                    const dia = fechaRegistro.getDate().toString().padStart(2, '0');
                                    const mes = (fechaRegistro.getMonth() + 1).toString().padStart(2, '0');
                                    const año = fechaRegistro.getFullYear();
                                    const horas = fechaRegistro.getHours();
                                    const minutos = fechaRegistro.getMinutes().toString().padStart(2, '0');
                                    const ampm = horas >= 12 ? 'PM' : 'AM';
                                    const horas12 = horas % 24 || 24; // Convertir a formato 12/24 horas
    
                                    const fechaRegistroFormateada = `${dia}-${mes}-${año} ${horas12.toString().padStart(2, '0')}:${minutos} ${ampm}`;
    
                                    const row = document.createElement('tr');
                                    row.innerHTML = `
                                        <td>${index + 1}</td>
                                        <td>${fechaConsultaFormateada}</td>
                                        <td>${item.edadgestacional}</td>
                                        <td>${item.periodointergenesico}</td>
                                        <td>${item.embarazonuevopareja}</td>
                                        <td>${item.hipertensioncronica}</td>
                                        <td>${item.pasistolicabasal}</td>
                                        <td>${item.padiastolicabasal}</td>
                                        <td>${item.presionsistolica1}</td>
                                        <td>${item.presiondiastolica1}</td>
                                        <td>${item.presionsistolica2}</td>
                                        <td>${item.presiondiastolica2}</td>
                                        <td>${item.testdeass}</td>
                                        <td>${item.proteinaorina}</td>
                                        <td>${item.tgo}</td>
                                        <td>${item.tgp}</td>
                                        <td>${item.creatinina}</td>
                                        <td>${item.urea}</td>
                                        <td>${item.fibrinogeno}</td>
                                        <td>${fechaRegistroFormateada}</td>
                                    `;
                                    tbody.appendChild(row);
                                });
    
                                // Mostrar el modal
                                $('#historialPacienteModal').modal('show');
                            });
                        } else {
                            // Mostrar mensaje si no hay datos
                            Swal.fire({
                                title: 'No hay historial clínico',
                                text: `La paciente ${nombrePaciente} ${apellidoPaciente} no tiene historial clínico.`,
                                icon: 'info',
                                confirmButtonText: 'Aceptar'
                            }).then(() => {
                                // Establecemos el nombre del paciente en el modal si no encontramos el historial
                                document.querySelector('#nombre-paciente').textContent = `${nombrePaciente} ${apellidoPaciente}`;
                            });                                
                        }
                    } else {
                        // Manejar el error si no se encuentran datos
                        Swal.fire({
                            title: 'Error',
                            text: data.message,
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un problema al cargar los datos.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                });
        });
    }); 

    // Manejar la edición de pacientes
    btnEditar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const dni = btn.getAttribute('data-dni');
            fetch(`/edicionPaciente/${dni}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.querySelector('#txteditdni').value = data.paciente.dni;
                        document.querySelector('#txteditnombre').value = data.paciente.nombre;
                        document.querySelector('#txteditapellido').value = data.paciente.apellidos;
                        document.querySelector('#txteditedad').value = data.paciente.edad;
                        document.querySelector('#txteditngestacion').value = data.paciente.numgestacion;
                        $('#editModalP').modal('show');
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: "No se pudo obtener la información del paciente.",
                            icon: "error",
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: "Error!",
                        text: "Ocurrió un error al obtener la información del paciente.",
                        icon: "error",
                    });
                });
        });
    });

    // Manejar la activación de pacientes
    btnActivar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const url = e.target.closest('a').href;
            Swal.fire({
                title: "¿Desea activar al Paciente?",
                text: "El paciente estarà activo nuevamente.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí",
                cancelButtonText: "No",
                allowOutsideClick: () => false,
                allowEscapeKey: () => false,
                showLoaderOnConfirm: true
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                        }
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                Swal.fire({
                                    title: "Activado!",
                                    text: data.message,
                                    icon: "success",
                                }).then(() => {
                                    location.reload(); // Actualiza la página para reflejar los cambios
                                });
                            } else {
                                Swal.fire({
                                    title: "Error!",
                                    text: data.message,
                                    icon: "error",
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            Swal.fire({
                                title: "Error!",
                                text: "Ocurrió un error al activar al paciente.",
                                icon: "error",
                            });
                        });
                }
            });
        });
    });

    //PAGINACION DE TABLA
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual

    const table = document.querySelector('#tablaPaciente');
    const paginationControls = document.querySelector('#pagination-controls');

    function setupPagination(rows) {
        const totalPages = Math.ceil(rows.length / rowsPerPage);
        paginationControls.innerHTML = ''; // Limpiar controles de paginación

        // Contenedor para los números de página
        const pageNumbersContainer = document.createElement('div');
        pageNumbersContainer.id = 'page-numbers';

        // Botón de página anterior
        const prevButton = document.createElement('button');
        prevButton.id = 'anterior';
        prevButton.className = 'btn btn-primary';
        prevButton.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayRows(currentPage, rows);
                updatePaginationControls(); // Actualizar controles de paginación
            }
        });
        paginationControls.appendChild(prevButton);

        // Botones de páginas
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'btn';
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                displayRows(currentPage, rows);
                updatePaginationControls(); // Actualizar controles de paginación
            });
            pageNumbersContainer.appendChild(pageButton);
        }

        paginationControls.appendChild(pageNumbersContainer);

        // Botón de página siguiente
        const nextButton = document.createElement('button');
        nextButton.id = 'siguiente';
        nextButton.className = 'btn btn-primary';
        nextButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayRows(currentPage, rows);
                updatePaginationControls(); // Actualizar controles de paginación
            }
        });
        paginationControls.appendChild(nextButton);

        // Resaltar el botón de página actual
        updatePaginationControls();
    }

    function updatePaginationControls() {
        const pageButtons = paginationControls.querySelectorAll('#page-numbers button');
        pageButtons.forEach((button, index) => {
            button.classList.toggle('active', index + 1 === currentPage);
        });

        const prevButton = paginationControls.querySelector('#anterior');
        const nextButton = paginationControls.querySelector('#siguiente');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === pageButtons.length;
    }

    function displayRows(page, rows) {
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = ''; // Limpiar el cuerpo de la tabla

        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedRows = rows.slice(start, end);

        paginatedRows.forEach(row => tbody.appendChild(row));
    }

    // Inicializar la tabla con todas las filas
    function initializeTable() {
        const tbody = table.querySelector('tbody');
        rows = Array.from(tbody.querySelectorAll('tr')); // Obtener todas las filas
        updateTable(rows); // Mostrar todas las filas inicialmente
    }

    initializeTable(); // Inicializar la tabla al cargar la página
});

