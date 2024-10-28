from django.contrib import admin
from food.models import Category, Food

# Register your models here.

admin.site.register(Food)
admin.site.register(Category)