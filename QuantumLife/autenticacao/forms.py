from django import forms
from django.contrib.auth.forms import AuthenticationForm
from contas.models import Usuario
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
import re

def validar_cpf(cpf):
    cpf = ''.join(filter(str.isdigit, cpf))
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False
    soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
    digito1 = 0 if soma % 11 < 2 else 11 - (soma % 11)
    soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
    digito2 = 0 if soma % 11 < 2 else 11 - (soma % 11)
    return cpf[-2:] == f"{digito1}{digito2}"

class CadastroForm(forms.ModelForm):
    password = forms.CharField(
        label='Senha',
        widget=forms.PasswordInput(attrs={
            'class': 'form-input',
            'placeholder': 'Senha',
            'id': 'passwordinput'
        })
    )

    class Meta:
        model = Usuario
        fields = ['email', 'cpf', 'password']
        widgets = {
            'email': forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'Email', 'autocomplete': 'off'}),
            'cpf': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'CPF', 'autocomplete': 'off'}),
        }

    def clean_cpf(self):
        cpf = self.cleaned_data.get('cpf')
        if not validar_cpf(cpf):
            raise ValidationError("CPF inválido.")
        return cpf

    def clean_email(self):
        email = self.cleaned_data.get('email')

        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError("Email inválido. Por favor, insira um endereço de email válido.")

        if Usuario.objects.filter(email=email).exists():
            raise ValidationError("Este email já está cadastrado.")

        return email

    def clean_password(self):
        password = self.cleaned_data.get('password')

        if len(re.findall(r'\d', password)) < 4:
            raise ValidationError("A senha deve conter pelo menos 4 números.")
        if not re.search(r'[!@#$%^&*()_\-+=\[\]{}|\\;:\'",.<>/?`~]', password):
            raise ValidationError("A senha deve conter pelo menos 1 caractere especial.")
        if not re.search(r'[A-Z]', password):
            raise ValidationError("A senha deve conter pelo menos 1 letra maiúscula.")
        if not re.search(r'[a-z]', password):
            raise ValidationError("A senha deve conter pelo menos 1 letra minúscula.")

        return password

class LoginForm(AuthenticationForm):
    username = forms.CharField(
        label="CPF",
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'CPF',})
    )
    password = forms.CharField(
        label="Senha",
        widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'Senha', 'id': 'password-input,', })
    )

class EsqueciSenhaForm(forms.Form):
    email = forms.EmailField(
        label='Email',
        widget=forms.EmailInput(attrs={'class': 'email','type': 'email' ,'placeholder': 'Email','id': 'nova-senha' ,'autocomplete': 'off'})
    )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        

        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError("Email inválido. Por favor, insira um endereço de email válido.")

        if not Usuario.objects.filter(email=email).exists():
            raise ValidationError("Este email não está cadastrado.")

        return email
