from django.urls import path
from . import views

urlpatterns = [
    path('auth/', views.auth_view, name='auth'),
    path('', views.home, name='home'),  # path raiz da app, sem barra
    path('esqueceu-senha/', views.esqueceu_senha, name='esqueceu-senha'),  # usa underscore no nome da função
]
