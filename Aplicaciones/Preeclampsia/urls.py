from django.urls import path
from . import views

urlpatterns = [
    
    # path('', views.base, name="base"),
    path('', views.loginviews, name="login"),
    path('registrarPersonal/', views.registrarPersonal, name="registrarPersonal"),
    
    path('inicio/', views.inicio, name='inicio'),
    path('perfil/', views.perfil, name='perfil'),

    # path('edicionpersonal/<dni>', views.edicionMedico, name='edicionpersonal'),
        
    # -------------------- RUTAS PARA MEDICO --------------------
    path('medico/', views.medicoviews, name='medico'),
    path('guardarMedico/', views.guardarMedico, name='guardar'),
    path('edicionMedico/<dni>', views.edicionMedico, name='edicionMedico'),
    path('editarMedico/', views.editarMedico, name='editarMedico'),
    path('eliminarMedico/<dni>', views.eliminarMedico, name='eliminarMedico'),
    path('activarMedico/<dni>', views.activarMedico, name='activarMedico'),
    
    # -------------------- RUTAS PARA PACIENTE --------------------
    path('paciente/', views.pacienteviews, name='paciente'),
    path('guardarPaciente/', views.guardarPaciente, name='guardarPaciente'),
    path('edicionPaciente/<dni>', views.edicionPaciente, name='edicionPaciente'),
    path('editarPaciente/', views.editarPaciente, name='editarPaciente'),
    path('buscarPaciente/<dni>', views.buscarPaciente, name='buscarPaciente'),
    path('eliminarPaciente/<dni>', views.eliminarPaciente, name='eliminarPaciente'),
    path('activarPaciente/<dni>', views.activarPaciente, name='activarPaciente'),
    
    # -------------------- RUTAS PARA HISTORIAL --------------------
    path('historial/', views.historialviews, name='historial'),
    path('historialPaciente/<id>', views.verHistorialPaciente, name='historialPaciente'),
    path('guardarHistorial/', views.guardarHistorial, name='guardarHistorial'),
    path('edicionHistorial/<id>', views.edicionHistorial, name='edicionHistorial'),
    path('editarHistorial/', views.editarHistorial, name='editarHistorial'), 
    path('buscarHistorial/<dni>', views.buscarHistorial, name='buscarHistorial'), 
    path('eliminarHistorial/<id>', views.eliminarHistorial, name='eliminarHistorial'),   
    
    # -------------------- RUTAS PARA DIAGNOSTICO --------------------
    path('diagnostico/', views.diagnosticoviews, name='diagnostico'),
    path('diagnosticosPaciente/<id>', views.verHistorialDiagnostico, name='diagnosticosPaciente'),
    path('guardarDiagnostico/', views.guardarDiagnostico, name='guardarDiagnostico'),
    path('edicionDiagnostico/<id>', views.edicionDiagnostico, name='edicionDiagnostico'),
    path('editarDiagnostico/', views.editarDiagnostico, name='editarDiagnostico'),
    path('eliminarDiagnostico/<id>', views.eliminarDiagnostico, name='eliminarDiagnostico'),
    path('activarDiagnostico/<id>', views.activarDiagnostico, name='activarDiagnostico'), 
    
    # -------------------- RUTAS PARA REPORTES ------------------------
    path('reportes', views.reportesviews, name='reportes')
]