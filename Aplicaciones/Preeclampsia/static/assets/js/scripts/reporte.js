document.addEventListener("DOMContentLoaded", function () {

    var date_range = null;

    // new DataTable('#tablaReportes', {
    //     lengthMenu: [[5, 10, 15, 20], [5, 10, 15, 20]],
    //     pageLength: 5,
    //     language: {
    //         url: '//cdn.datatables.net/plug-ins/2.1.8/i18n/es-ES.json',
    //     },
    // });
    /*var table =*/ 
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

    function generarReporte() {
        var parametros = {
            'action' : 'buscarReporte',            
            'start_date' : '21-10-2024',            
            'end_date' : '21-10-2024',            
        };

        if(date_range === null){
            parametros['start_date'] = date_range.startDate.format('DD-MM-YYYY');
            parametros['end_date'] = date_range.endDate.format('DD-MM-YYYY');
        }
    }

    $("#range-fecha").daterangepicker({
        opens: "left",
        locale: {
            format: "DD-MM-YYYY",
        },
    }).on('apply.daterangepicker', function(ev, picker) {
        date_range = picker;
        console.log(date_range);
    });
});
