from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import CadastroForm, LoginForm
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages

@csrf_exempt
def auth_view(request):
    cadastro_form = CadastroForm()
    login_form = LoginForm()

    if request.method == 'POST':
        if 'btn_cadastrar' in request.POST:
            cadastro_form = CadastroForm(request.POST)
            login_form = LoginForm()

            if cadastro_form.is_valid():
                user = cadastro_form.save(commit=False)
                user.set_password(cadastro_form.cleaned_data['password'])
                user.save()
                messages.success(request, "Cadastro realizado com sucesso!")
                login(request, user)
            else:
                # Para cada campo com erro, adiciona as mensagens de erro ao sistema de mensagens do Django
                for field, errors in cadastro_form.errors.items():
                    for error in errors:
                        messages.error(request, f"{field.upper()}: {error}")

        elif 'btn_logar' in request.POST:
            cadastro_form = CadastroForm()
            login_form = LoginForm(data=request.POST)

            if login_form.is_valid():
                user = login_form.get_user()
                login(request, user)
                messages.success(request, "Login realizado com sucesso!")
                return redirect('home')
            else:
                messages.error(request, "Erro ao fazer login. Verifique seu nome de usuário e senha.")

    return render(request, 'autenticacao/auth.html', {
        'cadastro_form': cadastro_form,
        'login_form': login_form
    })

def home(request):
    return render(request, 'home.html')

def minha_view(request):
    messages.success(request, "Login realizado com sucesso!")
    messages.error(request, "Erro ao tentar logar.")
    return redirect('home')
