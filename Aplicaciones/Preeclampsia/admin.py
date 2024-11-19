from django.contrib import admin
from .models import Personal
from .models import Paciente
from .models import HistoriaClinica
from .models import Diagnostico

# Register your models here.

#LISTAMOS LOS REGISTROS EN DJANGO ADMIN EN TABLAS

# TABLA MEDICOS
class personalAdmin(admin.ModelAdmin):
    list_display = ('id', 'dni','nombre', 'apellidos', 'fecharegistro', 'estado')
    
admin.site.register(Personal, personalAdmin),

#TABLA PACIENTES
class pacienteAdmin(admin.ModelAdmin):
    list_display = ('id', 'dni', 'nombre', 'apellidos', 'edad', 'estado')

admin.site.register(Paciente, pacienteAdmin),

#TABLA HISTORIALCLINICO
class historialAdmin(admin.ModelAdmin):
    list_display = ('id', 'paciente', 'fecharegistro', 'horaregistro')
    
admin.site.register(HistoriaClinica, historialAdmin),

#TABLA DIAGNOSTICOS

class diagnosticoAdmin(admin.ModelAdmin):
    list_display = ('id', 'paciente', 'personal', 'hora_prediccion', 'fecha_prediccion', 'riesgo', 'nivelriesgo', 'estado')
    
admin.site.register(Diagnostico, diagnosticoAdmin),