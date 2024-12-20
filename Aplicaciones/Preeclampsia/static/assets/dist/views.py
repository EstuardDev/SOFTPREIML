import joblib
import os
from django.conf import settings
# from django.contrib import messages
from django.contrib.auth.models import User, Group
from collections import defaultdict
from datetime import timedelta, datetime
from django.db.models import Count
# from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Personal
from .models import Paciente
from .models import HistoriaClinica
from .models import Diagnostico
from collections import defaultdict
# Create your views here.

"""def base(request):
    return render(request, 'base.html')"""

# -------------------- VISTAS PARA LOGIN --------------------


# def reportesviews(request):
#     # Si no es una solicitud POST, simplemente renderiza la página de reportes
#     reportes = Diagnostico.objects.all()
#     return render(request, 'reportes.html', {"reportes": reportes})

# Vista de Reportes
def reportesviews(request):
    # Calcular los indicadores
    # proporcion_riesgo = calcular_proporcion_riesgo().get("PR", 0)
    # tasa_intervencion_efectiva = calcular_intervencion_efectiva().get("TIE", 0)
    # tiempo_promedio_deteccion = calcular_tiempo_promedio_deteccion()
    # casos_severa_a_leve = calcular_casos_severa_a_leve()

    # Obtener todos los reportes (diagnósticos)
    reportes = Diagnostico.objects.all()
    
    # Añadir el tiempo de detección formateado a cada diagnóstico (si tienes esta función implementada)
    for reporte in reportes:
        reporte.tiempo_deteccion_formateado = calcular_tiempo_deteccion(reporte)
    
    # Contexto
    contexto = {
        'reportes': reportes
        # 'proporcion_riesgo': proporcion_riesgo,
        # 'tasa_intervencion_efectiva': tasa_intervencion_efectiva,
        # 'tiempo_promedio_deteccion': tiempo_promedio_deteccion["TPD_formateado"],
        # 'tiempo_promedio_deteccion_segundos': tiempo_promedio_deteccion["TPD_segundos"],
        # 'casos_severa_a_leve': casos_severa_a_leve["casos_severa_a_leve"],
        # 'total_pacientes_con_severa': casos_severa_a_leve["total_pacientes_con_severa"],
        # 'porcentaje_severa_a_leve': casos_severa_a_leve["porcentaje_severa_a_leve"]
    }

    return render(request, 'reportes.html', contexto)

def loginviews(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        try:
            user = User.objects.get(username=username)
            if not user.is_active:
                return JsonResponse({
                    'success': False,
                    'message': 'El usuario está inactivo, contactarse con el administrador.'
                })
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'success': True,
                    'message': 'Inicio de sesión exitoso.'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Usuario o contraseña incorrectos, vuelva a intentarlo.'
                })
        except User.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'El usuario no existe.'
            })
    return render(request, 'login.html')

def registrarPersonal(request):
    if request.method == 'POST':
        try:
            dni = request.POST.get('dni')
            nombre = request.POST.get('nombre')
            apellidos = request.POST.get('apellidos')
            
            if Personal.objects.filter(dni=dni).exists():
                return JsonResponse({'success': False, 'message': 'El DNI ya está registrado, ingrese nuevamente el DNI'})

            # Crear personal
            Personal.objects.create(
                dni=dni,
                nombre=nombre,
                apellidos=apellidos,                
            )
            
            return JsonResponse({'success': True, 'message': '¡Inicia sesión con tu documento de identidad!'})

        except Exception as e:
            # Devolver objeto JSON con mensaje de error
            return JsonResponse({'success': False, 'message': str(e)})

    return JsonResponse({'success': False, 'message': 'Método no permitido.'})

def perfil(request):
    if request.method == 'POST':
        try:
            password = request.POST.get('password')
            new_password = request.POST.get('new_password')
            confirm_password = request.POST.get('confirm_password')

            # Validaciones para la contraseña
            if password and new_password and confirm_password:
                if request.user.check_password(password):
                    if new_password == confirm_password:
                        request.user.set_password(new_password)
                        request.user.save()
                        update_session_auth_hash(request, request.user)
                        return JsonResponse({
                            'success': True,
                            'message': 'Contraseña actualizada correctamente.'
                        })
                    else:
                        return JsonResponse({
                            'success': False,
                            'message': 'Las contraseñas no coinciden, vuelva a intentarlo.'
                        })
                else:
                    return JsonResponse({
                        'success': False,
                        'message': 'La contraseña actual es incorrecta.'
                    })
            
            if password:
                # Solo se ingresó la contraseña actual y no se actualizaron otros campos
                return JsonResponse({
                    'success': True,
                    'message': 'No se realizaron cambios.'
                })
            
            return JsonResponse({
                'success': False,
                'message': 'No ha ingresado su nueva contraseña, por favor vuelva a intentarlo.'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': 'Error al actualizar el perfil: ' #+ str(e)
            })   
    # Renderizamos el tempalte del perfil
    else:
        try:
            personal = request.user.personal
        except Personal.DoesNotExist:
            personal = None
        rol = request.user.groups.first().name
        return render(request, 'perfil.html', {'personal': personal, 'rol': rol})

# -------------------- VISTAS PARA INCIO --------------------

@login_required
def inicio(request):
    pacientes = Paciente.objects.all().count()
    medicos = Personal.objects.all().count()
    historias_clinicas = HistoriaClinica.objects.all().count()
    # diagnosticos = Diagnostico.objects.all().order_by('-id')[:5]  # Obtener los últimos 5 diagnósticos
    diagnosticos = Diagnostico.objects.order_by('paciente', '-fecha_prediccion').distinct('paciente')[:5]
    
    # Calcular los indicadores
    proporcion_riesgo = calcular_proporcion_riesgo().get("PR", 0)
    tasa_intervencion_efectiva = calcular_intervencion_efectiva().get("sin_progresion", 0)
    fecha_ultimo_diagnostico = calcular_intervencion_efectiva().get("fechaTIE", None)
    casos_cambios_a_riesgo = calcular_cambios_a_riesgo().get("PCR", 0)
    tiempo_promedio_deteccion = calcular_tiempo_promedio_deteccion()
    
    # Contexto
    contexto = {
        'proporcion_riesgo': proporcion_riesgo,
        'tasa_intervencion_efectiva': tasa_intervencion_efectiva,
        'fecha_intervencion_efectiva': fecha_ultimo_diagnostico,
        'tiempo_promedio_deteccion': tiempo_promedio_deteccion["TPD_formateado"],
        'tiempo_promedio_deteccion_segundos': tiempo_promedio_deteccion["TPD_segundos"],
        'casos_cambios_a_riesgo': casos_cambios_a_riesgo
    }

    return render(request, "inicio.html", {"pacientes": pacientes, "medicos": medicos, "historias_clinicas": historias_clinicas, "diagnostico": diagnosticos} | contexto)

# -------------------- VISTAS PARA PERSONAL MEDICOS --------------------
@login_required
def medicoviews(request):
    personalListado = Personal.objects.all()
    return render(request, "medico.html", {"medico": personalListado})     

