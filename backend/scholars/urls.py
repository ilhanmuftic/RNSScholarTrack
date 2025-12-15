from django.urls import path
from . import views

urlpatterns = [
    # Admin
    path('admin/stats/', views.admin_stats),
    path('admin/activities/', views.admin_activities),
    path('admin/activities/<int:id>/approve/', views.admin_approve_activity),
    path('admin/activities/<int:id>/reject/', views.admin_reject_activity),
    path('admin/scholars/', views.admin_scholars),
    path('admin/scholars/create/', views.admin_create_scholar),

    # Scholar
    path('profile/', views.scholar_profile),
    path('scholar/stats/', views.scholar_stats),
    path('scholar/activities/', views.scholar_activities),
    path('activities/', views.create_activity),
    path('categories/', views.get_categories),
]
