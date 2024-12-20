document.addEventListener("DOMContentLoaded", function () {

    $('#tablaReportes').DataTable({
        lengthMenu: [5, 10, 15, 20],
        pageLength: 10,
        ordering: false,
        // paging: false,
        // info: false,
        // dom: 'Bfrtip',
        layout: {
            topStart: {
                buttons: [
                    {
                        extend: "excel",
                        text: '<i class="fa-solid fa-file-excel"></i> Excel',
                    },
                    {
                        extend: "pdf",
                        text: '<i class="fa-solid fa-file-pdf"></i> PDF',
                    },
                ],
            },
        },
        language: {
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "Ningún dato disponible en esta tabla",
            "sInfo": "Mostrando  _START_ al _END_ de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando  0 al 0 de 0 registros",
            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sInfoPostFix": "",
            "sSearch": "Buscar:",
            "sUrl": "",
            "sInfoThousands": ",",
            "sLoadingRecords": "Cargando...",
            "oPaginate": {
                "sFirst": '<i class="fa-solid fa-angles-left"></i>',
                "sLast": '<i class="fa-solid fa-angles-right"></i>',
                "sNext": '<i class="fa-solid fa-angle-right"></i>',
                "sPrevious": '<i class="fa-solid fa-angle-left"></i>'
            },
            "oAria": {
                "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
            }
        },
    });

    var proporcionRiesgo = parseFloat(document.getElementById('proporcionRiesgoChart').getAttribute('data-pr')) || 0;
    var tasaIntervencion = parseFloat(document.getElementById('tasaIntervencionChart').getAttribute('data-tie')) || 0;
    var fechaTasaIntervencion = document.getElementById('tasaIntervencionChart').getAttribute('data-fecha');
    var tiempoPromedioDeteccion = parseFloat(document.getElementById('tiempoPromedioDeteccionChart').getAttribute('data-tpd')) || 0;
    var porcentajeCambioRiesgo = parseFloat(document.getElementById('casosCambioRiesgoChart').getAttribute('data-porcentaje')) || 0;

    var barColor;
    if (porcentajeCambioRiesgo >= 80) {
        barColor = '#198754'; // Verde para 80% o más
    } else if (porcentajeCambioRiesgo >= 50) {
        barColor = '#FFC107'; // Amarillo para 50% - 79%
    } else {
        barColor = '#ff4500'; // Rojo para menos de 50%
    }

    var cambioRiesgoChartDom = document.getElementById('casosCambioRiesgoChart');
    if (cambioRiesgoChartDom) {
        var cambioRiesgoChart = echarts.init(cambioRiesgoChartDom);
        var cambioRiesgoOption = {
            grid: {
                containLabel: true // Esto asegura que las etiquetas no se salgan del gráfico
            },
            title: {
                text: 'Casos Observados sin Progresión',
                left: 'center'
            },
            xAxis: {
                type: 'category',
                data: ['% sin Progresión'],
            },
            yAxis: {
                type: 'value',
                max: 100
            },
            toolbox: {
                show: true,
                feature: {
                    mark: { show: true },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            series: [
                {
                    name: 'Cambio de Severa a Leve',
                    type: 'bar',
                    data: [porcentajeCambioRiesgo],
                    label: {
                        show: true,
                        position: 'inside',  // Muestra el porcentaje dentro de la barra
                        formatter: '{c}%',  // Formato del valor como porcentaje
                        fontSize: 35,
                        fontWeight: 'bold',
                        color: '#fff'  // Color de texto blanco para visibilidad
                    },
                    itemStyle: {
                        color: barColor,  // Color dinámico de la barra basado en el porcentaje
                        borderRadius: [10, 10, 0, 0]  // Bordes redondeados en la parte superior
                    }
                }
            ]
        };
        cambioRiesgoChart.setOption(cambioRiesgoOption);
    }

    var tpdChartDom = document.getElementById('tiempoPromedioDeteccionChart');
    var tpdChart = echarts.init(tpdChartDom);
    var tpdOption = {
        title: {
            text: 'Tiempo Promedio de Detección (TPD)',
            left: 'center'
        },
        tooltip: {
            formatter: function () {
                var totalSeconds = tiempoPromedioDeteccion;
                var days = Math.floor(totalSeconds / (24 * 3600));
                totalSeconds %= 24 * 3600;
                var hours = Math.floor(totalSeconds / 3600);
                totalSeconds %= 3600;
                var minutes = Math.floor(totalSeconds / 60);
                var seconds = totalSeconds % 60;
                return `TPD: ${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
        },
        series: [
            {
                name: 'Tiempo Promedio de Detección',
                type: 'gauge',
                max: 2592000, 
                axisLine: {
                    lineStyle: {
                        color: [
                            [0.25, '#198754'],
                            [0.5, '#FFC107'], 
                            [1, '#DC3545']
                        ],
                        width: 20
                    }
                },
                axisLabel: {
                    fontSize: 8,
                    distance: 25,
                    formatter: function (value) {
                        var days = Math.floor(value / (24 * 3600));
                        var hours = Math.floor((value % (24 * 3600)) / 3600);
                        return `${days}d ${hours}h`;
                    }
                },
                detail: {
                    formatter: function (value) {
                        var totalSeconds = value;
                        var days = Math.floor(totalSeconds / (24 * 3600));
                        totalSeconds %= 24 * 3600;
                        var hours = Math.floor(totalSeconds / 3600);
                        totalSeconds %= 3600;
                        var minutes = Math.floor(totalSeconds / 60);
                        var seconds = totalSeconds % 60;
                        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
                    },
                    fontSize: 14,
                    color: '#000',
                },
                data: [{ value: tiempoPromedioDeteccion, name: 'TPD' }]
            }
        ]
    };
    tpdChart.setOption(tpdOption);

    var prChartDom = document.getElementById('proporcionRiesgoChart');
    if (prChartDom) {
        var prChart = echarts.init(prChartDom);
        var prOption = {
            title: {
                text: 'Proporción de Riesgo (PR)',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: 'bottom'
            },
            toolbox: {
                show: true,
                feature: {
                    mark: { show: true },
                    dataView: { show: true, readOnly: true },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            series: [
                {
                    name: 'Proporción de Riesgo',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    padAngle: 4,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        position: 'center',
                        formatter: '{d}%',
                        fontSize: 30,
                        fontWeight: 'bold',
                        color: '#333'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 40, 
                            fontWeight: 'bold',
                            formatter: '{d}%',  
                            color: '#333'
                        }
                    },
                    labelLine: {
                        show: false 
                    },
                    data: [
                        { value: proporcionRiesgo, name: 'Riesgo de Preeclampsia', itemStyle: { color: '#DC3545' } },
                        { value: 100 - proporcionRiesgo, name: 'Sin Riesgo', itemStyle: { color: '#198754' } }
                    ]
                }
            ]
        };

        // Configuración de eventos para el gráfico
        prChart.on('mouseover', function (params) {
            if (params.seriesType === 'pie') { // Verifica que el evento proviene del gráfico circular
                prOption.series[0].label.show = false; // Oculta el label predeterminado
                prChart.setOption(prOption, true); // Aplica los cambios al gráfico
            }
        });
        
        prChart.on('mouseout', function (params) {
            if (params.seriesType === 'pie') { // Verifica que el evento proviene del gráfico circular
                prOption.series[0].label.show = true; // Restaura el label predeterminado
                prChart.setOption(prOption, true); // Aplica los cambios al gráfico
            }
        });

        prChart.setOption(prOption);
    }

    var tieChartDom = document.getElementById('tasaIntervencionChart');
    if (tieChartDom) {
        var tieChart = echarts.init(tieChartDom);
        var tieOption = {
            title: {
                text: 'Casos Observados sin Progresión',
                left: 'center'
            },
            xAxis: {
                type: 'category',
                data: [fechaTasaIntervencion], // Puedes mostrar la fecha aquí
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value}'  // Muestra la cantidad de pacientes
                },
                name: 'N° de Casos',  // Etiqueta para el eje Y
                max: tasaIntervencion  // Ajustar el valor máximo según la cantidad de pacientes
            },
            toolbox: {
                show: true,
                feature: {
                    mark: { show: true },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            series: [
                {
                    name: 'Pacientes con Intervención Efectiva',
                    type: 'bar',
                    data: [tasaIntervencion], // Usa la cantidad de pacientes
                    label: {
                        show: true,
                        position: 'inside',  // Posición dentro de la barra
                        formatter: '{c}',  // Muestra la cantidad de pacientes
                        fontSize: 35,
                        fontWeight: 'bold',
                        color: '#fff'
                    },
                    itemStyle: {
                        color: '#5470c6',
                        borderRadius: [10, 10, 0, 0]
                    }
                }
            ]
        };
        tieChart.setOption(tieOption);
    }

    window.addEventListener('resize', function () {
        tpdChart.resize();
        if (prChart) {
            prChart.resize();
        }
        if (tieChart) {
            tieChart.resize();
        }
        if (cambioRiesgoChart) {
            cambioRiesgoChart.resize();
        }
    });

});
