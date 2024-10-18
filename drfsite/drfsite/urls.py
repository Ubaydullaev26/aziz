"""
URL configuration for drfsite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from fast_food.views import *
from rest_framework import routers, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Fastfood API",
      default_version='v1',
      description="Документация для API фастфуд ресторана",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="support@fastfood.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('admin/', admin.site.urls),                      
    path('api/v1/foodlist/', FoodAPIList.as_view()),
    path('api/v1/foodlist/<int:pk>/', FoodAPIUpdate.as_view()),
    path('api/v1/drf-auth/', include('rest_framework.urls')),
    path('api/v1/fooddelete/<int:pk>', FoodAPIDestroy.as_view()),
    path('api/v1/register/', RegisterView.as_view(), name='register'),
    path('api/v1/token/', TokenObtainPairView.as_view(), name= 'token_obtain_pair'),
    path('api/v1/token/refresh', TokenRefreshView.as_view(), name= 'token_refresh'),
    path('api/v1/token/verify', TokenVerifyView.as_view(), name= 'token_verify'),
    path('', include(router.urls)),
     

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # path('api/v1/', include(router.urls)),   #//127/0.0.1:800/api/v1/women/
#     path('api/v1/womenlist/', WomenViewSet.as_view({'get':'list'})),
#     path('api/v1/womenlist/<int:pk>/', WomenViewSet.as_view({'put': 'update'})),
 ]
