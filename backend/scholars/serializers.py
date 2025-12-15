from rest_framework import serializers
from .models import User, Scholar, Activity, ActivityCategory

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "role"]

class ScholarSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Scholar
        fields = ["id", "user", "level", "required_hours_per_month"]

class ActivityCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityCategory
        fields = ["id", "name", "description"]

class ActivitySerializer(serializers.ModelSerializer):
    scholar = ScholarSerializer(read_only=True)
    category = ActivityCategorySerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    class Meta:
        model = Activity
        fields = [
            "id", "scholar", "category", "description", "hours", "activity_date",
            "status", "reviewed_by", "review_comment", "created_at", "updated_at", "reviewed_at"
        ]

# scholars/serializers.py
from rest_framework import serializers
from users.models import User
from .models import Scholar

class ScholarCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    level = serializers.CharField(required=False, allow_blank=True)
    required_hours_per_month = serializers.IntegerField(default=0)

    def create(self, validated_data):
        # Create User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.SCHOLAR
        )

        # Create Scholar linked to User
        scholar = Scholar.objects.create(
            user=user,
            level=validated_data.get('level', ''),
            required_hours_per_month=validated_data.get('required_hours_per_month', 0)
        )

        return scholar
