#!/bin/bash
set -o errexit  # Salir si ocurre algún error

# Configurar DJANGO_SETTINGS_MODULE antes de ejecutar cualquier comando
export DJANGO_SETTINGS_MODULE="MLearning.settings"

# 1. Instalar las dependencias
pip install -r requirements.txt

# 2. Colectar archivos estáticos
python manage.py collectstatic --no-input

# 3. Ejecutar las migraciones si hubo cambios en models
python manage.py makemigrations 

# 3.1 Ejecutar la migracion total
python manage.py migrate

# 4. Crear grupos
python -c "
import django
django.setup()
from django.contrib.auth.models import Group

# Crear grupos
Group.objects.get_or_create(name='Administrador')
Group.objects.get_or_create(name='Medico')
"

# 5. Crear superusuario y agregarlo al grupo de Administrador, eliminando sesión activa si existe
python -c "
import django
django.setup()
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User, Group

# Cambia estos valores a los que desees
username = 'SuperAdmin'
password = 'admin12345'
email = 'admin@gmail.com'  # Correo electrónico

# Crear o actualizar superusuario
user, created = User.objects.get_or_create(username=username, defaults={'email': email})
if created:
    user.set_password(password)  
    user.is_superuser = True 
    user.is_staff = True 
    user.save()
    print(f'Superusuario {username} creado.')
else:
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

# 6. Iniciar la aplicación con Gunicorn en el puerto proporcionado por Render
PORT=${PORT:-8000}
echo "Iniciando Gunicorn en el puerto $PORT"
# gunicorn MLearning.wsgi --bind 0.0.0.0:$PORT
