
# users/urls.py
from django.urls import path
from .views import ProductTypeAPIView, CategoryAPIView, ProductAPIView

urlpatterns = [
    path('producttype/', ProductTypeAPIView.as_view(), name='product-types'),
    path('category/', CategoryAPIView.as_view(), name='categories'),
    path('products/', ProductAPIView.as_view(), name='products'),
    
]
