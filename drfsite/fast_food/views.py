from django.forms import model_to_dict
from rest_framework import generics, viewsets, mixins, status
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response

from .permission import IsAdminOrReadOnly, IsOwnerOrReadOnly
from .models import Food, Category, Order
from .serializers import FoodSerializer, OrderCreateSerializer, RegisterSerializer
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

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Присвоить текущего пользователя к заказу
        print(self.request.user)
        order = serializer.save(user=self.request.user)
        # Рассчитать примерное время доставки
        order.calculate_delivery_time()


class FoodListView(APIView):
    def get(self, request):
        foods = Food.objects.all()
        serializer = FoodSerializer(foods, many=True)
        return Response(serializer.data)
    
class CreateOrderView(APIView):
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Order created successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    
    
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    
# class AddToOrderView(APIView):
#     def post(self, request):
#         # Получаем данные из запроса
#         food_items = request.data.get('food_items', [])
#         address = request.data.get('address')
#         distance = request.data.get('distance')

#         # Создаем заказ
#         order = Order.objects.create(address=address, distance=distance)

#         # Добавляем блюда в заказ
#         for food_id in food_items:
#             food = Food.objects.get(id=food_id)
#             order.food_items.add(food)

#         order.save()

#         return Response({"message": "Order updated successfully!"}, status=status.HTTP_201_CREATED)
    
# class FoodAPIView(generics.ListCreateAPIView):
#     def get(self, request):
#         f=Food.objects.all()
#         return Response({'posts': FoodSerializer(f, many=True).data})
    
#     def post(self,request):
#         post_new = Food.objects.create(
#             title = request.data['title'],
#             content = request.data['content'],
#             cat_id = request.data['cat_id']
#         )

#         return Response({'post': model_to_dict(post_new)})
#     # queryset = Food.objects.all()
#     # serializer_class = FoodSerializer
    

# class FoodAPIUpdate(generics.UpdateAPIView):
#     queryset = Food.objects.all()
#     serializer_class = FoodSerializer
# #     permission_classes = (IsOwnerOrReadOnly, )
# # #    authentication_classes = (TokenAuthentication, )
