from rest_framework import serializers
from .models import Cart, CartItem, Order,OrderItem, PaymentQr
from django.contrib.auth.models import User
from products.models import Product
from users.serializers import UserSerializer  # Assuming the User serializer is in users/serializers.py
from products.serializers import ProductSerializer  # Assuming the Product serializer is in products/serializers.py
from django.conf import settings

User = settings.AUTH_USER_MODEL

class PaymentQrSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentQr
        fields = ['payment_qr']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']

class CartSerializer(serializers.ModelSerializer):

    class Meta:
        model = Cart
        fields = ['cart_id', 'cart_user', 'cart_items', 'cart_items_quantity', 'cart_price', 'cart_item_image']


    
class OrderSerializer(serializers.ModelSerializer):
   

    class Meta:
        model = Order
        fields = ['order_id', 'user', 'total_price', 'order_date', 'status', 'delivery_date', 'delivered_date', 'order_delivery_address', 'custom_order', 'custom_order_description', 'payment_proof', 'payment_method']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name')
    product_image = serializers.CharField(source='product.productImage.url')

    class Meta:
        model = OrderItem
        fields = ['order', 'product', 'quantity', 'price', 'product_image', 'product_name']

