document.addEventListener('DOMContentLoaded', function () {

    const formPersonal = document.getElementById('form-Personal');
    const btnLimpiar = formPersonal.querySelector('.btnLimpiar');
    const btnEliminar = document.querySelectorAll(".btnEliminar");
    const btnEditar = document.querySelectorAll(".btnEditar");
    const btnActivar = document.querySelectorAll(".btnActivar");
    const filtroDniNombre = document.getElementById('filtro-dni');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroFecha = document.getElementById('filtro-fecha');

    const dniInput = document.getElementById('txtdni');
    const nombreInput = document.getElementById('txtnombre');
    const apellidoInput = document.getElementById('txtapellido');

    const editNombreInput = document.getElementById('txteditnombre');
    const editApellidoInput = document.getElementById('txteditapellido');

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
        if (/^(\d)\1+$/.test(dni)) { // Validación para evitar números repetidos
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

    const validarFormRegistro = () => {
        return validateDNI() && validateNombre() && validateApellidos();
    };

    const validarFormEdicion = () => {
        return validateEditNombre() && validateEditApellidos() && validateEditEdad() && validateEditNumGestacion();
    };

    const showWarning = (message) => {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: message,
        });
    };


    filtroEstado.addEventListener('change', filterRows);
    filtroFecha.addEventListener('input', filterRows);
    filtroDniNombre.addEventListener('input', filterRows);
    filtroEstado.addEventListener('input', filterRows);

    let rows = []; // Almacenar todas las filas

    // Filtrar las filas de la tabla
    function filterRows() {
        const dniFilterValue = filtroDniNombre.value.toLowerCase();
        const estadoFilterValue = filtroEstado.value.toLowerCase();
        const fechaFilterValue = filtroFecha.value; // Obtener el valor del filtro de fecha

        const filteredRows = rows.filter(row => {
            const dni = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const nombre = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            const apellidos = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            const estadoBadge = row.querySelector('td:nth-child(6) span.badge'); // Asegúrate de que este sea el índice correcto para el estado

            let estado = '';
            if (estadoBadge.classList.contains('bg-success')) {
                estado = 'activo';
            } else if (estadoBadge.classList.contains('bg-danger')) {
                estado = 'inactivo';
            }

            const estadoMatch = estadoFilterValue === 'activo' ? estado === 'activo' : estadoFilterValue === 'inactivo' ? estado === 'inactivo' : true;

            // Convertir fecha de la fila al formato yyyy-mm-dd para comparar
            const fechaCelda = row.querySelector('td:nth-child(5)').textContent; // Asegúrate de que este sea el índice correcto para la fecha
            const [day, month, year] = fechaCelda.split('-');
            const fechaCeldaFormatted = `${year}-${month}-${day}`;

            const fechaMatch = fechaFilterValue ? fechaCeldaFormatted === fechaFilterValue : true;

            return (dni.includes(dniFilterValue) || nombre.includes(dniFilterValue) || apellidos.includes(dniFilterValue)) &&
                estadoMatch && fechaMatch;
        });

        updateTable(filteredRows); // Actualiza la tabla con las filas filtradas
    }

    // Función para actualizar la tabla con nuevas filas
    function updateTable(filteredRows) {
        const tbody = document.querySelector('#tablaMedico tbody');
        tbody.innerHTML = ''; // Limpiar el cuerpo de la tabla

        filteredRows.forEach(row => tbody.appendChild(row));

        // Actualizar la paginación después de filtrar
        setupPagination(filteredRows);
        displayRows(currentPage, filteredRows);
    }

    // Manejar el envío del formulario de agregar médico
    formPersonal.addEventListener('submit', function (e) {
        e.preventDefault();
        if (isSubmitting) return; // Evitar múltiples envíos
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
                            $('#exampleModalM').modal('hide');
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: "Ocurrio un Error!",
                            text: data.message,
                            icon: "error",
                        });
                    }
                    isSubmitting = false;
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: "Ocurrio un Error!",
                        text: "Ocurrió un error al guardar el médico. Intente nuevamente.",
                        icon: "error",
                    });
                    isSubmitting = false;
                });
        } else {
            isSubmitting = false;
        }

    });

    // Manejar el envío del formulario de edición
    document.getElementById('form-Epersonal').addEventListener('submit', function (e) {
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
                            $('#editModalM').modal('hide'); // Cierra el modal
                            location.reload(); // Actualiza la página para reflejar los cambios
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

    // Manejar la eliminación de médicos
    btnEliminar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const url = e.target.closest('a').href;
            Swal.fire({
                title: "¿Desea eliminar al Médico?",
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
                                text: "Ocurrió un error al eliminar el médico.",
                                icon: "error",
                            });
                        });
                }
            });
        });
    });

    // Manejar la edición de médicos
    btnEditar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const dni = btn.getAttribute('data-dni');
            fetch(`/edicionMedico/${dni}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.querySelector('#txteditdni').value = data.personal.dni;
                        document.querySelector('#txteditnombre').value = data.personal.nombre;
                        document.querySelector('#txteditapellido').value = data.personal.apellidos;
                        $('#editModalM').modal('show');
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: "No se pudo obtener la información del médico.",
                            icon: "error",
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: "Error!",
                        text: "Ocurrió un error al obtener la información del médico.",
                        icon: "error",
                    });
                });
        });
    });

    // Manejar la activación de Médicos
    btnActivar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const url = e.target.closest('a').href;
            Swal.fire({
                title: "¿Desea activar al Médico?",
                text: "El médico estará activo nuevamente.",
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
                                text: "Ocurrió un error al activar al médico.",
                                icon: "error",
                            });
                        });
                }
            });
        });
    });

    // Manejar la funcionalidad del botón Limpiar
    btnLimpiar.addEventListener('click', function (e) {
        e.preventDefault();
        formPersonal.reset();
        // Mostrar todas las filas al limpiar el filtro
        updateTable(rows);
    });

    //PAGINACION DE TABLA
    const rowsPerPage = 10; // Número de filas por página
    let currentPage = 1; // Página actual

    const table = document.querySelector('#tablaMedico');
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
