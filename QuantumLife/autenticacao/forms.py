from django import forms
from django.contrib.auth.forms import AuthenticationForm
from contas.models import Usuario
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

def validar_cpf(cpf):
    cpf = ''.join(filter(str.isdigit, cpf))
    if len(cpf) != 11:
        return False
    if cpf == cpf[0] * 11:
        return False
    soma = 0
    for i in range(9):
        soma += int(cpf[i]) * (10 - i)
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto
    soma = 0
    for i in range(10):
        soma += int(cpf[i]) * (11 - i)
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto
    return cpf[-2:] == f"{digito1}{digito2}"

class CadastroForm(forms.ModelForm):
    password = forms.CharField(
        label='Senha',
        widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'Senha', 'id': 'passwordinput'})
    )

    class Meta:
        model = Usuario
        fields = ['email', 'cpf', 'password']
        widgets = {
            'email': forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'Email'}),
            'cpf': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'CPF'}),
        }

    def clean_cpf(self):
        cpf = self.cleaned_data.get('cpf')
        if not validar_cpf(cpf):
            raise ValidationError("CPF inválido.")
        return cpf

    def clean_email(self):
        email = self.cleaned_data.get('email')

        # Validação do formato do email
        try:
            validate_email(email)
        except DjangoValidationError:
            raise ValidationError("Email inválido. Por favor, insira um endereço de email válido.")

        # Verifica se o email já está cadastrado
        if Usuario.objects.filter(email=email).exists():
            raise ValidationError("Este email já está cadastrado.")

        return email

class LoginForm(AuthenticationForm):
    username = forms.CharField(
        label="CPF",
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'CPF'})
    )
    password = forms.CharField(
        label="Senha",
        widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'Senha', 'id': 'password-input'})
    )
