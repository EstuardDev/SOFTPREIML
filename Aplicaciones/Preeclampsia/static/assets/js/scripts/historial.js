document.addEventListener('DOMContentLoaded', function () {

    const btnEliminar = document.querySelectorAll(".btnEliminar");
    const btnEditar = document.querySelectorAll(".btnEditar");
    const formHistorial = document.getElementById('form-historial');
    const formEHistorial = document.getElementById('form-Ehistorial');
    const btnLimpiar = formHistorial.querySelector('.btnLimpiar');
    const btnLimpiar2 = formEHistorial.querySelector('.btnLimpiar');
    const btnBuscar = document.getElementById('btnbuscarH');
    const txtDni = document.getElementById('txtdni');
    const txtNombre = document.getElementById('txtnombre');
    const txtApellido = document.getElementById('txtapellido');
    const filtroPaciente = document.getElementById('filtroPaciente');
    const filtroFecha = document.getElementById('filtroFecha');

    filtroFecha.addEventListener('input', filterRows);

    let rows = []; // Almacenar todas las filas

    // Filtrar las filas de la tabla
    function filterRows() {
        const pacienteFilterValue = filtroPaciente.value.toLowerCase();
        const fechaFilterValue = filtroFecha.value; // Obtener el valor del filtro de fecha

        const filteredRows = rows.filter(row => {
            const paciente = row.querySelector('td:nth-child(2)').textContent.toLowerCase();

            // Convertir fecha de la fila al formato yyyy-mm-dd para comparar
            const fechaCelda = row.querySelector('td:nth-child(3)').textContent; // Asegúrate de que este sea el índice correcto para la fecha
            const [day, month, year] = fechaCelda.split('-');
            const fechaCeldaFormatted = `${year}-${month}-${day}`;

            const fechaMatch = fechaFilterValue ? fechaCeldaFormatted === fechaFilterValue : true;

            return (paciente.includes(pacienteFilterValue)) && fechaMatch;
        });

        updateTable(filteredRows); // Actualiza la tabla con las filas filtradas
    }

    filtroPaciente.addEventListener('input', filterRows);

    // Función para actualizar la tabla con nuevas filas
    function updateTable(filteredRows) {
        const tbody = document.querySelector('#tablaHistorial tbody');
        tbody.innerHTML = ''; // Limpiar el cuerpo de la tabla

        filteredRows.forEach(row => tbody.appendChild(row));

        // Actualizar la paginación después de filtrar
        setupPagination(filteredRows);
        displayRows(currentPage, filteredRows);
    }

    // Buscar Paciente por DNI
    if (btnBuscar) {
        btnBuscar.addEventListener('click', function () {
            const dni = txtDni.value.trim();
            if (dni.length === 0) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Por favor, ingrese un DNI.',
                    icon: 'warning'
                });
                return;
            }

            fetch(`/buscarPaciente/${dni}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        txtNombre.value = data.paciente.nombre;
                        txtApellido.value = data.paciente.apellidos;
                        txtedad.value = data.paciente.edad;
                        txtedadgestacional.value = data.paciente.numgestacion;
                    } else {
                        Swal.fire({
                            title: 'No encontrado!',
                            text: data.message,
                            icon: 'error'
                        });
                        txtNombre.value = '';
                        txtApellido.value = '';
                        txtedad.value = '';
                        txtedadgestacional.value = '';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Hubo un problema al buscar el paciente.',
                        icon: 'error'
                    });
                });
        });
    }

    // Manejar el envío del formulario de edición
    document.getElementById('form-Ehistorial').addEventListener('submit', function (e) {
        e.preventDefault();
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
                console.log(data);
                if (data.success) {
                    Swal.fire({
                        title: "Actualizado!",
                        text: data.message,
                        icon: "success",
                    }).then(() => {
                        $('#editModal').modal('hide'); // Cierra el modal
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

    // Manejar la eliminación de historial clínico
    btnEliminar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const url = e.target.closest('a').href;
            Swal.fire({
                title: "¿Desea eliminar el historial clínico?",
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
                                text: "Ocurrió un error al eliminar el historial clínico.",
                                icon: "error",
                            });
                        });
                }
            });
        });
    });

    // Manejar la edición de historial clínico
    btnEditar.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const id = btn.getAttribute('data-id'); // Asegúrate de que el botón tiene el atributo data-id
            fetch(`/edicionHistorial/${id}`)
                .then(response => response.json())
                .then(data => {
                    // console.log(data);
                    if (data.success) {

                        // Formatear la fecha a m-d-y h:m PM/AM
                        const fechaConsulta = new Date(data.historial.fechaConsulta);
                        const mes = ('0' + (fechaConsulta.getMonth() + 1)).slice(-2);  // le damos dos dígitos para el mes
                        const dia = ('0' + fechaConsulta.getDate()).slice(-2);  // le damos dos dígitos para el día
                        const año = fechaConsulta.getFullYear();

                        // Obtener la hora en formato 12 horas
                        let horas = fechaConsulta.getHours();
                        const minutos = ('0' + fechaConsulta.getMinutes()).slice(-2);
                        // const segundos = ('0' + fechaConsulta.getSeconds()).slice(-2);  // le admos dos dígitos para los segundos
                        const ampm = horas >= 12 ? 'PM' : 'AM';  // determinamos si es AM o PM
                        // Convertir la hora al formato 12/24 horas
                        horas = horas % 24;
                        horas = horas ? horas : 24;  // Si es 0, poner 12
                        // Construir la fecha en formato m-d-y h:m PM/AM
                        const fechaFormateada = `${dia}-${mes}-${año} ${horas}:${minutos} ${ampm}`;

                        // Rellena el formulario de edición con los datos obtenidos                        
                        document.querySelector('#txteditid').value = data.historial.id;
                        document.querySelector('#txteditdni').value = data.historial.dni;
                        document.querySelector('#txteditnombre').value = data.historial.nombre;
                        document.querySelector('#txteditapellido').value = data.historial.apellidos;
                        document.querySelector('#txteditedad').value = data.historial.edad;
                        // document.querySelector('#txteditfecha').value = fechaFormateada;
                        document.querySelector('#txteditedadgestacional').value = data.historial.edadgestacional;
                        document.querySelector('#txteditperiodointerg').value = data.historial.periodointergenesico;
                        document.querySelector('#txteditembarazonuevapareja').value = data.historial.embarazonuevopareja;
                        document.querySelector('#txtedithipertCronica').value = data.historial.hipertensioncronica;
                        document.querySelector('#txteditsistolicabasal').value = data.historial.pasistolicabasal;
                        document.querySelector('#txteditdiastolicabasal').value = data.historial.padiastolicabasal;
                        document.querySelector('#txteditsistolicaM1').value = data.historial.presionsistolica1;
                        document.querySelector('#txteditdiastolicaM1').value = data.historial.presiondiastolica1;
                        document.querySelector('#txteditsistolicaM2').value = data.historial.presionsistolica2;
                        document.querySelector('#txteditdiastolicaM2').value = data.historial.presiondiastolica2;
                        document.querySelector('#txtedittestdeass').value = data.historial.testdeass;
                        document.querySelector('#txteditproteinuria').value = data.historial.proteinaorina;
                        document.querySelector('#txtedittgo').value = data.historial.tgo;
                        document.querySelector('#txtedittgp').value = data.historial.tgp;
                        document.querySelector('#txteditcreatinina').value = data.historial.creatinina;
                        document.querySelector('#txtediturea').value = data.historial.urea;
                        document.querySelector('#txteditfibrinogeno').value = data.historial.fibrinogeno;
                        $('#editModal').modal('show');
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: "No se pudo obtener la información del historial clínico.",
                            icon: "error",
                        });
                    }
                    console.log(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: "Error!",
                        text: "Ocurrió un error al obtener la información del historial clínico.",
                        icon: "error",
                    });
                });
        });
    });

    // Manejar el envío del formulario de guardar
    formHistorial.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        console.log(formData);
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
                        $('#exampleModal').modal('hide'); // Cierra el modal
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
                    text: "Ocurrió un error al guardar los datos.",
                    icon: "error",
                });
            });
    });

    // Manejar la funcionalidad del botón Limpiar
    btnLimpiar.addEventListener('click', function (e) {
        e.preventDefault();
        formHistorial.reset();
    });

    // Manejar la funcionalidad del botón Limpiar
    btnLimpiar2.addEventListener('click', function (e) {
        e.preventDefault();
        limpiarCamposExcepto(['txteditdni', 'txteditnombre', 'txteditapellido', 'txteditedad', 'txteditedadgestacional']);
    });

    // Función para limpiar campos excepto los especificados
    function limpiarCamposExcepto(camposExcepto) {
        const campos = formEHistorial.querySelectorAll('input[type="text"], select, textarea');
        campos.forEach(campo => {
            if (!camposExcepto.includes(campo.id)) {
                campo.value = '';
            }
        });
    }

    // Función para seleccionar el valor en un select
    function setSelectValue(selector, value) {
        const select = document.querySelector(selector);
        if (select) {
            select.value = value;
        }
    }

    //PAGINACION DE TABLA
    const rowsPerPage = 5; // Número de filas por página
    let currentPage = 1; // Página actual

    const table = document.querySelector('#tablaHistorial');
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

    // OPCIONES  DE CONFIGURACIÓN PARA MOSTRAR EL BLOQUE 3
    // Seleccionamos el card de Laboratorio
    const cardLaboratorio = document.querySelector('.card.mb-2');
    const selectTestDeAss = document.getElementById('txttestdeass');

    // // Agrega un estilo inicial para ocultar el bloque3
    // cardLaboratorio.style.display = 'none';

    // // Agrega un evento de cambio al select
    // selectTestDeAss.addEventListener('change', () => {
    //     // Obtiene el valor seleccionado
    //     const valorSeleccionado = selectTestDeAss.value;

    //     // Muestra o oculta el bloque3 según la opción seleccionada
    //     if (valorSeleccionado === '2' || valorSeleccionado === '3') {
    //         cardLaboratorio.style.display = 'block';
    //     } else {
    //         cardLaboratorio.style.display = 'none';
    //     }
    // });

});

