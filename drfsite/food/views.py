from django.forms import model_to_dict
from rest_framework import generics, viewsets, mixins, status
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response

from users.permissions import IsAdminOrReadOnly, IsOwnerOrReadOnly
from orders.models import Food, Order
from food.serializers import FoodSerializer
from rest_framework.viewsets import GenericViewSet
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAdminUser, IsAuthenticated

# Create your views here.


class FoodAPIList(generics.ListCreateAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
    permission_classes = (IsAuthenticatedOrReadOnly, )

class FoodAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
    permission_classes = (IsOwnerOrReadOnly, )
#    authentication_classes = (TokenAuthentication, )

class FoodAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
    permission_classes = (IsAdminOrReadOnly, )


class FoodAPIListPagination(PageNumberPagination):
    page_size = 3 
    page_size_query_param = 'page_size'
    max_page_size = 10000


class FoodListView(APIView):
    def get(self, request):
        foods = Food.objects.all()
        serializer = FoodSerializer(foods, many=True)
        return Response(serializer.data)
