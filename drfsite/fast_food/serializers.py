from rest_framework import serializers
from .models import Food, Order
from django.contrib.auth.models import User



class FoodSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default = serializers.CurrentUserDefault())
    class Meta:
        model = Food 
        fields = "__all__"

class OrderCreateSerializer(serializers.Serializer):
    food_items = serializers.ListField(
        child=serializers.IntegerField(), write_only=True
    )  # Список PK продуктов
    distance = serializers.FloatField(write_only=True)  # Дистанция для доставки

    class Meta:
        model = Order
        fields = ['food_items', 'distance']

    def create(self, validated_data):
        # Создаем новый заказ
        food_items = validated_data['food_items']
        distance = validated_data['distance']
        order = Order.objects.create(user=self.context['request'].user,distance=distance)

        # Добавляем продукты в заказ
        for food_id in food_items:
            food = Food.objects.get(id=food_id)
            order.food_items.add(food)

        order.save()

        # order.user=self.context['request'].user
        # Рассчитать примерное время доставки
        order.calculate_delivery_time()

        return order
    
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
# class OrderSerializer(serializers.ModelSerializer):
#     food_items = FoodSerializer(many=True)

#     class Meta:
#         model = Order
#         fields = ['id', 'user', 'food_items', 'address', 'distance', 'created_at', 'estimated_delivery_time']
# class FoodModel:
#     def __init__(self,title,content):
#         self.title = title
#         self.content = content

# class FoodSerializer(serializers.ModelSerializer):
#     title = serializers.CharField(max_length=255)
#     content = serializers.CharField()

# def encode():
#     model = FoodModel('Uzbekistan Burger')
#     model_sr = FoodSerializer(model)
# print(model_sr.data, type(model_sr.data), sep='\n')
# #     json = JSONRenderer().render(model_sr.data)
# #     print(json)
#     class Meta:
#         model = Food
#         fields = ('photo', 'title', 'cat_id',( 'price'))