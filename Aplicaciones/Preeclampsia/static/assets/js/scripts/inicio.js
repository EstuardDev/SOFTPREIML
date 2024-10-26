document.addEventListener('DOMContentLoaded', function () {

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

    //Manejamos la visualizacion del diagnostico del paciente
    document.querySelectorAll('.btnVisualizar').forEach(button => {
        button.addEventListener('click', function () {
            const pacienteId = this.getAttribute('data-id');

            // Realizar una solicitud AJAX para obtener los datos del historial
            fetch(`/diagnosticosPaciente/${pacienteId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log(data);
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

                                // Formatear las fechas y agregar los datos a la tabla
                                diagnostico.forEach((item, index) => {
                                    // Asegurarse de que las fechas sean válidas
                                    const fechaPrediccion = new Date(item.fecha_prediccion);

                                    // Comprobar si las fechas son válidas                                    
                                    if (isNaN(fechaPrediccion.getTime())) {
                                        console.error('Fecha de registro inválida:', item.fechaPrediccion);
                                    }

                                    // Formatear la fecha de registro (d-m-Y h:i A)
                                    const dia = fechaPrediccion.getDate().toString().padStart(2, '0');
                                    const mes = (fechaPrediccion.getMonth() + 1).toString().padStart(2, '0');
                                    const año = fechaPrediccion.getFullYear();
                                    const horas = fechaPrediccion.getHours();
                                    const minutos = fechaPrediccion.getMinutes().toString().padStart(2, '0');
                                    const ampm = horas >= 12 ? 'PM' : 'AM';
                                    const horas12 = horas % 24 || 24; // Convertir a formato 12/24 horas

                                    const fechaPrediccionFormateada = `${dia}-${mes}-${año} ${horas12.toString().padStart(2, '0')}:${minutos} ${ampm}`;

                                    const row = document.createElement('tr');
                                    row.innerHTML = `
                                        <td>${index + 1}</td>
                                        <td>${fechaPrediccionFormateada}</td>
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

});