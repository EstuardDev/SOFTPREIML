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
    var tiempoPromedioDeteccion = parseFloat(document.getElementById('tiempoPromedioDeteccionChart').getAttribute('data-tpd')) || 0;
    var porcentajeSeveraLeve = parseFloat(document.getElementById('casosSeveraLeveChart').getAttribute('data-porcentaje')) || 0;

    var barColor;
    if (porcentajeSeveraLeve >= 80) {
        barColor = '#198754'; 
    } else if (porcentajeSeveraLeve >= 50) {
        barColor = '#FFC107'; 
    } else {
        barColor = '#ff4500'; 
    }

    var severaLeveChartDom = document.getElementById('casosSeveraLeveChart');
    var severaLeveChart = echarts.init(severaLeveChartDom);
    var severaLeveOption = {
        title: {
            text: 'Riesgo Severo Controlado',
            left: 'center'
        },
        xAxis: {
            type: 'category',
            data: ['Cambio a Leve']
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
                data: [porcentajeSeveraLeve],
                label: {
                    show: true,
                    position: 'inside', 
                    formatter: '{c}%', 
                    fontSize: 35,
                    fontWeight: 'bold',
                    color: '#fff' 
                },
                itemStyle: {
                    color: barColor,  
                    borderRadius: [10, 10, 0, 0]  
                }
            }
        ]
    };
    severaLeveChart.setOption(severaLeveOption);

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

        prChart.on('mouseover', function (params) {
            if (params.dataIndex === 'pie') { 
                prOption.series[0].label.show = false;
                prChart.setOption(prOption, true);
            }
        });

        prChart.on('mouseout', () => {
            if (params.seriesType === 'pie') { 
                prOption.series[0].label.show = true; 
                prChart.setOption(prOption, true);
            }
        });

        prChart.setOption(prOption);
    }

    var tieChartDom = document.getElementById('tasaIntervencionChart');
    if (tieChartDom) {
        var tieChart = echarts.init(tieChartDom);
        var tieOption = {
            title: {
                text: 'Tasa de Intervención Efectiva (TIE)',
                left: 'center'
            },
            xAxis: {
                type: 'category',
                data: ['TIE']
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
                    name: 'Tasa de Intervención Efectiva',
                    type: 'bar',
                    data: [tasaIntervencion],
                    label: {
                        show: true,
                        position: 'inside',  
                        formatter: '{c}%',  
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
        if (severaLeveChart) {
            severaLeveChart.resize();
        }
    });

});
