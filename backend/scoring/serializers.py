from rest_framework import serializers
from .models import Game, Point
from matches.serializers import MatchSerializer

class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields = ['id', 'game', 'scored_by', 'timestamp']

class GameSerializer(serializers.ModelSerializer):
    match = MatchSerializer(read_only=True)
    points = PointSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = ['id', 'match', 'game_number', 'player1_score',
                 'player2_score', 'completed', 'winner', 'points']
