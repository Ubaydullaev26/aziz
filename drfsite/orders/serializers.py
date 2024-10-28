from datetime import timedelta, timezone
from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['food', 'quantity']

class OrderCreateSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True)  

    class Meta:
        model = Order
        fields = ['address', 'distance', 'order_items'] 

    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items')  
        order = Order.objects.create(**validated_data)  

        for item_data in order_items_data:
            OrderItem.objects.create(order=order, **item_data)

        order.calculate_delivery_time()

        return order

class OrderSerializer(serializers.ModelSerializer):
    model = Order
    fields = '__all__'

    def validate(self, data):
        max_dishes_per_5_minutes = 4
        time_frame = timedelta(minutes=5)

        current_time = timezone.now()
        recent_items = Order.objects.filter(added_at__gte=current_time - time_frame)

        recent_dishes_count = sum(item.quantity for item in recent_items)

        if recent_dishes_count > max_dishes_per_5_minutes:
            raise serializers.ValidationError(
                "Нельзя добавить более 4 блюд в течение 5 минут."
            )
    
    def get_preparation_time(self, obj):
        total_dishes = obj.get('total_dishes', 0)
        return (total_dishes + 3) // 4 * 5