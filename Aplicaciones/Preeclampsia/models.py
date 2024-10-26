from django.db import models
from django.contrib.auth.models import User, Group
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.  

class Personal(models.Model):
    id = models.BigAutoField(primary_key=True)
    dni = models.CharField(max_length=8, unique=True)
    nombre = models.CharField(max_length=50)  
    apellidos = models.CharField(max_length=50)  
    fecharegistro = models.DateField(auto_now_add=True)
    estado = models.CharField(max_length=1, default='1')  
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} {self.apellidos}"

@receiver(post_save, sender=Personal)
def create_user(sender, instance, created, **kwargs):
    if created:
        username = instance.dni
        password = instance.dni
        user = User.objects.create_user(username=username, password=password)
        user.is_staff = False
        user.save()        
        # agregamos al grupo de Médico
        group = Group.objects.get(name='Medico')
        user.groups.add(group)        
        instance.user = user
        instance.save()
        
class Paciente(models.Model):
    id = models.BigAutoField(primary_key=True)
    dni = models.CharField(max_length=8, unique=True)  
    nombre = models.CharField(max_length=50)  
    apellidos = models.CharField(max_length=50)  
    edad = models.PositiveIntegerField()  
    numeroHistoriaClinica = models.CharField(max_length=50, unique=True)  
    numgestacion = models.PositiveIntegerField(null=True, blank=True)
    estado = models.CharField(max_length=1, default='1')  

    def __str__(self):
        return f"{self.nombre} {self.apellidos}"

class HistoriaClinica(models.Model):
    id = models.BigAutoField(primary_key=True)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)  
    fechaconsulta = models.DateTimeField(auto_now_add=True)
    # Nuevos paramatros para el diagnostico
    edadgestacional = models.PositiveIntegerField(null=True, blank=True)
    periodointergenesico = models.PositiveIntegerField(null=True, blank=True)
    embarazonuevopareja = models.CharField(max_length=2)
    hipertensioncronica = models.CharField(max_length=2)
    pasistolicabasal = models.PositiveIntegerField() 
    padiastolicabasal = models.PositiveIntegerField() 
    presionsistolica1 = models.PositiveIntegerField()  
    presiondiastolica1 = models.PositiveIntegerField()
    presionsistolica2 = models.PositiveIntegerField()  
    presiondiastolica2 = models.PositiveIntegerField()
    testdeass = models.PositiveIntegerField()
    proteinaorina = models.DecimalField(max_digits=7, decimal_places=2)
    tgo = models.PositiveIntegerField(null=True, blank=True)
    tgp = models.PositiveIntegerField(null=True, blank=True)
    creatinina = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    urea = models.PositiveIntegerField(null=True, blank=True)
    fibrinogeno = models.PositiveIntegerField(null=True, blank=True)
    fecharegistro = models.DateTimeField(auto_now_add=True)
    
    """presionsistolica = models.PositiveIntegerField()  
    presiondiastolica = models.PositiveIntegerField()  
    proteinaorina = models.DecimalField(max_digits=5, decimal_places=2)  
    historiafamiliar = models.CharField(max_length=2)  
    diabetesgest = models.CharField(max_length=2)  
    imc = models.DecimalField(max_digits=5, decimal_places=2)  
    testdeas = models.CharField(max_length=2, null=True, blank=True)  
    creatinina = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True) 
    fecharegistro = models.DateTimeField(auto_now_add=True)"""
    
    def __str__(self):
        return f"{self.paciente} {self.fechaconsulta}"

class Diagnostico(models.Model):
    id = models.BigAutoField(primary_key=True)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)  
    personal = models.ForeignKey(Personal, on_delete=models.CASCADE)  
    historia_clinica = models.ForeignKey(HistoriaClinica, on_delete=models.CASCADE)
    fecha_prediccion = models.DateTimeField(auto_now_add=True)
    riesgo = models.DecimalField(max_digits=5, decimal_places=2)  
    nivelriesgo = models.CharField(max_length=20, choices=[('Leve', 'Leve'), ('Severa', 'Severa')])
    estado = models.CharField(max_length=20, choices=[('Evaluado', 'Evaluado'), ('Proceso', 'Proceso')])  
    detalles = models.TextField(null=True, blank=True)  # Puede ser nulo

    def __str__(self):
        return f"{self.paciente} {self.personal} {self.fecha_prediccion} {self.riesgo} {self.nivelriesgo} {self.estado}"
