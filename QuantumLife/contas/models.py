from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    username = None  # Remove o campo username herdado
    cpf = models.CharField(max_length=14, unique=True)

    USERNAME_FIELD = 'cpf'
    REQUIRED_FIELDS = ['email']  # Outros campos obrigatórios

    def __str__(self):
        return self.cpf
