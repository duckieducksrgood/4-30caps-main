# project/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),  # Include users app URLs
    path('api/', include('products.urls')),  # Include products app URLs
    path('api/', include('transaction.urls')),  # Include transaction app URLs
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)