from django.urls import path
from . import views
from django.urls import path, include
from .views import login_view, cadastro_view, logout_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('cadastro/', cadastro_view, name='cadastro'),
    path('logout/', logout_view, name='logout'),
]
path('contas/', include('contas.urls')),