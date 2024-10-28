from datetime import timezone
from django.db import models
from django.contrib.auth.models import User
from food.models import Food


# Create your models here.
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    address = models.CharField(max_length=255)
    distance = models.FloatField()  
    created_at = models.DateTimeField(auto_now_add=True)
    added_at = models.DateTimeField(default=timezone.now)
    estimated_delivery_time = models.IntegerField(blank=True, null=True)

    def calculate_delivery_time(self):
        total_dishes = sum([item.quantity for item in self.orderitem_set.all()])
        
        preparation_time =  (total_dishes + 3) // 4 * 5

        delivery_time = self.distance * 3
        
        total_time = preparation_time + delivery_time
        self.estimated_delivery_time = total_time
        self.save()

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='order_items', on_delete=models.CASCADE)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)  # Количество еды в заказе

    def __str__(self):
        return f"{self.quantity} x {self.food.name}"