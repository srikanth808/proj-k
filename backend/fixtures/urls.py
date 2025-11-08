from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, FixtureViewSet, generate_default_tournament, generate_fixtures

router = DefaultRouter()
router.register('tournaments', TournamentViewSet)
router.register('fixtures', FixtureViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('generate_default/', generate_default_tournament, name='generate-default-tournament'),
    path('tournaments/<int:tournament_id>/generate_fixtures/', generate_fixtures, name='generate-fixtures'),
    # explicit route to return fixtures for a tournament (used by tests)
    path('tournaments/<int:tournament_id>/fixtures/', TournamentViewSet.as_view({'get': 'fixtures'}), name='tournament-fixtures'),
]