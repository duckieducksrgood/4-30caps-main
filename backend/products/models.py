from django.db import models

# Create your models here.

class CustomOrder(models.Model):
    customOrderID = models.CharField(max_length=10, unique=True, editable=False, primary_key=True)
    customDescription = models.CharField(max_length=200)
    customPrice = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
        

class Category(models.Model):
    categoryID = models.CharField(max_length=3, unique=True, editable=False, primary_key=True)
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.categoryID:
            # Extract the first three letters of the category name and convert to uppercase
            self.categoryID = self.name[:3].upper()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProductType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    productImage = models.ImageField(upload_to='products/', null=True, blank=True,default='products/default.jpg')
    productID = models.CharField(max_length=10, unique=True, editable=False, primary_key=True)
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)  # Category reference remains unchanged
    product_type = models.CharField(max_length=255) # Use the default ID reference now
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    stock = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.productID:
            products_in_category = Product.objects.filter(category=self.category).order_by('productID')
            existing_ids = [int(product.productID.split('-')[1]) for product in products_in_category if '-' in product.productID]

            new_id_number = 1
            while new_id_number in existing_ids:
                new_id_number += 1

            self.productID = f"{self.category.categoryID}-{new_id_number}"
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