def guardarMedico(request):
    if request.method == 'POST':
        try:
            dni = request.POST['txtdni']
            nombre = request.POST['txtnombre']
            apellidos = request.POST['txtapellido']
            
            if Personal.objects.filter(dni=dni).exists():
                return JsonResponse({'success': False, 'message': 'El DNI ya existe. Por favor, ingrese un DNI diferente.'})
            
            Personal.objects.create(dni=dni, nombre=nombre, apellidos=apellidos)
            return JsonResponse({'success': True, 'message': 'Médico registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': 'Ha ocurrido un error inesperado. Por favor, intente más tarde.'})
    return JsonResponse({'success': False, 'message': 'Método no permitido.'})

def desactivarmedico(request, pk):
     personal = Personal.objects.get(id=pk)
     personal.estado = '0'
     personal.save()
     return redirect('/medico')

def edicionMedico(request, dni):
    try:
        personal = Personal.objects.get(dni=dni)
        data = {
            "success": True,
            "personal": {
                "dni": personal.dni,
                "nombre": personal.nombre,
                "apellidos": personal.apellidos
            }
        }
    except Personal.DoesNotExist:
        data = {
            "success": False,
            "message": "El médico no existe."
        }
    return JsonResponse(data)

def editarMedico(request):
    if request.method == "POST":
        dni = request.POST.get('txteditdni')
        nombre = request.POST.get('txteditnombre')
        apellidos = request.POST.get('txteditapellido')
        try:
            personal = Personal.objects.get(dni=dni)
            personal.nombre = nombre
            personal.apellidos = apellidos
            personal.save()
            return JsonResponse({
                "success": True,
                "message": "Médico actualizado correctamente."
            })
        except Personal.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar el Médico."
            })
    return JsonResponse({
        "success": False,
        "message": "Método no permitido."
    })

def eliminarMedico(request, dni):
    if request.method == 'DELETE':
        try:
            personal = Personal.objects.get(dni=dni)
            personal.estado = 0
            personal.save()
            personal.user.is_active = False
            personal.user.save()
            return JsonResponse({
                "success": True,
                "message": "Médico inactivo correctamente."
            })
        except Personal.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar el Médico."
            })
    return JsonResponse({
        "success": False,
        "message": "Método no permitido."
    })

def activarMedico(request, dni):
    if request.method == 'PATCH':
        try:
            personal = Personal.objects.get(dni=dni)
            personal.estado = 1
            personal.save()
            personal.user.is_active = True
            personal.user.save()
            return JsonResponse({
                "success": True,
                "message": "Médico activado correctamente."
            })
        except Personal.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar el Médico."
            })
    return JsonResponse({
        "success": False,
        "message": "Método no permitido."
    })
    

# -------------------- VISTAS PARA PACIENTES --------------------
@login_required
def pacienteviews(request):
    pacientesListados = Paciente.objects.all()
    return render(request, "paciente.html", {"paciente": pacientesListados})

def verHistorialPaciente(request, id):
    try:
        paciente = Paciente.objects.get(id=id, personal=request.user.personal)  # Filtra por personal autenticado
        historialPac = HistoriaClinica.objects.filter(paciente=paciente).select_related('paciente')
        historial_list = list(historialPac.values(
            'fecharegistro', 'horaregistro', 'edadgestacional', 'periodointergenesico', 'embarazonuevopareja',
            'hipertensioncronica', 'pasistolicabasal', 'padiastolicabasal', 'presionsistolica1',
            'presiondiastolica1', 'presionsistolica2', 'presiondiastolica2', 'testdeass',
            'proteinaorina', 'tgo', 'tgp', 'creatinina', 'urea', 'fibrinogeno', 'fecharegistro'
        ))
        return JsonResponse({
            'success': True,
            'historialPac': historial_list,
            'nombrePaciente': paciente.nombre,
            'apellidoPaciente': paciente.apellidos
        })
    except Paciente.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Paciente no encontrado o no autorizado.'})

# def pacientesActivos(request):
#     pacientesActivos = Paciente.objects.filter(estado='1')
#     # print(pacientesActivos)
#     return render(request, "inicio.html", {"pacientesActivos": pacientesActivos})

def generar_Nhistoriaclinica():
    ultimo_numero = Paciente.objects.all().order_by('-numeroHistoriaClinica').first()
    if ultimo_numero:
        ultimo_numero = int(ultimo_numero.numeroHistoriaClinica[2:]) + 1
    else:
        ultimo_numero = 1
    return f"HC{ultimo_numero:05d}"[:50]

def guardarPaciente(request):
    if request.method == 'POST':
        try:
            dni = request.POST['txtdni']
            nombre = request.POST['txtnombre']
            apellidos = request.POST['txtapellido']
            edad = request.POST['txtedad']
            numgestacion = request.POST['txtnumgestacion']
            numhistoriaclinica = generar_Nhistoriaclinica()

            if Paciente.objects.filter(dni=dni).exists():
                return JsonResponse({'success': False, 'message': 'El DNI ya existe. Por favor, ingrese un DNI diferente.'})

            # Asigna el médico autenticado como el personal del paciente
            personal = request.user.personal
            Paciente.objects.create(
                dni=dni, nombre=nombre, apellidos=apellidos, edad=edad,
                numeroHistoriaClinica=numhistoriaclinica, numgestacion=numgestacion,
                personal=personal
            )
            return JsonResponse({'success': True, 'message': 'Paciente registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': 'Ha ocurrido un error inesperado. Por favor, intente más tarde.'})
    return JsonResponse({'success': False, 'message': 'Método no permitido.'})

def edicionPaciente(request, dni):
    try:
        paciente = Paciente.objects.get(dni=dni)
        data = {
            "success": True,
            "paciente": {
                "dni": paciente.dni,
                "nombre": paciente.nombre,
                "apellidos": paciente.apellidos,
                "edad": paciente.edad,
                "numgestacion": paciente.numgestacion
            }
        }
    except Paciente.DoesNotExist:
        data = {
            "success": False,
            "message": "El paciente no existe."
        }
    return JsonResponse(data)

def editarPaciente(request):
    if request.method == "POST":
        dni = request.POST.get('txteditdni')
        nombre = request.POST.get('txteditnombre')
        apellidos = request.POST.get('txteditapellido')
        edad = request.POST.get('txteditedad')
        numgestacion = request.POST.get('txteditngestacion')
        try:
            # Filtra por el personal autenticado
            paciente = Paciente.objects.get(dni=dni, personal=request.user.personal)
            paciente.nombre = nombre
            paciente.apellidos = apellidos
            paciente.edad = edad
            paciente.numgestacion = numgestacion
            paciente.save()
            return JsonResponse({
                "success": True,
                "message": "Paciente actualizado correctamente."
            })
        except Paciente.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar al paciente o no tiene permisos para editarlo."
            })
    return JsonResponse({
        "success": False,
        "message": "Método no permitido."
    })

# def buscarPaciente(request, dni):
#     try:
#         paciente = Paciente.objects.get(dni=dni)
#         data = {
#             "success": True,
#             "paciente": {
#                 "dni": paciente.dni,
#                 "nombre": paciente.nombre,
#                 "apellidos": paciente.apellidos,
#                 "edad": paciente.edad,
#                 "numgestacion": paciente.numgestacion,
#             }            
#         }
#     except Paciente.DoesNotExist:
#         data = {
#             "success": False,
#             "message": "El paciente no existe."
#         }
#     return JsonResponse(data)

