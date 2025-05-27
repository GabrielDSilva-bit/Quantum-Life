# contas/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import Usuario

class CadastroForm(UserCreationForm):
    class Meta:
        model = Usuario
        fields = ['cpf', 'email', 'password1', 'password2']  # use password1 e password2!

class LoginForm(AuthenticationForm):
    username = forms.CharField(label="CPF")  # sobrescreve username como CPF
