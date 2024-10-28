from django.shortcuts import render
from rest_framework import generics, viewsets, mixins, status
from .serializers import  RegisterSerializer

# Create your views here.
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