def buscarPaciente(request, dni): 
    try: 
        paciente = Paciente.objects.get(dni=dni) 
        # Obtener el historial clínico más reciente
        historial = HistoriaClinica.objects.filter(paciente=paciente).order_by('-fecharegistro').first()
        
        # Inicializar variables para el historial
        pasBasal = None
        padBasal = None
        periodoIntergenesico = None
        edadGestacional = None
        embarazoNuevaPareja = None
        hipertensionCronica = None
        
        if historial:
            # Asignar los valores desde el historial
            pasBasal = historial.pasistolicabasal
            padBasal = historial.padiastolicabasal
            periodoIntergenesico = historial.periodointergenesico
            edadGestacional = historial.edadgestacional
            embarazoNuevaPareja = historial.embarazonuevopareja
            hipertensionCronica = historial.hipertensioncronica
            
            # Sumar 1 a la edad gestacional
            if edadGestacional is not None:
                edadGestacional += 1
            
        data = { 
            "success": True, 
            "paciente": { 
                "dni": paciente.dni, 
                "nombre": paciente.nombre, 
                "apellidos": paciente.apellidos, 
                "edad": paciente.edad, 
                "numgestacion": paciente.numgestacion,
                "pasBasal": pasBasal,
                "padBasal": padBasal,
                "periodoIntergenesico": periodoIntergenesico,
                "edadGestacional": edadGestacional,
                "embarazoNuevaPareja": embarazoNuevaPareja,
                "hipertensionCronica": hipertensionCronica,
            } 
        } 
    except Paciente.DoesNotExist: 
        data = { 
            "success": False, 
            "message": "El paciente no existe." 
        } 
    return JsonResponse(data)

def eliminarPaciente(request, dni):
    if request.method == 'DELETE':
        try:
            paciente = Paciente.objects.get(dni=dni, personal=request.user.personal)
            paciente.estado = '0'
            paciente.save()
            return JsonResponse({
                "success": True,
                "message": "Paciente inactivo correctamente."
            })
        except Paciente.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar el Paciente o no tiene permisos para inactivarlo."
            })
    return JsonResponse({
        "success": False,
        "message": "Método no permitido."
    })

def activarPaciente(request, dni):
    if request.method == 'PATCH':
        try:
            paciente = Paciente.objects.get(dni=dni, personal=request.user.personal)  # Filtra por personal autenticado
            paciente.estado = '1'
            paciente.save()
            return JsonResponse({
                "success": True,
                "message": "Paciente activado correctamente."
            })
        except Paciente.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar el Paciente o no tiene permisos para activarlo."
            })
    return JsonResponse({
        "success": False,
        "message": "Método no permitido."
    })

def desactivarpaciente(request, pk):
    paciente = Paciente.objects.get(id=pk)
    paciente.estado = '0'
    paciente.save()
    return redirect('/paciente')

# -------------------- VISTAS PARA HISTORIAL CLINICO --------------------
@login_required
def historialviews(request):
    historiasListadas = HistoriaClinica.objects.all()
    return render(request, "historial.html", {"historial": historiasListadas})

def guardarHistorial(request):
    if request.method == 'POST':
        dni = request.POST['txtdni']       
        edadgestacional = request.POST['txtedadgestacional']
        periodointergenesico = request.POST['txtperiodointerg']
        embarazonuevopareja = request.POST['txtembarazonuevapareja']
        hipertensioncronica = request.POST['txthipertCronica']
        pasistolicabasal = request.POST['txtsistolicabasal']
        padiastolicabasal = request.POST['txtdiastolicabasal']
        presionsistolica1 = request.POST['txtsistolicaM1']
        presiondiastolica1 =request.POST['txtdiastolicaM1']
        presionsistolica2 = request.POST['txtsistolicaM2']
        presiondiastolica2 = request.POST['txtdiastolicaM2']
        testdeass = float(request.POST.get('txttestdeass', '0.0') or '0.0')
        proteinaorina = float(request.POST.get('txtproteinuria', '0.0') or '0.0')
        tgo = float(request.POST.get('txttgo', '0.0') or '0.0')
        tgp = float(request.POST.get('txttgp', '0.0') or '0.0')
        creatinina = float(request.POST.get('txtcreatinina', '0.0') or '0.0')
        urea = float(request.POST.get('txturea', '0.0') or '0.0')
        fibrinogeno = float(request.POST.get('txtfibrinogeno', '0.0') or '0.0')
        try:
            paciente = Paciente.objects.get(dni=dni)
            # Obtener la fecha actual
            fecha_actual = datetime.now().date()  # Solo la fecha
            # Obtener la hora actual (si deseas establecerla manualmente)
            hora_actual = datetime.now().time()  # Solo la hora
            HistoriaClinica.objects.create(paciente=paciente,horaregistro=hora_actual, fecharegistro=fecha_actual, edadgestacional=edadgestacional, periodointergenesico=periodointergenesico,
                                           embarazonuevopareja=embarazonuevopareja, hipertensioncronica=hipertensioncronica, 
                                           pasistolicabasal=pasistolicabasal, padiastolicabasal=padiastolicabasal, presionsistolica1=presionsistolica1, 
                                        presiondiastolica1=presiondiastolica1, presionsistolica2=presionsistolica2, presiondiastolica2=presiondiastolica2, 
                                           testdeass=testdeass, proteinaorina=proteinaorina, tgo=tgo, tgp=tgp, creatinina=creatinina, 
                                           urea=urea,fibrinogeno=fibrinogeno)
            return JsonResponse({"success": True, "message": "Historial registrado correctamente."})
        except Paciente.DoesNotExist:
            return JsonResponse({"success": False, "message": "Paciente no encontrado."})
    return JsonResponse({"success": False, "message": "Método no permitido."})

def edicionHistorial(request, id):
    try:
        historial = HistoriaClinica.objects.get(id=id)
        data = {
            "success": True,
            "historial": {
                "id": historial.id,
                "dni": historial.paciente.dni,
                "nombre": historial.paciente.nombre,
                "apellidos": historial.paciente.apellidos,
                "edad": historial.paciente.edad,
                "fecharegistro": historial.fecharegistro,
                "horaregistro": historial.horaregistro,
                "edadgestacional": historial.edadgestacional,
                "periodointergenesico": historial.periodointergenesico,
                "embarazonuevopareja": historial.embarazonuevopareja,
                "hipertensioncronica": historial.hipertensioncronica,
                "pasistolicabasal": historial.pasistolicabasal,
                "padiastolicabasal": historial.padiastolicabasal,
                "presionsistolica1": historial.presionsistolica1,
                "presiondiastolica1": historial.presiondiastolica1,
                "presionsistolica2": historial.presionsistolica2,
                "presiondiastolica2": historial.presiondiastolica2,
                "testdeass": historial.testdeass,
                "proteinaorina": historial.proteinaorina,
                "tgo": historial.tgo,
                "tgp": historial.tgp,
                "creatinina": historial.creatinina,
                "urea": historial.urea,
                "fibrinogeno": historial.fibrinogeno
            }
        }
        # print(data),
    except HistoriaClinica.DoesNotExist:
        data = {
            "success": False,
            "message": "Historial no encontrado."
        }
    return JsonResponse(data)   

