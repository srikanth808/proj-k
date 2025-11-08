from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Tournament, Fixture
from .serializers import TournamentSerializer, FixtureSerializer
from players.models import Player
import random


class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Disable pagination

    @action(detail=True, methods=['get'])
    def fixtures(self, request, pk=None):
        """Return all fixtures for this tournament"""
        tournament = self.get_object()
        qs = Fixture.objects.filter(tournament=tournament).select_related('player1', 'player2', 'winner')
        serializer = FixtureSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def generate_fixtures(self, request, pk=None):
        """Generate a knockout bracket (round 1 fixtures) for this tournament.

        Accepts JSON { "player_ids": [1,2,3,...] }.
        Automatically adds byes to reach next power of two.
        """
        tournament = self.get_object()
        player_ids = request.data.get('player_ids') or []
        if not player_ids:
            return Response({"detail": "player_ids required"}, status=status.HTTP_400_BAD_REQUEST)

        players = list(Player.objects.filter(id__in=player_ids))
        if not players:
            return Response({"detail": "no valid players provided"}, status=status.HTTP_400_BAD_REQUEST)

        # randomize order so bracket is not deterministic
        random.shuffle(players)

        n = len(players)
        # next power of two
        p = 1 << (n - 1).bit_length()
        byes = p - n

        # create slots: players + None for byes
        slots = players + [None] * byes

        fixtures_created = []
        match_num = 1
        # pair slots sequentially
        for i in range(0, len(slots), 2):
            p1 = slots[i]
            p2 = slots[i + 1] if i + 1 < len(slots) else None
            bye = (p2 is None)
            f = Fixture.objects.create(
                tournament=tournament,
                round_number=1,
                match_number=match_num,
                player1=p1 if p1 else None,
                player2=p2 if p2 else None,
                bye=bye,
            )
            fixtures_created.append(f)
            match_num += 1

        serializer = FixtureSerializer(fixtures_created, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FixtureViewSet(viewsets.ModelViewSet):
    queryset = Fixture.objects.select_related('player1', 'player2', 'tournament').all()
    serializer_class = FixtureSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
def generate_default_tournament(request):
    """Create a default tournament and generate fixtures using all registered players.

    POST /api/fixtures/generate_default/  -> creates a Tournament named 'Auto Tournament'
    and generates round-1 fixtures for all players.
    """
    players = list(Player.objects.all())
    if not players:
        return Response({"detail": "no players registered"}, status=status.HTTP_400_BAD_REQUEST)

    tournament = Tournament.objects.create(name='Auto Tournament', start_date=None, end_date=None, status='UPCOMING')

    # generate fixtures logic (reuse same algorithm)
    random.shuffle(players)
    n = len(players)
    p = 1 << (n - 1).bit_length()
    byes = p - n
    slots = players + [None] * byes

    fixtures_created = []
    match_num = 1
    for i in range(0, len(slots), 2):
        p1 = slots[i]
        p2 = slots[i + 1] if i + 1 < len(slots) else None
        bye = (p2 is None)
        f = Fixture.objects.create(
            tournament=tournament,
            round_number=1,
            match_number=match_num,
            player1=p1 if p1 else None,
            player2=p2 if p2 else None,
            bye=bye,
        )
        fixtures_created.append(f)
        match_num += 1

    serializer = FixtureSerializer(fixtures_created, many=True)
    return Response({"tournament_id": tournament.id, "fixtures": serializer.data}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_fixtures(request, tournament_id):
    """Generate fixtures for a specific tournament"""
    try:
        tournament = Tournament.objects.get(id=tournament_id)
    except Tournament.DoesNotExist:
        return Response({"detail": "Tournament not found"}, status=status.HTTP_404_NOT_FOUND)
    
    player_ids = request.data.get('player_ids') or []
    if not player_ids:
        return Response({"detail": "player_ids required"}, status=status.HTTP_400_BAD_REQUEST)

    players = list(Player.objects.filter(id__in=player_ids))
    if not players:
        return Response({"detail": "no valid players provided"}, status=status.HTTP_400_BAD_REQUEST)

    # randomize order so bracket is not deterministic
    random.shuffle(players)

    n = len(players)
    # next power of two
    p = 1 << (n - 1).bit_length()
    byes = p - n

    # create slots: players + None for byes
    slots = players + [None] * byes

    fixtures_created = []
    match_num = 1
    # pair slots sequentially
    for i in range(0, len(slots), 2):
        p1 = slots[i]
        p2 = slots[i + 1] if i + 1 < len(slots) else None
        bye = (p2 is None)
        f = Fixture.objects.create(
            tournament=tournament,
            round_number=1,
            match_number=match_num,
            player1=p1 if p1 else None,
            player2=p2 if p2 else None,
            bye=bye,
        )
        fixtures_created.append(f)
        match_num += 1

    serializer = FixtureSerializer(fixtures_created, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
