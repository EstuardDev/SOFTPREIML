import joblib
import os
from django.conf import settings
# from django.contrib import messages
from django.contrib.auth.models import User, Group
# from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Personal
from .models import Paciente
from .models import HistoriaClinica
from .models import Diagnostico

# Create your views here.

"""def base(request):
    return render(request, 'base.html')"""

# -------------------- VISTAS PARA LOGIN --------------------

"""def listar_medicos(request):
    try:
        # Obtenemos el grupo 'Medico'
        grupo_medico = Group.objects.get(name='Medico')
        
        # Filtramos los usuarios que pertenecen al grupo 'Medico'
        medicos = User.objects.filter(groups=grupo_medico)
        
        lista_medicos = []
        
        for medico in medicos:
            lista_medicos.append({
                'username': medico.username,
                'email': medico.email,
                'grupo': 'Medico'
            })
        
        return JsonResponse({
            'success': True,
            'medicos': lista_medicos
        })
    except Group.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'El grupo Medico no existe.'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })"""

def reportesviews(request):
    if request.method == 'POST':
        start_date = request.POST.get('start_date')
        end_date = request.POST.get('end_date')

        # Aquí puedes realizar la lógica para filtrar los reportes según las fechas
        reportes = Diagnostico.objects.filter(fecha_prediccion__range=[start_date, end_date])

        # Convertir los reportes a un formato que puedas devolver como JSON
        reportes_data = list(reportes.values(
            'personal', 
            'paciente', 
            'fecha_prediccion', 
            'nivelriesgo'
        ))

        return JsonResponse({'success': True, 'data': reportes_data})

    # Si no es una solicitud POST, simplemente renderiza la página de reportes
    reportes = Diagnostico.objects.all()
    return render(request, 'reportes.html', {"reportes": reportes})

# def reportesviews(request):
#     reportes = Diagnostico.objects.all()
#     return render(request, 'reportes.html', {"reportes": reportes})

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

    return render(request, "inicio.html", {"pacientes": pacientes, "medicos": medicos, "historias_clinicas": historias_clinicas, "diagnostico": diagnosticos})

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
            
            Personal.objects.create(dni=dni, nombre=nombre, apellidos=apellidos)
            return JsonResponse({'success': True, 'message': 'Médico registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
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
        historialPac = HistoriaClinica.objects.filter(paciente=id).select_related('paciente')
        paciente = Paciente.objects.get(id=id)
        historial_list = list(historialPac.values(
            'fechaconsulta',
            'edadgestacional',
            'periodointergenesico',
            'embarazonuevopareja',
            'hipertensioncronica',
            'pasistolicabasal',
            'padiastolicabasal',
            'presionsistolica1',
            'presiondiastolica1',
            'presionsistolica2',
            'presiondiastolica2',
            'testdeass',
            'proteinaorina',
            'tgo',
            'tgp',
            'creatinina',
            'urea',
            'fibrinogeno',
            'fecharegistro'
        ))
        return JsonResponse({
            'success': True,
            'historialPac': historial_list,
            'nombrePaciente': paciente.nombre, 
            'apellidoPaciente': paciente.apellidos 
        })
    except HistoriaClinica.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Historial clínico no encontrado.'})
    except Paciente.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'La paciente no fue encontrada.'})

def pacientesActivos(request):
    pacientesActivos = Paciente.objects.filter(estado='1')
    print(pacientesActivos)
    return render(request, "inicio.html", {"pacientesActivos": pacientesActivos})

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
            
            Paciente.objects.create(dni=dni, nombre=nombre, apellidos=apellidos, edad=edad, 
                                    numeroHistoriaClinica=numhistoriaclinica, numgestacion=numgestacion)
            return JsonResponse({'success': True, 'message': 'Paciente registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
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
            paciente = Paciente.objects.get(dni=dni)
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
                "message": "No se pudo encontrar al paciente."
            })
    return JsonResponse({
        "success": False,
        "message": "Paciente no permitido."
    })

def buscarPaciente(request, dni):
    try:
        paciente = Paciente.objects.get(dni=dni)
        data = {
            "success": True,
            "paciente": {
                "dni": paciente.dni,
                "nombre": paciente.nombre,
                "apellidos": paciente.apellidos,
                "edad": paciente.edad,
                "numgestacion": paciente.numgestacion,
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
            paciente = Paciente.objects.get(dni=dni)
            paciente.estado = 0
            paciente.save()
            return JsonResponse({
                "success": True,
                "message": "Paciente inactivo correctamente."
            })
        except Paciente.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar al Paciente."
            })
    return JsonResponse({
        "success": False,
        "message": "Método no permitido."
    })