def editarHistorial(request):
    if request.method == "POST":
        id = request.POST.get('txteditid')
        dni = request.POST.get('txteditdni')
        edad = request.POST.get('txteditedad')
        horaregistro = request.POST.get('txteditfecha')
        fecharegistro = request.POST.get('txtedithora')
        # Suponiendo que horaregistro es una fecha en formato 'YYYY-MM-DD'
        fecha_convertida = datetime.strptime(horaregistro, '%Y-%m-%d').date()
        # Suponiendo que fecharegistro es una hora en formato 'HH:MM:SS'
        hora_convertida = datetime.strptime(fecharegistro, '%H:%M:%S').time()
        edadgestacional = request.POST.get('txteditedadgestacional')
        periodointergenesico = request.POST.get('txteditperiodointerg')
        embarazonuevopareja = request.POST.get('txteditembarazonuevapareja')
        hipertensioncronica = request.POST.get('txtedithipertCronica')
        pasistolicabasal = request.POST.get('txteditsistolicabasal')
        padiastolicabasal = request.POST.get('txteditdiastolicabasal')
        presionsistolica1 = request.POST.get('txteditsistolicaM1')
        presiondiastolica1 =request.POST.get('txteditdiastolicaM1')
        presionsistolica2 = request.POST.get('txteditsistolicaM2')
        presiondiastolica2 = request.POST.get('txteditdiastolicaM2')
        testdeass = float(request.POST.get('txtedittestdeass', '0.0') or '0.0')
        proteinaorina = float(request.POST.get('txteditproteinuria', '0.0') or '0.0')
        tgo = float(request.POST.get('txtedittgo', '0.0') or '0.0')
        tgp = float(request.POST.get('txtedittgp', '0.0') or '0.0')
        creatinina = float(request.POST.get('txteditcreatinina', '0.0') or '0.0')
        urea = float(request.POST.get('txtediturea', '0.0') or '0.0')
        fibrinogeno = float(request.POST.get('txteditfibrinogeno', '0.0') or '0.0')
        try:
            paciente = Paciente.objects.get(dni=dni)
            historialc = HistoriaClinica.objects.get(id=id, paciente=paciente)
            historialc.paciente = paciente
            historialc.fecharegistro = fecha_convertida
            historialc.horaregistro = hora_convertida
            historialc.edadgestacional = edadgestacional
            historialc.periodointergenesico = periodointergenesico
            historialc.embarazonuevopareja = embarazonuevopareja
            historialc.hipertensioncronica = hipertensioncronica
            historialc.pasistolicabasal = pasistolicabasal
            historialc.padiastolicabasal = padiastolicabasal
            historialc.presionsistolica1 = presionsistolica1
            historialc.presiondiastolica1 = presiondiastolica1
            historialc.presionsistolica2 = presionsistolica2
            historialc.presiondiastolica2 = presiondiastolica2
            historialc.testdeass = testdeass
            historialc.proteinaorina = proteinaorina
            historialc.tgo = tgo
            historialc.tgp = tgp
            historialc.creatinina = creatinina
            historialc.urea = urea
            historialc.fibrinogeno = fibrinogeno
            historialc.save()
                        
            return JsonResponse({
                "success": True,
                "message": "Historial Clínico actualizado correctamente."
            })
                        
        except Paciente.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "Paciente no encontrado."
            })

        except HistoriaClinica.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "Historial Clínico no encontrado."
            })

        except Exception as e:
            print(e),
            return JsonResponse({
                "success": False,
                "message": "Error al actualizar el historial." + str(e),
            })

    return JsonResponse({
        "success": False,
        "message": "Método no permitido."
    })    
    
def eliminarHistorial(request, id):
    try:
        historial = HistoriaClinica.objects.get(id=id)
        historial.delete()
        data = {
            "success": True,
            "message": "El historial ha sido eliminado."
        }
    except HistoriaClinica.DoesNotExist:
        data = {
            "success": False,
            "message": "El historial no existe."
        }
    return JsonResponse(data)

# -------------------- VISTAS PARA DIAGNOSTICOS --------------------
# @login_required
# def diagnosticoviews(request):
#     diagnosticos = Diagnostico.objects.all() # Filtrar los diagnósticos según el personal relacionado
#     return render(request, "diagnostico.html", {"diagnostico": diagnosticos})

@login_required
def diagnosticoviews(request):
    diagnosticos = Diagnostico.objects.order_by('paciente', '-fecha_prediccion').distinct('paciente')
    return render(request, "diagnostico.html", {"diagnostico": diagnosticos})

