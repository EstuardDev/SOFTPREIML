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

# 5. Crear superusuario y agregarlo al grupo de Administrador
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MLearning.settings')
django.setup()
from django.contrib.auth.models import User, Group

username = 'Estuardjr'  # Cambia esto si lo deseas
password = 'dinhor80'  # Cambia esto a una contraseña segura
email = 'kenestr80@gmail.com'  # Cambia esto si lo deseas

# Crear superusuario si no existe
user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'password': password})
if created:
    user.set_password(password)  # Asegúrate de establecer la contraseña correctamente
    user.save()
    print(f'Superusuario {username} creado.')
else:
    print(f'El superusuario {username} ya existe.')

# Agregar el superusuario al grupo de Administrador
admin_group = Group.objects.get(name='Administrador')
user.groups.add(admin_group)
"

# 6. Iniciar la aplicación con el puerto proporcionado por Render
PORT=${PORT:-8000}  # Usa el puerto proporcionado por Render, o 8000 por defecto
echo "Iniciando Gunicorn en el puerto $PORT"
#gunicorn pruebadjango.wsgi --bind 0.0.0.0:$PORT