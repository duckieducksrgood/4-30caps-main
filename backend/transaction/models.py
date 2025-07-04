from django.db import models
from django.conf import settings
from products.models import Product
from django.core.validators import MinValueValidator
import uuid
from django.utils import timezone
import pytz
# Create your models here.
class Cart(models.Model):
    cart_id = models.AutoField(primary_key=True)
    cart_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        to_field='username'  # Use username as the reference
    )
    cart_items = models.ForeignKey(Product, on_delete=models.CASCADE, to_field='productID')
    cart_items_quantity = models.IntegerField(validators=[MinValueValidator(1)])
    cart_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cart_item_image = models.ImageField(upload_to='media/cart_item_images/', null=True, blank=True)
    # cart_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return str(self.cart_user)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])

    def __str__(self):
        return f'{self.product.name} in cart of {self.cart.cart_user}'
    
class Order(models.Model):
    
    order_id = models.CharField(max_length=100, primary_key=True, default='', editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,to_field='username')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    order_date = models.DateTimeField(auto_now_add=True)
    delivery_date = models.DateTimeField(null=True, blank=True)
    delivered_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='PENDING')  # e.g., Pending, Completed, Cancelled
    order_delivery_address = models.TextField()
    custom_order = models.BooleanField(default=False)
    custom_order_description = models.TextField(null=True, blank=True)
    payment_proof = models.ImageField(upload_to='media/payment_proofs/', null=True, blank=True)
    payment_method = models.CharField(max_length=50, default='COD')  # e.g., COD, GCash, Bank Transfer

    def save(self, *args, **kwargs):
        if not self.order_id:
            self.order_id = f"{self.user.username}-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)
        if self.status == 'DELIVERED' and not self.delivered_date:
            self.delivered_date = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_id} by {self.user.username}"
    
class PaymentQr(models.Model):
    payment_qr = models.ImageField(upload_to='media/payment_qr/', null=True, blank=True)

    def __str__(self):
        return f"Payment QR Code"
    





class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Order {self.order.id} - Product {self.product.name}"