def guardarDiagnostico(request):
    if request.method == 'POST':
        try:
            # Rutas de los modelos guardados
            modelo_path = os.path.join(settings.STATICFILES_DIRS[0], 'assets', 'modelo', 'modelo_gradient_boosting.pkl')
            scaler_path = os.path.join(settings.STATICFILES_DIRS[0], 'assets', 'modelo', 'scaler_gradient_boosting.pkl')
            label_encoder_path = os.path.join(settings.STATICFILES_DIRS[0], 'assets', 'modelo', 'label_encoder_gradient_boosting.pkl')
            
            # Cargar el modelo, escalador y codificador de etiquetas
            modelo = joblib.load(modelo_path)
            scaler = joblib.load(scaler_path)
            label_encoder = joblib.load(label_encoder_path)
            
            # Obtener datos de la solicitud
            dni = request.POST.get('txtdni')
            edad_gestacional = float(request.POST.get('txtedadgestacional', '0') or '0')
            periodo_intergenesico = float(request.POST.get('txtperiodointerg', '0') or '0')
            embarazo_nueva_pareja = 1 if request.POST.get('txtembarazonuevapareja') == 'SI' else 0
            hipertension_cronica = 1 if request.POST.get('txthipertCronica') == 'SI' else 0
            pa_sistolica_basal = float(request.POST.get('txtsistolicabasal', '0') or '0')
            pa_diastolica_basal = float(request.POST.get('txtdiastolicabasal', '0') or '0')
            presion_sistolica1 = float(request.POST.get('txtsistolicaM1', '0') or '0')
            presion_diastolica1 = float(request.POST.get('txtdiastolicaM1', '0') or '0')
            presion_sistolica2 = float(request.POST.get('txtsistolicaM2', '0') or '0')
            presion_diastolica2 = float(request.POST.get('txtdiastolicaM2', '0') or '0')
            test_de_as = float(request.POST.get('txttestdeass', '0') or '0')
            # Obtener el valor de proteinuria en mg/24h y convertirlo a g/24h
            proteina_orina = float(request.POST.get('txtproteinuria', '0') or '0')
            proteinuria_g = proteina_orina / 1000  # Conversión a g/24h
            tgo = float(request.POST.get('txttgo', '0') or '0')
            tgp = float(request.POST.get('txttgp', '0') or '0')
            creatinina = float(request.POST.get('txtcreatinina', '0') or '0')
            urea = float(request.POST.get('txturea', '0') or '0')
            fibrinogeno = float(request.POST.get('txtfibrinogeno', '0') or '0')

            # Formatear datos de entrada
            datos = [[                
                edad_gestacional, periodo_intergenesico, embarazo_nueva_pareja, hipertension_cronica, pa_sistolica_basal,
                pa_diastolica_basal, presion_sistolica1, presion_diastolica1, presion_sistolica2, presion_diastolica2,
                test_de_as, proteinuria_g, tgo, tgp, creatinina, urea, fibrinogeno
            ]]
            
            # Escalar los datos
            datos_scaled = scaler.transform(datos)
            
            # Realizar la predicción y decodificarla
            riesgo_codificado = modelo.predict(datos_scaled)[0]
            riesgo = label_encoder.inverse_transform([riesgo_codificado])[0]
            
            # Calcular PAM
            pam1 = (presion_sistolica1 + 2 * presion_diastolica1) / 3
            pam2 = (presion_sistolica2 + 2 * presion_diastolica2) / 3
            pam_promedio = (pam1 + pam2) / 2

            # Determinar el riesgo decimal y nivel de riesgo
            if riesgo == 0: #"No Preeclampsia"
                nivel_riesgo = "No Preeclampsia"
                riesgo_decimal = pam_promedio
            elif riesgo == 1: #"Preeclampsia"
                nivel_riesgo = "Preeclampsia"
                riesgo_decimal = pam_promedio
            elif riesgo == 2: #"Leve"
                nivel_riesgo = "Leve"
                riesgo_decimal = pam_promedio
            elif riesgo == 3: #"Severa"
                nivel_riesgo = "Leve"
                riesgo_decimal = pam_promedio
            else:
                raise ValueError(f"El valor de riesgo devuelto por el modelo no es válido: {riesgo_codificado}")
            
            # Obtener paciente y guardar diagnóstico
            # Obtener la fecha actual
            fecha_actual = datetime.now().date()  # Solo la fecha
            # Obtener la hora actual (si deseas establecerla manualmente)
            hora_actual = datetime.now().time()  # Solo la hora
            paciente = Paciente.objects.get(dni=dni)  # Asegúrate de que el paciente existe
            historiaclinica = HistoriaClinica.objects.filter(paciente=paciente).latest('fecharegistro')
            diagnostico = Diagnostico(
                paciente=paciente,
                personal=request.user.personal, 
                historia_clinica=historiaclinica,
                hora_prediccion=hora_actual,
                fecha_prediccion=fecha_actual,
                riesgo=riesgo_decimal,
                nivelriesgo=nivel_riesgo,
                detalles="Sin observaciones",
                estado="Evaluado"
            )
            diagnostico.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Se ha evaluado correctamente.'
            })
        except Paciente.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Paciente no encontrado.'
            })
        except ValueError as e:
            return JsonResponse({
                'success': False,
                'message': f'Error en los datos proporcionados: {e}'
            })
        except Exception as e:
            # print(f"Error: {e}")
            return JsonResponse({
                'success': False,
                'message': 'Hubo un problema al guardar el diagnóstico.'
            })
    else:
        return JsonResponse({
            'success': False,
            'message': 'Error no permitido.'
        })

def verHistorialDiagnostico(request, id):
    try:
        ultimo_diagnostico = Diagnostico.objects.filter(paciente=id).latest('fecha_prediccion')
        evaluacionPaciente = Diagnostico.objects.filter(paciente=id).exclude(id=ultimo_diagnostico.id).select_related('paciente')
        paciente = Paciente.objects.get(id=id)
        listEvaluacion = list(evaluacionPaciente.values(
            'id',
            'fecha_prediccion',
            'riesgo',
            'nivelriesgo',
            'estado',
            'detalles'
        ))
        return JsonResponse({
            'success': True,
            'evaluacionPaciente': listEvaluacion,
            'nombrePaciente': paciente.nombre, 
            'apellidoPaciente': paciente.apellidos
        })
    except Diagnostico.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Diagnóstico no encontrado.'})
    except Paciente.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Paciente no encontrado.'})

def buscarHistorial(request, dni):
    try:
        paciente = Paciente.objects.get(dni=dni)
        historial = HistoriaClinica.objects.filter(paciente=paciente).latest('fecharegistro')
        data = {
            "success": True,
            "paciente": {
                "nombre": paciente.nombre, 
                "apellidos": paciente.apellidos,
                "edad": paciente.edad,
                "edadgestacional": historial.edadgestacional,
                "periodointergenesico": historial.periodointergenesico,
                "embarazonuevopareja": historial.embarazonuevopareja,
                "hipertensioncronica": historial.hipertensioncronica,
                "pasistolicabasal": historial.pasistolicabasal,
                "padiastolicabasal": historial.padiastolicabasal,
                "presionsistolica1": historial.presionsistolica1,
                "presiondiastolica1": historial.presiondiastolica1,
                "presionsistolica2": historial.presionsistolica2,
                "presiondiastolica2": historial.presiondiastolica2,
                "testdeass": historial.testdeass,
                "proteinaorina": historial.proteinaorina,
                "tgo": historial.tgo,
                "tgp": historial.tgp,
                "creatinina": historial.creatinina,
                "urea": historial.urea,
                "fibrinogeno": historial.fibrinogeno
            }
        }
    except Paciente.DoesNotExist:
        data = {
            "success": False,
            "message": "El paciente no existe."
        }
    except HistoriaClinica.DoesNotExist:
        data = {
            "success": False,
            "message": "No se encontró historial clínico para este paciente."
        }
    return JsonResponse(data)   

def edicionDiagnostico(request, id):
    try:
        diagnostico = Diagnostico.objects.get(id=id)
        data = {
            "success": True,
            "diagnostico": {
                "id": diagnostico.id,  
                "paciente": f"{diagnostico.paciente.nombre} {diagnostico.paciente.apellidos}",
                "personal": f"{diagnostico.personal.nombre} {diagnostico.personal.apellidos}",
                "fecha_prediccion": diagnostico.fecha_prediccion,              
                "hora_prediccion": diagnostico.hora_prediccion,              
                "riesgo": diagnostico.riesgo,              
                "nivelriesgo": diagnostico.nivelriesgo,              
                "estado": diagnostico.estado,              
                "detalles": diagnostico.detalles,              
            }
        }
        print(data),
    except Diagnostico.DoesNotExist:
        data = {
            "success": False,
            "message": "El diagnóstico no existe."
        }
    return JsonResponse(data)

