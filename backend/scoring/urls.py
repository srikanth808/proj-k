from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GameViewSet, PointViewSet

router = DefaultRouter()
router.register('games', GameViewSet)
router.register('points', PointViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
