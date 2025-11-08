from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Match
from .serializers import MatchSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.select_related('fixture__player1', 'fixture__player2', 'winner').all()
    serializer_class = MatchSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Disable pagination

    def get_queryset(self):
        qs = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status__iexact=status)
        return qs

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        match = self.get_object()
        status = request.data.get('status')
        if status in ['SCHEDULED', 'LIVE', 'COMPLETED']:
            match.status = status
            match.save()

            # Send WebSocket update
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'scoring',
                {
                    'type': 'match_status_update',
                    'match_id': match.id,
                    'status': status,
                }
            )

            return Response({'status': 'match status updated'})
        return Response({'error': 'invalid status'}, status=400)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        match = self.get_object()
        if match.status != 'SCHEDULED':
            return Response({'error': 'Match must be scheduled to start'}, status=400)

        match.status = 'LIVE'
        match.save()

        # Send WebSocket update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'scoring',
            {
                'type': 'match_started',
                'match_id': match.id,
                'status': 'LIVE',
            }
        )

        return Response({'status': 'match started'})

    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        match = self.get_object()
        if match.status != 'LIVE':
            return Response({'error': 'Match must be live to end'}, status=400)

        match.status = 'COMPLETED'
        match.save()

        # Send WebSocket update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'scoring',
            {
                'type': 'match_ended',
                'match_id': match.id,
                'status': 'COMPLETED',
            }
        )

        return Response({'status': 'match ended'})