def editarDiagnostico(request):
    if request.method == "POST":
        id = request.POST.get('txteditid')
        nompaciente = request.POST.get('txteditnombrespaciente')
        nommedico = request.POST.get('txteditnombresmedico')
        fecha_prediccion = request.POST.get('txteditfechadiagnostico')
        hora_prediccion = request.POST.get('txtedithoradiagnostico')
        riesgo = request.POST.get('txteditriesgo')
        nivelriesgo = request.POST.get('txteditnivelriesgo')
        estado = request.POST.get('txteditestado')
        detalles = request.POST.get('txteditdetalles')
        try:
            diagnostico = Diagnostico.objects.get(id=id)
            diagnostico.paciente.nombre = nompaciente
            diagnostico.personal.nombre = nommedico
            diagnostico.fecha_prediccion = fecha_prediccion
            diagnostico.hora_prediccion = hora_prediccion
            diagnostico.riesgo = riesgo
            diagnostico.nivelriesgo = nivelriesgo
            diagnostico.estado = estado
            diagnostico.detalles = detalles
            diagnostico.save()
            return JsonResponse({
                "success": True,
                "message": "Diagnostico actualizado correctamente."
            })
        except Paciente.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar el diagnóstico."
            })
    return JsonResponse({
        "success": False,
        "message": "Diagnóstico no permitido."
    })

def eliminarDiagnostico(request, id):
    if request.method == 'DELETE':
        try:
            diagnostico = Diagnostico.objects.get(id=id)
            diagnostico.estado = 'Proceso'
            diagnostico.save()
            return JsonResponse({
                "success": True,
                "message": "Diagnostico del paciente inactivo correctamente."
            })
        except Diagnostico.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar el Diagnóstico."
            })
    return JsonResponse({
        "success": False,
        "message": "Método no permitido."
    })

def activarDiagnostico(request, id):
    if request.method == 'PATCH':
        try:
            diagnostico = Diagnostico.objects.get(id=id)
            diagnostico.estado = 'Evaluado'
            diagnostico.save()
            return JsonResponse({
                "success": True,
                "message": "Diagnóstico activado correctamente."
            })
        except Diagnostico.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar el Diagnóstico."
            })
    return JsonResponse({
        "success": False,
        "message": "Método no permitido."
    })

# CALCULOS DE INDICADORES:

# Vista de Cálculo de Indicadores Individuales
def calcular_indicadores(request):
    # Calcular los indicadores individualmente
    TPD = calcular_tiempo_deteccion(Diagnostico.objects.first()).get("TPD", "00:00:00")
    PR = calcular_proporcion_riesgo().get("PR", 0)
    TIE = calcular_intervencion_efectiva().get("TIE", 0)
    
    # Pasar los valores calculados al contexto
    context = {
        'TPD': TPD,
        'PR': PR,
        'TIE': TIE
    }
    
    return render(request, 'reportes.html', context)

# 1. Cálculo del Tiempo Promedio de Detección por paciente(TPD)
def calcular_tiempo_deteccion(diagnostico):
    try:
        # Obtener la hora de predicción del diagnóstico
        tiempo_final = diagnostico.hora_prediccion
        # Obtener el historial clínico relacionado con el diagnóstico
        historial = diagnostico.historia_clinica
        # Obtener la hora de registro del historial
        tiempo_inicio = historial.horaregistro

        if tiempo_final and tiempo_inicio:
            # Combinar la fecha actual con las horas para calcular la diferencia
            ahora = datetime.now()
            tiempo_final_completo = datetime.combine(ahora.date(), tiempo_final)
            tiempo_inicio_completo = datetime.combine(ahora.date(), tiempo_inicio)

            # Calcular la diferencia de tiempo
            tiempo_deteccion = tiempo_final_completo - tiempo_inicio_completo
            
            # Asegurarse de que la diferencia no sea negativa
            if tiempo_deteccion < timedelta(0):
                return "00:00:00"

            dias = tiempo_deteccion.days
            horas, resto = divmod(tiempo_deteccion.seconds, 3600)
            minutos, segundos = divmod(resto, 60)

            if dias > 0:
                return f"{dias}d {horas:02}h {minutos:02}m {segundos:02}s"
            elif horas > 0:
                return f"{horas:02}h {minutos:02}m {segundos:02}s"
            else:
                return f"{minutos:02}m {segundos:02}s"
        else:
            return "00:00:00"
    except Exception as e:
        # Puedes imprimir el error para depuración si es necesario
        print(f"Error: {e}")
        return "00:00:00"

# Cálculo del Tiempo Promedio de Detección nivel general(TPD)
"""def calcular_tiempo_promedio_deteccion():
    # Obtener una lista de IDs únicos de pacientes
    pacientes_ids = Diagnostico.objects.values_list('paciente', flat=True).distinct()
    
    total_tiempo_deteccion = timedelta(0)  # Inicializar el tiempo total de detección acumulado
    # print('Total Tiempodeteccion: ', total_tiempo_deteccion)
    
    total_pacientes = 0  # Contador de pacientes únicos evaluados
    # print('Total Pacientes: ', total_pacientes)
    

    for paciente_id in pacientes_ids:
        # Obtener el primer y el último diagnóstico del paciente (ordenados por fecha)
        primer_diagnostico = Diagnostico.objects.filter(paciente_id=paciente_id).order_by('fecha_prediccion').first()
        # print('1° Diagnostico: ', primer_diagnostico)
        
        ultimo_diagnostico = Diagnostico.objects.filter(paciente_id=paciente_id).order_by('fecha_prediccion').last()
        # print('Ultimo Diagnostico: ', ultimo_diagnostico)
        
        # Calcular el tiempo de detección solo si ambos diagnósticos existen
        if primer_diagnostico and ultimo_diagnostico:
            # Calcula la diferencia entre el último diagnóstico y el primer registro de historial
            tiempo_deteccion = ultimo_diagnostico.fecha_prediccion - primer_diagnostico.historia_clinica.fecharegistro
            total_tiempo_deteccion += tiempo_deteccion  # Acumular el tiempo de detección
            total_pacientes += 1  # Contar este paciente único

    # Calcular el tiempo promedio de detección
    if total_pacientes > 0:
        # print('Total tiempo deteccion: ', total_tiempo_deteccion)
        # print('Total Pacientes: ', total_pacientes)

        tiempo_promedio_deteccion = total_tiempo_deteccion / total_pacientes
    else:
        tiempo_promedio_deteccion = timedelta(0)  # Si no hay pacientes, el promedio es 0

    # Convertir el tiempo promedio a días, horas, minutos y segundos para legibilidad
    dias = tiempo_promedio_deteccion.days
    horas, resto = divmod(tiempo_promedio_deteccion.seconds, 3600)
    minutos, segundos = divmod(resto, 60)

    # Devolver el resultado formateado y en segundos para facilitar la representación en el gráfico
    return {
        "TPD_formateado": f"{dias}d {horas:02}h {minutos:02}m {segundos:02}s",
        "TPD_segundos": tiempo_promedio_deteccion.total_seconds()
    }"""

