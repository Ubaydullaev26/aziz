from django.db import models
from django.contrib.auth.models import User


# Create your models here.


class Food(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    time_create = models.DateTimeField(auto_now_add=True)
    time_update = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    cat = models.ForeignKey('Category', on_delete=models.PROTECT, null=True)
    user = models.ForeignKey(User, verbose_name='Пользователь', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name='Цена')

    def __str__(self):
        return self.title
    
class Category(models.Model):
    name = models.CharField(max_length=100, db_index=True)

    def __str__(self):
        return self.name

   


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food_items = models.ManyToManyField(Food)
    address = models.CharField(max_length=255)
    distance = models.FloatField()  
    created_at = models.DateTimeField(auto_now_add=True)
    estimated_delivery_time = models.IntegerField(blank=True, null=True)  

    def calculate_delivery_time(self):
        total_dishes = self.food_items.count()
        
        preparation_time = (total_dishes // 4) * 5 + (5 if total_dishes % 4 != 0 else 0)

        delivery_time = self.distance * 3
        
        total_time = preparation_time + delivery_time
        self.estimated_delivery_time = total_time
        self.save()