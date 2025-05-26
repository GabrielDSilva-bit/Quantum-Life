from django import forms
from django.contrib.auth.forms import AuthenticationForm
from contas.models import Usuario

class CadastroForm(forms.ModelForm):
    password = forms.CharField(
        label='Senha',
        widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'Senha','id': 'passwordinput'})
    )

    class Meta:
        model = Usuario
        fields = ['email', 'cpf', 'password']
        widgets = {
            'email': forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'Email'}),
            'cpf': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'CPF'}),
            
        }

class LoginForm(AuthenticationForm):
    username = forms.CharField(
        label="CPF",
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'CPF'})
    )
    password = forms.CharField(
        label="Senha",
        widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'Senha','id': 'password-input'})
    )
