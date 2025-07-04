# users/urls.py
from django.urls import path
from .views import UserProfileView, UserRegisterView, CustomTokenObtainPairView, CustomTokenRefreshView,UpdateAllUsersView,FetchDecodedTokenView,LogoutView

urlpatterns = [
    path('logout/', LogoutView.as_view(), name='logout'),
    path('fetchdecodedtoken/', FetchDecodedTokenView.as_view(), name='fetch_decoded_token'),
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('users/', UpdateAllUsersView.as_view(), name='update_all_users'),
]
