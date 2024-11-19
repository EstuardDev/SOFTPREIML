document.addEventListener('DOMContentLoaded', function () {

    const formDiagnostico = document.getElementById('form-diagnostico');
    const formEDiagnostico = document.getElementById('form-Ediagnostico');
    const btnBuscarHistorialP = document.getElementById('btnBuscarHistorialP');
    const btnEliminar = document.querySelectorAll(".btnEliminar");
    const btnEditar = document.querySelectorAll(".btnEditar");
    const btnLimpiar = formDiagnostico.querySelector('.btnLimpiar');
    const btnLimpiar2 = formEDiagnostico.querySelector('.btnLimpiar');
    const btnActivar = document.querySelectorAll(".btnActivar");
    const txtDni = document.getElementById('txtdni');
    const filtroPaciente = document.getElementById('filtroPacienteNombre');
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroRiesgo = document.getElementById('filtroRiesgo');

    filtroFecha.addEventListener('input', filterRows);
    filtroRiesgo.addEventListener('change', filterRows);
    filtroRiesgo.addEventListener('input', filterRows);

    let rows = []; //Almacenamos todas las filas

    // Filtrar las filas de la tabla
    function filterRows() {
        const pacienteFilterValue = filtroPaciente.value.toLowerCase();
        const estadoFilterValue = filtroRiesgo.value.toLowerCase();
        const fechaFilterValue = filtroFecha.value; // Obtenemos el valor del filtro dree fecha

        const filteredRows = rows.filter(row => {
            const paciente = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const estadoBadge = row.querySelector('td:nth-child(6) span.badge');

            let estado = '';
            if (estadoBadge.classList.contains('bg-warning')) {
                estado = 'leve';
            } else if (estadoBadge.classList.contains('bg-danger')) {
                estado = 'severa';
            } else if (estadoBadge.classList.contains('bg-success')) {
                estado = 'no preeclampsia';
            } else if (estadoBadge.classList.contains('bg-info')) {
                estado = 'preeclampsia';
            }

            const estadoMatch = estadoFilterValue === 'no preeclampsia' ? estado === 'no preeclampsia' : estadoFilterValue === 'preeclampsia' ? estado === 'preeclampsia' : estadoFilterValue === 'leve' ? estado === 'leve' : estadoFilterValue === 'severa' ? estado === 'severa' : true;

            // Convertimos nuestar fecha de la fila al formato yyyy-mm-dd para comparar
            const fechaCelda = row.querySelector('td:nth-child(4)').textContent;
            const [day, month, year] = fechaCelda.split('-');
            const fechaCeldaFormatted = `${year}-${month}-${day}`;

            const fechaMatch = fechaFilterValue ? fechaCeldaFormatted === fechaFilterValue : true;

            return (paciente.includes(pacienteFilterValue)) && estadoMatch && fechaMatch;
        });

        updateTable(filteredRows); // Actualiza la tabla con las filas filtradas
    }

    filtroPaciente.addEventListener('input', filterRows);

    // Función para actualizar la tabla con nuevas filas
    function updateTable(filteredRows) {
        const tbody = document.querySelector('#tablaDiagnostico tbody');
        tbody.innerHTML = ''; // Limpiar el cuerpo de la tabla

        filteredRows.forEach(row => tbody.appendChild(row));

        // Actualizar la paginación después de filtrar
        setupPagination(filteredRows);
        displayRows(currentPage, filteredRows);
    }

    // Función para buscar historial por DNI
    if (btnBuscarHistorialP) {
        btnBuscarHistorialP.addEventListener('click', function () {
            const dni = txtDni.value.trim();
            if (dni.length === 0) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Por favor, ingrese un DNI.',
                    icon: 'warning'
                });
                return;
            }

            fetch(`/buscarHistorial/${dni}`)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.success) {
                        // Asignar los valores obtenidos al formulario
                        txtnombre.value = data.paciente.nombre;
                        txtapellido.value = data.paciente.apellidos;
                        txtedad.value = data.paciente.edad;
                        txtedadgestacional.value = data.paciente.edadgestacional;
                        txtperiodointerg.value = data.paciente.periodointergenesico;
                        txtembarazonuevapareja.value = data.paciente.embarazonuevopareja;
                        txthipertCronica.value = data.paciente.hipertensioncronica;
                        txtsistolicabasal.value = data.paciente.pasistolicabasal;
                        txtdiastolicabasal.value = data.paciente.padiastolicabasal;
                        txtsistolicaM1.value = data.paciente.presionsistolica1;
                        txtdiastolicaM1.value = data.paciente.presiondiastolica1;
                        txtsistolicaM2.value = data.paciente.presionsistolica2;
                        txtdiastolicaM2.value = data.paciente.presiondiastolica2;
                        txttestdeass.value = data.paciente.testdeass;
                        txtproteinuria.value = data.paciente.proteinaorina;
                        txttgo.value = data.paciente.tgo;
                        txttgp.value = data.paciente.tgp;
                        txtcreatinina.value = data.paciente.creatinina;
                        txturea.value = data.paciente.urea;
                        txtfibrinogeno.value = data.paciente.fibrinogeno;
                    } else {
                        Swal.fire({
                            title: 'No encontrado!',
                            text: data.message,
                            icon: 'error'
                        });
                        // Limpiar los campos del formulario
                        txtnombre.value = '';
                        txtapellido.value = '';
                        txtedad.value = '';
                        // txtfecha.value = '';
                        txtedadgestacional.value = '';
                        txtperiodointerg.value = '';
                        txtembarazonuevapareja.value = '';
                        txthipertCronica.value = '';
                        txtsistolicabasal.value = '';
                        txtdiastolicabasal.value = '';
                        txtsistolicaM1.value = '';
                        txtdiastolicaM1.value = '';
                        txtsistolicaM2.value = '';
                        txtdiastolicaM2.value =
                            txttestdeass.value = '';
                        txtproteinuria.value = '';
                        txttgo.value = '';
                        txttgp.value = '';
                        txtcreatinina.value = '';
                        txturea.value = '';
                        txtfibrinogeno.value = '';
                    }
                    console.log(txtsistolicaM2);
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Hubo un problema al buscar el historial.',
                        icon: 'error'
                    });
                });
        });
    }

    // Función para obtener el badge de nivel de riesgo
    function nivelRiesgoBadge(nivelriesgo) {
        if (nivelriesgo === 'Leve') {
            return `<span class="badge bg-warning">${nivelriesgo}</span>`;
        } else if (nivelriesgo === 'Severa') {
            return `<span class="badge bg-danger">${nivelriesgo}</span>`;
        } else {
            return nivelriesgo;
        }
    }

    // Función para obtener el badge de estado
    function estadoBadge(estado) {
        if (estado === 'Evaluado') {
            return `<span class="badge bg-success">${estado}</span>`;
        } else {
            return `<span class="badge bg-danger">Proceso</span>`;
        }
    }

    //Manejar la visualizacion del diagnostico del paciente
    document.querySelectorAll('.btnVisualizar').forEach(button => {
        button.addEventListener('click', function () {
            const pacienteId = this.getAttribute('data-id');

            // Realizar una solicitud AJAX para obtener los datos del historial
            fetch(`/diagnosticosPaciente/${pacienteId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const diagnostico = data.evaluacionPaciente;
                        const nombrePaciente = data.nombrePaciente; // Obtener el nombre del paciente
                        const apellidoPaciente = data.apellidoPaciente;
                        const tbody = document.querySelector('#tablaVisualizarDpac tbody');
                        tbody.innerHTML = ''; // Limpiar la tabla existente

                        if (diagnostico.length > 0) {
                            // Mostrar mensaje de bienvenida
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
                                title: "Diagnosticos cargados correctamente."
                            }).then(() => {
                                // Establecer el nombre del paciente en el modal
                                document.querySelector('#nombre-paciente').textContent = `${nombrePaciente} ${apellidoPaciente}`;
                                // console.log(eliminar_diagnostico_url);

                                // Formatear las fechas y agregar los datos a la tabla
                                diagnostico.forEach((item, index) => {
                                    // Asegurarse de que las fechas sean válidas
                                    const fechaPrediccion = new Date(item.fecha_prediccion);

                                    const dia = ('0' + fechaPrediccion.getDate()).slice(-2);  // Aseguramos dos dígitos para el día
                                    const mes = ('0' + (fechaPrediccion.getMonth() + 1)).slice(-2);  // Aseguramos dos dígitos para el mes
                                    const año = fechaPrediccion.getFullYear();
                                    const fechaFormateada = `${año}-${mes}-${dia}`;

                                    const row = document.createElement('tr');
                                    row.innerHTML = `
                                        <td>${index + 1}</td>
                                        <td>${fechaFormateada}</td>
                                        <td>${item.riesgo}</td>
                                        <td>${nivelRiesgoBadge(item.nivelriesgo)}</td>
                                        <td>${estadoBadge(item.estado)}</td>
                                        <td>${item.detalles}</td>
                                    `;
                                    tbody.appendChild(row);
                                });

                                // Mostrar el modal
                                $('#histEvaluacionPacienteModal').modal('show');
                            });
                        } else {
                            // Mostrar mensaje si no hay datos
                            Swal.fire({
                                title: 'No registra más Diagnósticos Clínicos',
                                text: `La paciente ${nombrePaciente} ${apellidoPaciente} no obtuvo más Diagnósticos Clínicos.`,
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

    // Manejamos el envío del formulario de dianóstico
    formDiagnostico.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        Swal.fire({
            title: 'Evaluando paciente...',
            text: 'Por favor, espere...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showLoaderOnConfirm: true,
            showConfirmButton: false,
            // backdrop: false,
            customClass: 'myLoader'
        });
        setTimeout(() => {
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
                .then(response => response.json())
                .then(data => {
                    Swal.close();
                    if (data.success) {
                        Swal.fire({
                            title: 'Evaluado!',
                            text: data.message,
                            icon: 'success',
                        }).then(() => {
                            $('#exampleModal').modal('hide'); // Cierra el modal
                            location.reload(); // Actualizamos la página para reflejar los cambios
                        });
                    } else {
                        Swal.fire({
                            title: 'Error!',
                            text: data.message,
                            icon: 'error',
                        });
                    }
                })
                .catch(error => {
                    Swal.close();
                    console.error('Error:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Hubo un problema al evaluar el diagnóstico.',
                        icon: 'error',
                    });
                });
        }, 4000);
    });

    // Manejar la edición de diagnosticos
    btnEditar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            fetch(`/edicionDiagnostico/${id}`)
                .then(response => response.json())
                .then(data => {
                    // console.log(data)
                    if (data.success) {

                        // Formatear la fecha a m-d-y h:m PM/AM
                        const fechaPrediccion = new Date(data.diagnostico.fecha_prediccion);
                        const horaPrediccion = data.diagnostico.hora_prediccion; // Asumiendo que esto viene en formato HH:MM:SS

                        // Formatear la fecha a d-m-y
                        const dia = ('0' + fechaPrediccion.getDate()).slice(-2);  // Aseguramos dos dígitos para el día
                        const mes = ('0' + (fechaPrediccion.getMonth() + 1)).slice(-2);  // Aseguramos dos dígitos para el mes
                        const año = fechaPrediccion.getFullYear();
                        const fechaFormateada = `${año}-${mes}-${dia}`; // Formato yyyy-mm-dd para un campo de tipo date

                        // Asumir que horaPrediccion está en formato HH:MM:SS
                        const [horas, minutos] = horaPrediccion.split(':');
                        const horaFormateada = `${horas}:${minutos}`;

                        document.querySelector('#txteditid').value = data.diagnostico.id;
                        document.querySelector('#txteditnombrespaciente').value = data.diagnostico.paciente;
                        document.querySelector('#txteditnombresmedico').value = data.diagnostico.personal;
                        document.querySelector('#txteditfechadiagnostico').value = fechaFormateada;
                        document.querySelector('#txtedithoradiagnostico').value = horaFormateada;
                        document.querySelector('#txteditriesgo').value = data.diagnostico.riesgo;
                        document.querySelector('#txteditnivelriesgo').value = data.diagnostico.nivelriesgo;
                        document.querySelector('#txteditestado').value = data.diagnostico.estado;
                        document.querySelector('#txteditdetalles').value = data.diagnostico.detalles;
                        $('#editModalD').modal('show');
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: "No se pudo obtener la información del diagnóstico.",
                            icon: "error",
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: "Error!",
                        text: "Ocurrió un error al obtener la información del diagnóstico.",
                        icon: "error",
                    });
                });
        });
    });

    // Manejar el envío del formulario de edición
    document.getElementById('form-Ediagnostico').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        console.log(this.action);
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
                        $('#editModalD').modal('hide'); // Cierra el modal
                        location.reload(); // Opcional: Actualiza la página para reflejar los cambios
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
                    text: "Ocurrió un error al actualizar los datos.",
                    icon: "error",
                });
            });
    });

    // Manejar la eliminación del dingostico dle pacientes
    btnEliminar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const url = e.target.closest('a').href;
            Swal.fire({
                title: "¿Desea eliminar el Diagnostico del paciente?",
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
                                text: "Ocurrió un error al eliminar el diagnóstico del paciente.",
                                icon: "error",
                            });
                        });
                }
            });
        });
    });

    // Manejar la activación de Daignostico
    btnActivar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const url = e.target.closest('a').href;
            Swal.fire({
                title: "¿Desea activar el Diagnóstico?",
                text: "El Diagnóstico estarà activo nuevamente.",
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
                                text: "Ocurrió un error al activar el diagnóstico.",
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
        formDiagnostico.reset();
    });

    // Manejar la funcionalidad del botón Limpiar
    btnLimpiar2.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector('#txteditdetalles').value = '';
    });

    //PAGINACION DE TABLA
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual

    const table = document.querySelector('#tablaDiagnostico');
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