def activarPaciente(request, dni):
    if request.method == 'PATCH':
        try:
            paciente = Paciente.objects.get(dni=dni)
            paciente.estado = 1
            paciente.save()
            return JsonResponse({
                "success": True,
                "message": "Paciente activado correctamente."
            })
        except Paciente.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "No se pudo encontrar el Paciente."
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
        """presionsistolica = request.POST['txtsistolica']
        presiondiastolica = request.POST['txtdiastolica']
        proteinaorina = request.POST['txtproteinuria']
        historiafamiliar = request.POST['txthistorialf']
        diabetesgest = request.POST['txtdiabetes']
        imc = request.POST['txtimc']
        testdeass = request.POST['txttestdeass']
        creatinina = request.POST['txtcreatinina']"""        
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
        testdeass = request.POST['txttestdeass']
        proteinaorina = request.POST['txtproteinuria']
        tgo = request.POST['txttgo']
        tgp = request.POST['txttgp']
        creatinina = request.POST['txtcreatinina']
        urea = request.POST['txturea']
        fibrinogeno =request.POST['txtfibrinogeno']
        try:
            paciente = Paciente.objects.get(dni=dni)
            HistoriaClinica.objects.create(paciente=paciente, edadgestacional=edadgestacional, periodointergenesico=periodointergenesico,
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
                "fechaconsulta": historial.fechaconsulta,
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
        edad =request.POST.get('txteditedad')
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
        testdeass = request.POST.get('txtedittestdeass')
        proteinaorina = request.POST.get('txteditproteinuria')
        tgo = request.POST.get('txtedittgo')
        tgp = request.POST.get('txtedittgp')
        creatinina = request.POST.get('txteditcreatinina')
        urea = request.POST.get('txtediturea')
        fibrinogeno =request.POST.get('txteditfibrinogeno')
        try:
            paciente = Paciente.objects.get(dni=dni)
            historialc = HistoriaClinica.objects.get(id=id, paciente=paciente)
            historialc.paciente = paciente
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
            modelo_path = os.path.join(settings.STATICFILES_DIRS[0], 'assets', 'modelo', 'modelo_final_optimizacionV3.pkl')
            scaler_path = os.path.join(settings.STATICFILES_DIRS[0], 'assets', 'modelo', 'scaler_optimizacionV3.pkl')
            
            modelo = joblib.load(modelo_path)
            scaler = joblib.load(scaler_path)
            
            dni = request.POST.get('txtdni')
            request.POST.get('txtnombre')
            request.POST.get('txtapellido')
            
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
            test_de_as = 1 if request.POST.get('txttestdeass') == 'SI' else 0
            proteina_orina = float(request.POST.get('txtproteinuria', '0') or '0')
            tgo = float(request.POST.get('txttgo', '0') or '0')
            tgp = float(request.POST.get('txttgp', '0') or '0')
            creatinina = float(request.POST.get('txtcreatinina', '0') or '0')
            urea = float(request.POST.get('txturea', '0') or '0')
            fibrinogeno = float(request.POST.get('txtfibrinogeno', '0') or '0')

            datos = [[                
                edad_gestacional, periodo_intergenesico, embarazo_nueva_pareja, hipertension_cronica, pa_sistolica_basal,
                pa_diastolica_basal, presion_sistolica1, presion_diastolica1, presion_sistolica2, presion_diastolica2,
                test_de_as, proteina_orina, tgo, tgp, creatinina, urea, fibrinogeno
            ]]
            
            datos_scaled = scaler.transform(datos)
            riesgo = modelo.predict(datos_scaled)[0]
            
            print(f"Valor de riesgo devuelto por el modelo: {riesgo}")
            
            pam1 = (presion_sistolica1 + 2 * presion_diastolica1) / 3
            pam2 = (presion_sistolica2 + 2 * presion_diastolica2) / 3
            pam_promedio = (pam1 + pam2) / 2

            if riesgo == 0:
                nivel_riesgo = "Leve"
                riesgo_decimal = pam_promedio
            elif riesgo == 1:
                nivel_riesgo = "Severa"
                riesgo_decimal = pam_promedio
            else:
                raise ValueError(f"El valor de riesgo devuelto por el modelo no es válido: {riesgo}")
            
            paciente = Paciente.objects.get(dni=dni)  # Asegúrate de que el paciente existe
            historiaclinica = HistoriaClinica.objects.filter(paciente=paciente).latest('fechaconsulta')
            diagnostico = Diagnostico(
                paciente=paciente,
                personal=request.user.personal, 
                historia_clinica = historiaclinica,
                riesgo=riesgo_decimal,
                nivelriesgo=nivel_riesgo,
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
            print(f"Error: {e}")
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
        historial = HistoriaClinica.objects.filter(paciente=paciente).latest('fechaconsulta')
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
                "riesgo": diagnostico.riesgo,              
                "nivelriesgo": diagnostico.nivelriesgo,              
                "estado": diagnostico.estado,              
                "detalles": diagnostico.detalles,              
            }
        }
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
        riesgo = request.POST.get('txteditriesgo')
        nivelriesgo = request.POST.get('txteditnivelriesgo')
        estado = request.POST.get('txteditestado')
        detalles = request.POST.get('txteditdetalles')
        try:
            diagnostico = Diagnostico.objects.get(id=id)
            diagnostico.paciente.nombre = nompaciente
            diagnostico.personal.nombre = nommedico
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
