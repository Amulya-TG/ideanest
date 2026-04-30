from django.urls import path
from .views import RegisterView, profile_view,update_profile

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path("profile/", profile_view),
    path("profile/update/", update_profile),

]