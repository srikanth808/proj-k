from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q, Avg
from .models import Player
from .serializers import PlayerSerializer

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Disable pagination

    def get_queryset(self):
        queryset = Player.objects.all()
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        ranking_min = self.request.query_params.get('ranking_min', None)
        ranking_max = self.request.query_params.get('ranking_max', None)

        if category:
            queryset = queryset.filter(category=category)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(country__icontains=search)
            )

        if ranking_min:
            queryset = queryset.filter(ranking__gte=int(ranking_min))

        if ranking_max:
            queryset = queryset.filter(ranking__lte=int(ranking_max))

        return queryset.order_by('-ranking', 'name')

    @action(detail=True, methods=['post'])
    def update_ranking(self, request, pk=None):
        player = self.get_object()
        points = request.data.get('points', 0)
        player.ranking += int(points)
        player.save()
        return Response({'ranking': player.ranking})

    @action(detail=False, methods=['get'])
    def top_players(self, request):
        limit = int(request.query_params.get('limit', 10))
        category = request.query_params.get('category', None)

        queryset = Player.objects.all()
        if category:
            queryset = queryset.filter(category=category)

        top_players = queryset.order_by('-ranking')[:limit]
        serializer = self.get_serializer(top_players, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats_summary(self, request):
        total_players = Player.objects.count()
        category_stats = {}
        for choice in Player.CATEGORY_CHOICES:
            code, name = choice
            count = Player.objects.filter(category=code).count()
            category_stats[code] = {'name': name, 'count': count}

        avg_ranking = Player.objects.filter(ranking__gt=0).aggregate(
            avg=Avg('ranking')
        )['avg'] or 0

        return Response({
            'total_players': total_players,
            'category_breakdown': category_stats,
            'average_ranking': round(avg_ranking, 2)
        })