def calcular_tiempo_promedio_deteccion():
    try:
        # Obtener todos los diagnósticos
        diagnosticos = Diagnostico.objects.all()
        if not diagnosticos.exists():
            print("No se encontraron diagnósticos.")
            return {"TPD_formateado": "0d 00h 00m 00s", "TPD_segundos": 0}
        
        # Agrupar diagnósticos por fecha_prediccion
        diagnosticos_por_dia = diagnosticos.values('fecha_prediccion').annotate(
            total_pacientes=Count('paciente', distinct=True)
        )
        
        # Inicializar variables para el tiempo total y el conteo de días
        tiempo_total_diario = timedelta(0)
        total_dias = 0
        
        # Iterar sobre los diagnósticos por día
        for dia in diagnosticos_por_dia:
            fecha = dia['fecha_prediccion']
            total_pacientes = dia['total_pacientes']
            
            print(f"\nProcesando fecha: {fecha} con {total_pacientes} pacientes")
            
            # Obtener todos los diagnósticos de este día
            diagnosticos_dia = diagnosticos.filter(fecha_prediccion=fecha)
            
            if not diagnosticos_dia.exists() or total_pacientes == 0:
                print(f"No hay diagnósticos o pacientes para la fecha {fecha}.")
                continue
            
            # Obtener el primer y último diagnóstico de este día
            primer_diagnostico = diagnosticos_dia.earliest('hora_prediccion')
            ultimo_diagnostico = diagnosticos_dia.latest('hora_prediccion')
            
            # Convertir las horas a datetime para calcular la diferencia
            datetime_inicio = datetime.combine(fecha, primer_diagnostico.hora_prediccion)
            datetime_fin = datetime.combine(fecha, ultimo_diagnostico.hora_prediccion)
            
            # Calcular el tiempo total del día en segundos
            tiempo_total_dia = (datetime_fin - datetime_inicio).total_seconds()
            print(f"Tiempo total del día en segundos: {tiempo_total_dia}")
            
            # Calcular el tiempo promedio por paciente
            tiempo_promedio_dia = tiempo_total_dia / total_pacientes
            print(f"Tiempo promedio por paciente (en segundos): {tiempo_promedio_dia}")
            
            # Sumar al tiempo total diario
            tiempo_total_diario += timedelta(seconds=tiempo_promedio_dia)
            total_dias += 1

        # Calcular el promedio global por día
        if total_dias == 0:
            print("No se procesaron días.")
            return {"TPD_formateado": "0d 00h 00m 00s", "TPD_segundos": 0}
        
        # Calcular el tiempo promedio global
        tiempo_promedio_global = tiempo_total_diario / total_dias
        dias = tiempo_promedio_global.days
        horas, resto = divmod(tiempo_promedio_global.seconds, 3600)
        minutos, segundos = divmod(resto, 60)
        
        # Formatear el tiempo promedio global
        tiempo_formateado = f"{dias}d {horas:02}h {minutos:02}m {segundos:02}s"
        print(f"\nTiempo promedio global por día: {tiempo_formateado}")
        
        # Retornar el tiempo promedio global y en segundos
        return {
            "TPD_formateado": tiempo_formateado,
            "TPD_segundos": round(tiempo_promedio_global.total_seconds())
        }
    except Exception as e:
        # Capturar y mostrar el error
        print(f"Error al calcular el tiempo promedio de detección por día: {e}")
        return {"TPD_formateado": "0d 00h 00m 00s", "TPD_segundos": 0}

    
# 2. Cálculo de la Proporción de Riesgo (PR)
def calcular_proporcion_riesgo():
    # Total de pacientes evaluados
    total_pacientes = Diagnostico.objects.count()    
    # print('Total Pacientes: ', total_pacientes)

    # Pacientes en riesgo (con nivel de riesgo "Preeclampsia", "Leve" o "Severa")
    pacientes_en_riesgo = Diagnostico.objects.filter(nivelriesgo__in=["Preeclampsia", "Leve", "Severa"]).count()    
    # print('Pacientes en riesgo: ', pacientes_en_riesgo)

    # Calcular la Proporción de Riesgo (PR)
    if total_pacientes > 0:
        PR = (pacientes_en_riesgo / total_pacientes) * 100
    else:
        PR = 0  # Evitar división por cero
        
    # print('Proporción de Riesgo (PR): ', PR)

    return {"PR": round(PR, 2)}

# 3. Cálculo de la Tasa de Intervención Preventiva Efectiva (TIPE) por Día
def calcular_intervencion_efectiva():    

    # Obtener la última fecha de diagnóstico disponible
    fecha_ultimo_diagnostico = Diagnostico.objects.filter(
        nivelriesgo__in=["Leve", "Preeclampsia"]
    ).order_by('-fecha_prediccion').values_list('fecha_prediccion', flat=True).distinct().first()

    if not fecha_ultimo_diagnostico:
        print("No se encontraron diagnósticos.")
        return {"TIE": 0, "sin_progresion": 0}

    # Filtrar pacientes diagnosticados en la última fecha de diagnóstico
    pacientes_con_riesgo = Diagnostico.objects.filter(
        nivelriesgo__in=["Leve", "Preeclampsia"],
        fecha_prediccion=fecha_ultimo_diagnostico
    ).values_list('paciente', flat=True).distinct()

    # Inicializar contadores
    total_pacientes = Diagnostico.objects.filter(fecha_prediccion=fecha_ultimo_diagnostico).count()
    pacientes_con_riesgo_count = len(pacientes_con_riesgo)
    sin_progresion_count = 0  # Contador para pacientes sin progresión a "Severa"

    # Diccionario para registrar cambios
    cambios_pacientes = defaultdict(list)

    for paciente_id in pacientes_con_riesgo:
        # Recuperar todos los diagnósticos del paciente ordenados por fecha
        diagnosticos_paciente = Diagnostico.objects.filter(
            paciente_id=paciente_id
        ).order_by('fecha_prediccion')

        # Rastrear niveles de riesgo y fechas para cada paciente
        niveles_diagnostico = [diag.nivelriesgo for diag in diagnosticos_paciente]
        fechas_diagnostico = [diag.fecha_prediccion for diag in diagnosticos_paciente]
        cambios_pacientes[paciente_id] = list(zip(fechas_diagnostico, niveles_diagnostico))

        # Verificar si el paciente no tuvo progresión a "Severa"
        if "Severa" not in niveles_diagnostico:
            sin_progresion_count += 1

    # Calcular la TIE
    TIE = (pacientes_con_riesgo_count / total_pacientes) * 100 if total_pacientes > 0 else 0

    # Imprimir cambios entre semanas para cada paciente
    print(f"\n==== Cambios Semanales por Paciente ====\n")
    for paciente_id, cambios in cambios_pacientes.items():
        print(f"Paciente {paciente_id}:")
        for i in range(len(cambios) - 1):
            fecha_anterior, nivel_anterior = cambios[i]
            fecha_actual, nivel_actual = cambios[i + 1]
            print(f"  {fecha_anterior} ({nivel_anterior}) → {fecha_actual} ({nivel_actual})")
        print("\n")

    print(f"Fecha: {fecha_ultimo_diagnostico}")
    print(f"Total pacientes: {total_pacientes}")
    print(f"Pacientes con riesgo: {pacientes_con_riesgo_count}")
    print(f"Pacientes sin progresión a 'Severa': {sin_progresion_count}")
    print(f"TIE calculado: {round(TIE, 2)}%")

    return {
        "TIE": round(TIE, 2),
        "fechaTIE": fecha_ultimo_diagnostico,
        "detalle_cambios": cambios_pacientes,
        "sin_progresion": sin_progresion_count
    }


# Tasa de intervencion por semnana
# def calcular_intervencion_efectiva():

