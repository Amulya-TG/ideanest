from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Users
    path('api/users/',include('users.urls')),
    path('api/users/login/',TokenObtainPairView.as_view()),
    path('api/users/refresh/', TokenRefreshView.as_view()),
    
    # Ideas
    path('api/ideas/',include('ideas.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
