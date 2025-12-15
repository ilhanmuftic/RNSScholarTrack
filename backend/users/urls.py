from django.urls import path
from .views import InfoView, RegisterView, LoginView
    
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("info/", InfoView.as_view(), name="info"),

]