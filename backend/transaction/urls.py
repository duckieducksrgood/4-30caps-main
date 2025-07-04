
from django.urls import path
from .views import CrudCart,CrudOrder,AnalyticsAPIView,CustomOrderAPIView,ExportAnalyticsAPIView,GeneratePresignedUrl,CrudPaymentQR


urlpatterns = [
  path('carts/', CrudCart.as_view(), name='cart'),
  path('order/', CrudOrder.as_view(), name='order'),
  path('analytics/', AnalyticsAPIView.as_view(), name='analytics'),
  path('customOrder/', CustomOrderAPIView.as_view(), name='custom-order'),
  path('exportAnalytics/', ExportAnalyticsAPIView.as_view(), name='export-analytics'),
  path('generate-presigned-url/', GeneratePresignedUrl.as_view(), name='generate_presigned_url'),
  path('paymentqr/', CrudPaymentQR.as_view(), name='payment-qr'),
]