from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import CadastroForm, LoginForm
from django.contrib import messages

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
                login(request, user)
                messages.success(request, 'Cadastro realizado com sucesso!')
                return redirect('home')
            else:
                messages.error(request, 'Erro ao realizar o cadastro. Verifique os dados informados.')

        elif 'btn_logar' in request.POST:
            cadastro_form = CadastroForm()
            login_form = LoginForm(data=request.POST)

            if login_form.is_valid():
                user = login_form.get_user()
                login(request, user)
                messages.success(request, 'Login realizado com sucesso!')
                return redirect('home')
            else:
                messages.error(request, 'Erro no login. Usuário ou senha incorretos.')

    return render(request, 'autenticacao/auth.html', {
        'cadastro_form': cadastro_form,
        'login_form': login_form
    })
