# autenticacao/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('auth/', views.auth_view, name='auth'),
     path('/', views.home, name='home'),  # essa linha cria a URL nomeada 'home'
]



