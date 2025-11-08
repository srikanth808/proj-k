from rest_framework import serializers
from .models import Tournament, Fixture
from players.serializers import PlayerSerializer
from players.models import Player

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'start_date', 'end_date', 'status']

    def validate(self, data):
        """
        Check that start_date is before end_date.
        """
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    "end_date": "End date must be after start date"
                })
        return data

class FixtureSerializer(serializers.ModelSerializer):
    player1 = PlayerSerializer(read_only=True)
    player2 = PlayerSerializer(read_only=True)
    winner = PlayerSerializer(read_only=True)
    score = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = Fixture
        fields = ['id', 'tournament', 'round_number', 'match_number',
                  'player1', 'player2', 'bye', 'winner', 'score']