#     # Obtener la última fecha de diagnóstico disponible
#     fecha_ultimo_diagnostico = Diagnostico.objects.filter(
#         nivelriesgo__in=["Leve", "Preeclampsia"]
#     ).order_by('-fecha_prediccion').values_list('fecha_prediccion', flat=True).distinct().first()

#     if not fecha_ultimo_diagnostico:
#         print("No se encontraron diagnósticos.")
#         return {"TIPE": 0}

#     # Calcular los 5 días laborables anteriores al último diagnóstico
#     fechas_semana = []
#     fecha_actual = fecha_ultimo_diagnostico
#     while len(fechas_semana) < 5:
#         if fecha_actual.weekday() < 5:  # Verifica si es de lunes a viernes
#             fechas_semana.append(fecha_actual)
#         fecha_actual -= timedelta(days=1)

#     # Las fechas deben ordenarse de más antigua a más reciente
#     fechas_semana.sort()

#     # Filtrar pacientes diagnosticados durante la última semana de diagnóstico
#     pacientes_con_riesgo = Diagnostico.objects.filter(
#         nivelriesgo__in=["Leve", "Preeclampsia"],
#         fecha_prediccion__in=fechas_semana
#     ).values_list('paciente', flat=True).distinct()

#     # Inicializar contadores
#     total_diagnosticados_con_riesgo = 0
#     pacientes_sin_progresion = 0

#     for paciente_id in pacientes_con_riesgo:
#         diagnosticos_paciente = Diagnostico.objects.filter(paciente_id=paciente_id).order_by('fecha_prediccion')

#         primer_diagnostico = diagnosticos_paciente.first()
#         if primer_diagnostico and primer_diagnostico.nivelriesgo in ["Leve", "Preeclampsia"]:
#             total_diagnosticados_con_riesgo += 1
#             progreso_a_severa = False

#             for diagnostico in diagnosticos_paciente:
#                 if diagnostico.nivelriesgo == "Severa":
#                     progreso_a_severa = True
#                     break

#             if not progreso_a_severa:
#                 pacientes_sin_progresion += 1

#     TIE = (pacientes_sin_progresion / total_diagnosticados_con_riesgo) * 100 if total_diagnosticados_con_riesgo > 0 else 0

#     print(f"Fechas de la semana: {', '.join(map(str, fechas_semana))}")
#     print(f"Total pacientes diagnosticados con riesgo: {total_diagnosticados_con_riesgo}")
#     print(f"Pacientes sin progresión a Severa: {pacientes_sin_progresion}")
#     print(f"TIPE calculado: {round(TIE, 2)}%")

#     return {"TIE": round(TIE, 2)}

"""def calcular_casos_severa_a_leve():
    # Diccionario para contar los pacientes con el cambio de "Severa" a "Leve"
    casos_severa_a_leve = 0
    total_pacientes_con_severa = 0

    # Obtener los pacientes únicos que tienen al menos un diagnóstico "Severa"
    pacientes_ids = Diagnostico.objects.filter(nivelriesgo="Severa").values_list('paciente', flat=True).distinct()

    for paciente_id in pacientes_ids:
        # Obtener todos los diagnósticos del paciente ordenados por fecha
        diagnosticos = Diagnostico.objects.filter(paciente_id=paciente_id).order_by('fecha_prediccion')

        # Verificar si existe una transición de "Severa" a "Leve"
        tuvo_severa = False
        cambio_a_leve = False

        for diagnostico in diagnosticos:
            if diagnostico.nivelriesgo == "Severa":
                tuvo_severa = True
            elif diagnostico.nivelriesgo == "Leve" and tuvo_severa:
                cambio_a_leve = True
                break  # Terminamos el bucle si encontramos el cambio de "Severa" a "Leve"

        if tuvo_severa:
            total_pacientes_con_severa += 1
        if cambio_a_leve:
            casos_severa_a_leve += 1

    # Calcular el porcentaje de casos que han pasado de "Severa" a "Leve"
    # print('Caso sever a leve: ', casos_severa_a_leve)
    # print('Total Paciente severa: ', total_pacientes_con_severa)
    porcentaje_severa_a_leve = (casos_severa_a_leve / total_pacientes_con_severa) * 100 if total_pacientes_con_severa > 0 else 0

    return {
        "casos_severa_a_leve": casos_severa_a_leve,
        "total_pacientes_con_severa": total_pacientes_con_severa,
        "porcentaje_severa_a_leve": porcentaje_severa_a_leve
    }"""
    
def calcular_cambios_a_riesgo():
    
    # Obtener la última fecha de diagnóstico disponible
    fecha_ultimo_diagnostico = Diagnostico.objects.filter(
        nivelriesgo__in=["Leve", "Preeclampsia"]
    ).order_by('-fecha_prediccion').values_list('fecha_prediccion', flat=True).distinct().first()

    if not fecha_ultimo_diagnostico:
        print("No se encontraron diagnósticos.")
        return {"TIE": 0}

    # Filtrar pacientes diagnosticados en la última fecha de diagnóstico
    pacientes_con_riesgo = Diagnostico.objects.filter(
        nivelriesgo__in=["Leve", "Preeclampsia"],
        fecha_prediccion=fecha_ultimo_diagnostico
    ).values_list('paciente', flat=True).distinct()

    # Inicializar contadores
    total_pacientes = Diagnostico.objects.filter(fecha_prediccion=fecha_ultimo_diagnostico).count()
    pacientes_con_riesgo_count = len(pacientes_con_riesgo)

    # Diccionario para registrar cambios
    cambios_pacientes = defaultdict(list)

    for paciente_id in pacientes_con_riesgo:
        # Recuperar todos los diagnósticos del paciente ordenados por fecha
        diagnosticos_paciente = Diagnostico.objects.filter(
            paciente_id=paciente_id
        ).order_by('fecha_prediccion')

        # Rastrear niveles de riesgo y fechas para cada paciente
        niveles_diagnostico = [diag.nivelriesgo for diag in diagnosticos_paciente]
        fechas_diagnostico = [diag.fecha_prediccion for diag in diagnosticos_paciente]
        cambios_pacientes[paciente_id] = list(zip(fechas_diagnostico, niveles_diagnostico))

    # Calcular la TIE
    TIE = (pacientes_con_riesgo_count / total_pacientes) * 100 if total_pacientes > 0 else 0

    # Imprimir cambios entre semanas para cada paciente
    print(f"\n==== Cambios Semanales por Paciente ====\n")
    for paciente_id, cambios in cambios_pacientes.items():
        print(f"Paciente {paciente_id}:")
        for i in range(len(cambios) - 1):
            fecha_anterior, nivel_anterior = cambios[i]
            fecha_actual, nivel_actual = cambios[i + 1]
            print(f"  {fecha_anterior} ({nivel_anterior}) → {fecha_actual} ({nivel_actual})")
        print("\n")

    print(f"Fecha: {fecha_ultimo_diagnostico}")
    print(f"Total pacientes: {total_pacientes}")
    print(f"Pacientes con riesgo: {pacientes_con_riesgo_count}")
    print(f"TIE calculado: {round(TIE, 2)}%")
    
    return {"PCR": round(TIE, 2)}


# -----------------------    