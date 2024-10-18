from django.contrib import admin

from .models import Food, Order, Category

# Register your models here.

admin.site.register(Food)
admin.site.register(Order)
admin.site.register(Category)