from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Game, Point
from .serializers import GameSerializer, PointSerializer
from matches.models import Match
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.select_related('match', 'winner').all()
    serializer_class = GameSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Disable pagination

    def get_queryset(self):
        queryset = Game.objects.all()
        match_id = self.request.query_params.get('match', None)
        if match_id is not None:
            queryset = queryset.filter(match_id=match_id)
        return queryset

    def create(self, request, *args, **kwargs):
        # Ensure match_id is provided
        match_id = request.data.get('match')
        if not match_id:
            return Response({'error': 'match field is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate match exists
        try:
            match = Match.objects.get(id=match_id)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def add_point(self, request, pk=None):
        game = self.get_object()
        if game.completed:
            return Response({'error': 'Game is already completed'}, status=status.HTTP_400_BAD_REQUEST)

        player_id = request.data.get('player')
        if not player_id:
            return Response({'error': 'Player ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Add point logic
        if player_id == game.match.fixture.player1_id:
            game.player1_score += 1
        elif player_id == game.match.fixture.player2_id:
            game.player2_score += 1
        else:
            return Response({'error': 'Invalid player ID'}, status=status.HTTP_400_BAD_REQUEST)

        # Create point record
        Point.objects.create(game=game, scored_by_id=player_id)

        # Badminton scoring rules:
        # - First to 21 points wins (must win by 2)
        # - If score reaches 20-20, continue until one leads by 2 (deuce)
        # - Maximum score is 30 (if 29-29, next point wins)
        score1 = game.player1_score
        score2 = game.player2_score
        
        game_won = False
        
        # Check for game completion
        if score1 >= 30 or score2 >= 30:
            # At 30, next point wins (29-29 scenario)
            if score1 == 30:
                game_won = True
                game.winner_id = game.match.fixture.player1_id
            elif score2 == 30:
                game_won = True
                game.winner_id = game.match.fixture.player2_id
        elif (score1 >= 21 or score2 >= 21):
            # Normal win: first to 21 with 2-point lead
            if abs(score1 - score2) >= 2:
                game_won = True
                game.winner_id = game.match.fixture.player1_id if score1 > score2 else game.match.fixture.player2_id
        
        if game_won:
            game.completed = True
            game.save()
            
            # Check if match is complete (best of 3 games)
            self._check_match_completion(game.match)
        else:
            game.save()

        # Send WebSocket update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'scoring',
            {
                'type': 'score_update',
                'match_id': game.match.id,
                'game_id': game.id,
                'player1_score': game.player1_score,
                'player2_score': game.player2_score,
                'completed': game.completed,
                'winner_id': game.winner_id,
            }
        )

        serializer = self.get_serializer(game)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def undo_point(self, request, pk=None):
        game = self.get_object()

        # Find last point
        last_point = Point.objects.filter(game=game).order_by('-timestamp').first()

        if not last_point:
            return Response({'error': 'No points to undo'}, status=status.HTTP_400_BAD_REQUEST)

        # Undo the point
        if last_point.scored_by_id == game.match.fixture.player1_id:
            game.player1_score = max(0, game.player1_score - 1)
        else:
            game.player2_score = max(0, game.player2_score - 1)

        # Delete the point
        last_point.delete()

        # Reset completion status if needed
        score1 = game.player1_score
        score2 = game.player2_score
        
        # Check if game should still be completed based on badminton rules
        should_be_completed = False
        if score1 >= 30 or score2 >= 30:
            should_be_completed = True
        elif (score1 >= 21 or score2 >= 21) and abs(score1 - score2) >= 2:
            should_be_completed = True
        
        if game.completed and not should_be_completed:
            game.completed = False
            game.winner = None
            # Re-check match completion
            self._check_match_completion(game.match)

        game.save()

        # Send WebSocket update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'scoring',
            {
                'type': 'score_update',
                'match_id': game.match.id,
                'game_id': game.id,
                'player1_score': game.player1_score,
                'player2_score': game.player2_score,
                'completed': game.completed,
                'winner_id': game.winner_id,
            }
        )

        serializer = self.get_serializer(game)
        return Response(serializer.data)

    def _check_match_completion(self, match):
        """Check if match is complete (best of 3 games) and update match winner"""
        from scoring.models import Game
        
        # Get all completed games for this match
        games = Game.objects.filter(match=match, completed=True)
        
        player1_wins = 0
        player2_wins = 0
        
        for game in games:
            if game.winner_id == match.fixture.player1_id:
                player1_wins += 1
            elif game.winner_id == match.fixture.player2_id:
                player2_wins += 1
        
        # Match is complete when a player wins 2 games
        if player1_wins >= 2:
            match.winner_id = match.fixture.player1_id
            match.status = 'COMPLETED'
            match.save()
            
            # Update fixture winner
            match.fixture.winner_id = match.fixture.player1_id
            match.fixture.save()
            
            # Send WebSocket update
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'scoring',
                {
                    'type': 'match_completed',
                    'match_id': match.id,
                    'winner_id': match.winner_id,
                }
            )
        elif player2_wins >= 2:
            match.winner_id = match.fixture.player2_id
            match.status = 'COMPLETED'
            match.save()
            
            # Update fixture winner
            match.fixture.winner_id = match.fixture.player2_id
            match.fixture.save()
            
            # Send WebSocket update
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'scoring',
                {
                    'type': 'match_completed',
                    'match_id': match.id,
                    'winner_id': match.winner_id,
                }
            )

class PointViewSet(viewsets.ModelViewSet):
    queryset = Point.objects.select_related('game', 'scored_by').all()
    serializer_class = PointSerializer
    permission_classes = [AllowAny]
