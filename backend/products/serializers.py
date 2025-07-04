import boto3
from django.conf import settings
from rest_framework import serializers
from .models import ProductType, Category, Product
from botocore.exceptions import ClientError

class ProductTypeSerializer(serializers.ModelSerializer):
    categoryID = serializers.CharField(write_only=True)

    class Meta:
        model = ProductType
        fields = ['name', 'categoryID']

    def create(self, validated_data):
        category_id = validated_data.pop('categoryID')
        try:
            category = Category.objects.get(categoryID=category_id)
        except Category.DoesNotExist:
            raise serializers.ValidationError({"categoryID": "Invalid categoryID."})

        product_type = ProductType.objects.create(category=category, **validated_data)
        return product_type
    


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name', 'created_at', 'updated_at', 'categoryID']


class ProductSerializer(serializers.ModelSerializer):
    categoryID = serializers.CharField(write_only=True)

    class Meta:
        model = Product
        fields = ['productID', 'name', 'price', 'categoryID', 'product_type', 'description', 'productImage', 'stock']
    
    def create_presigned_url(self, bucket_name, object_name, expiration=3600):
        """Generate a presigned URL to share an S3 object"""
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        try:
            response = s3_client.generate_presigned_url('put_object',
                                                        Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': object_name},
                                                        ExpiresIn=expiration)
        except ClientError as e:
            print(e)
            return None
        return response
    
    def create(self, validated_data):
        category_id = validated_data.pop('categoryID', None)
        if category_id:
            categoryID = category_id[:3].upper()
        if not category_id:
            raise serializers.ValidationError({"categoryID": "This field is required."})

        # Get or create the Category instance by categoryID
        category, created = Category.objects.get_or_create(categoryID=categoryID)

        product_type = validated_data.pop('product_type', None)
        if product_type:
            try:
                product_type_instance, created = ProductType.objects.update_or_create(name=product_type, category=category)
                validated_data['product_type'] = product_type_instance
            except Exception as e:
                raise serializers.ValidationError({"product_type": "Invalid product_type."})

        # Handle image upload
        product_image = validated_data.pop('productImage', None)
        if product_image:
            bucket_name = settings.AWS_STORAGE_BUCKET_NAME
            object_name = f"products/images/{product_image.name}"
            presigned_url = self.create_presigned_url(bucket_name, object_name)
            if presigned_url:
                # Upload the image to S3
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION_NAME
                )
                try:
                    s3_client.put_object(Bucket=bucket_name, Key=object_name, Body=product_image)
                    validated_data['productImage'] = object_name
                except ClientError as e:
                    print(e)
                    raise serializers.ValidationError({"productImage": "Failed to upload image to S3."})

        # Create the Product instance, including stock
        product = Product.objects.create(category=category, **validated_data)
        return product

    def update(self, instance, validated_data):
        category_id = validated_data.pop('categoryID', None)

        # Update the Product instance fields only if they are provided in validated_data
        if 'name' in validated_data:
            instance.name = validated_data.get('name', instance.name)
        if 'price' in validated_data:
            instance.price = validated_data.get('price', instance.price)
        if 'description' in validated_data:
            instance.description = validated_data.get('description', instance.description)
        if 'productImage' in validated_data:
            instance.productImage = validated_data.get('productImage', instance.productImage)
        if 'stock' in validated_data:
            instance.stock = validated_data.get('stock', instance.stock)

        # Update category if category_id is provided
        if category_id:
            try:
                category = Category.objects.get(categoryID=category_id)
                instance.category = category
            except Category.DoesNotExist:
                raise serializers.ValidationError({"categoryID": "Invalid categoryID."})

        # Save the updated instance
        instance.save()
        return instance


