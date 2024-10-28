from django.shortcuts import render

from orders.models import Order
from django.forms import model_to_dict
from rest_framework import generics, viewsets, mixins, status
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response

from users.permissions import IsAdminOrReadOnly, IsOwnerOrReadOnly
from .models import Food, Order
from orders.serializers import OrderCreateSerializer
from rest_framework.viewsets import GenericViewSet
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAdminUser, IsAuthenticated

# Create your views here.
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        print(self.request.user)
        order = serializer.save(user=self.request.user)
        order.calculate_delivery_time()
