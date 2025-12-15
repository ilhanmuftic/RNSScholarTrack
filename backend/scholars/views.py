from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import User, Scholar, Activity, ActivityCategory
from .serializers import ScholarCreateSerializer, UserSerializer, ScholarSerializer, ActivitySerializer, ActivityCategorySerializer
from .services import storage
from .permissions import IsAdminUser, IsAuthenticatedUser
from datetime import datetime

# ---------- Admin Endpoints ----------
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    stats = storage.get_dashboard_stats()
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_activities(request):
    activities = storage.get_activities_with_details()
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_approve_activity(request, id):
    comment = request.data.get('comment', '')
    activity = storage.update_activity_status(id, 'approved', request.user.id, comment)
    if not activity:
        return Response({"message": "Activity not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = ActivitySerializer(activity)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_reject_activity(request, id):
    comment = request.data.get('comment', '')
    activity = storage.update_activity_status(id, 'rejected', request.user.id, comment)
    if not activity:
        return Response({"message": "Activity not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = ActivitySerializer(activity)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_scholars(request):
    scholars = storage.get_all_scholars_with_users()
    result = []
    for scholar in scholars:
        stats = storage.get_scholar_stats(scholar.id)
        serialized_scholar = ScholarSerializer(scholar).data
        serialized_scholar['stats'] = stats
        result.append(serialized_scholar)
    return Response(result)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_scholar(request):
    serializer = ScholarCreateSerializer(data=request.data)
    if serializer.is_valid():
        scholar = serializer.save()
        return Response({
            "scholar_id": scholar.id,
            "username": scholar.user.username,
            "password": request.data['password'], 
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------- Scholar Endpoints ----------
@api_view(['GET'])
@permission_classes([IsAuthenticatedUser])
def scholar_profile(request):
    scholar = storage.get_scholar_by_user(request.user.id)
    if not scholar:
        return Response({"message": "Scholar profile not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = ScholarSerializer(scholar)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticatedUser])
def scholar_stats(request):
    scholar = storage.get_scholar_by_user(request.user.id)
    if not scholar:
        return Response({"message": "Scholar not found"}, status=status.HTTP_404_NOT_FOUND)
    stats = storage.get_scholar_stats(scholar.id)
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticatedUser])
def scholar_recent_activities(request):
    scholar = storage.get_scholar_by_user(request.user.id)
    if not scholar:
        return Response({"message": "Scholar not found"}, status=status.HTTP_404_NOT_FOUND)
    activities = storage.get_recent_activities_by_scholar(scholar.id, 10)
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticatedUser])
def scholar_activities(request):
    scholar = storage.get_scholar_by_user(request.user.id)
    if not scholar:
        return Response({"message": "Scholar not found"}, status=status.HTTP_404_NOT_FOUND)
    activities = storage.get_activities_by_scholar(scholar.id)
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticatedUser])
def create_activity(request):
    scholar = storage.get_scholar_by_user(request.user.id)
    if not scholar:
        return Response({"message": "Scholar not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = ActivitySerializer(data=request.data)
    if serializer.is_valid():
        activity = storage.create_activity(scholar_id=scholar.id, **serializer.validated_data)
        return Response(ActivitySerializer(activity).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticatedUser])
def get_categories(request):
    categories = storage.get_all_categories()
    serializer = ActivityCategorySerializer(categories, many=True)
    return Response(serializer.data)
