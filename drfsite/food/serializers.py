from rest_framework import serializers
from food.models import Food
from django.contrib.auth.models import User



class FoodSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default = serializers.CurrentUserDefault())
    class Meta:
        model = Food 
        fields = "__all__"