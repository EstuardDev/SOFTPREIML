#!/bin/bash
set -o errexit  # Salir si ocurre algún error

# 1. Instalar las dependencias
pip install -r requirements.txt

# 2. Colectar archivos estáticos
python manage.py collectstatic --no-input

# 3. Ejecutar las migraciones
python manage.py migrate

# 4. Crear grupos
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MLearning.settings')
django.setup()
from django.contrib.auth.models import Group

# Crear grupos
Group.objects.get_or_create(name='Administrador')
Group.objects.get_or_create(name='Medico')
"

# 5. Crear superusuario y agregarlo al grupo de Administrador, eliminando sesión activa si existe
python -c "
import os
import django
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User, Group
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MLearning.settings')
django.setup()

# Cambia estos valores a los que desees
username = 'Estuardjr'
password = 'dinhor80'
email = 'kenestr80@gmail.com'  # Correo electrónico

# Crear o actualizar superusuario
user, created = User.objects.get_or_create(username=username, defaults={'email': email})
if created:
    user.set_password(password)  
    user.is_superuser = True 
    user.is_staff = True 
    user.save()
    print(f'Superusuario {username} creado.')
else:
    # Si el usuario ya existe, asegurarse de que sea un superusuario
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print(f'El superusuario {username} ya existe y ha sido actualizado.')

# Agregar el superusuario al grupo de Administrador
admin_group, _ = Group.objects.get_or_create(name='Administrador')
user.groups.add(admin_group)

# Eliminar cualquier sesión activa del superusuario
for session in Session.objects.all():
    session_data = session.get_decoded()
    if session_data.get('_auth_user_id') == str(user.id):
        session.delete()
        print('Sesión activa del superusuario eliminada.')
"

# 6. Iniciar la aplicación con el puerto proporcionado por Render
PORT=${PORT:-8000}
echo "Iniciando Gunicorn en el puerto $PORT"
#gunicorn MLearning.wsgi --bind 0.0.0.0:$PORT
