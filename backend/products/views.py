from django.shortcuts import render
from .serializers import ProductTypeSerializer, CategorySerializer, ProductSerializer
from .models import ProductType, Category, Product
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from transaction.views import create_presigned_post,GeneratePresignedUrl


# Create your views here.

class ProductTypeAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        try:
            product_types = ProductType.objects.all()
            serializer = ProductTypeSerializer(product_types, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, format=None):
        try:
            serializer = ProductTypeSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Product type created successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            if 'token_not_valid' in str(e):
                return Response({'error': 'Token is invalid or expired'}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, format=None):
        try:
            product_type = ProductType.objects.get(id=request.data['id'])
            serializer = ProductTypeSerializer(product_type, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Product type updated successfully', 'data': serializer.data})
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except ProductType.DoesNotExist:
            return Response({'error': 'Product type not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, format=None):
        try:
            product_type = ProductType.objects.get(id=request.data['id'])
            product_type.delete()
            return Response({'message': 'Product type deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except ProductType.DoesNotExist:
            return Response({'error': 'Product type not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        try:
            categories = Category.objects.all()
            serializer = CategorySerializer(categories, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, format=None):
        try:
            serializer = CategorySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Category created successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, format=None):
        try:
            category = Category.objects.get(name=request.data['categoryID'])
            serializer = CategorySerializer(category, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Category updated successfully', 'data': serializer.data})
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, format=None):
        try:
            categoryID = request.data.get('categoryID')
            if not categoryID:
                return Response({'error': 'CategoryID is required'}, status=status.HTTP_400_BAD_REQUEST)

            category = Category.objects.get(name=categoryID)
            category.delete()

            return Response({'message': 'Category deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({'error': 'Invalid category ID format'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ProductAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        try:
            # Extract filter parameters from request
            product_type = request.query_params.get('product_type')
            category = request.query_params.get('category')
            min_price = request.query_params.get('min_price')
            max_price = request.query_params.get('max_price')
            in_stock = request.query_params.get('in_stock')
            search = request.query_params.get('search')  # <-- New line

            # Apply filters if provided
            products = Product.objects.all()

            if product_type:
                products = products.filter(product_type__id=product_type)

            if category:
                categoryID = category[:3].upper()
                products = products.filter(category__categoryID=categoryID)

            if min_price:
                products = products.filter(price__gte=min_price)

            if max_price:
                products = products.filter(price__lte=max_price)

            if in_stock:
                products = products.filter(stock__gt=0)

            if search:  # <-- Search filtering
                products = products.filter(
                    name__icontains=search
                ) | products.filter(
                    description__icontains=search
                )

            serializer = ProductSerializer(products, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def post(self, request, format=None):
            try:
                
                serializer = ProductSerializer(data=request.data)
                if serializer.is_valid():
                    serializer.save()
                    return Response({
                        'message': 'Product created successfully', 
                        'data': serializer.data
                    }, status=status.HTTP_201_CREATED)
                return Response({
                    'error': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, format=None):
        try:
            product = Product.objects.get(productID=request.data['productID'])
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Product updated successfully', 'data': serializer.data})
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, format=None):
        try:
            productID = request.query_params.get('productID')
            product = Product.objects.get(productID=productID)
            product.delete()
            return Response({'message': 'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
