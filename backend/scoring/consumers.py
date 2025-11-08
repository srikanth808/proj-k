import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Game, Point
from matches.models import Match

class ScoringConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'scoring'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'score_update':
            await self.handle_score_update(data)
        elif message_type == 'match_start':
            await self.handle_match_start(data)
        elif message_type == 'match_end':
            await self.handle_match_end(data)

    async def handle_score_update(self, data):
        # Broadcast score update to all connected clients
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'score_update_broadcast',
                'data': data
            }
        )

    async def handle_match_start(self, data):
        # Broadcast match start to all connected clients
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'match_start_broadcast',
                'data': data
            }
        )

    async def handle_match_end(self, data):
        # Broadcast match end to all connected clients
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'match_end_broadcast',
                'data': data
            }
        )

    # Broadcast handlers
    async def score_update_broadcast(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'type': 'score_update',
            'match_id': data.get('match_id'),
            'player': data.get('player'),
            'score': data.get('score'),
            'timestamp': data.get('timestamp')
        }))

    async def match_start_broadcast(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'type': 'match_started',
            'match_id': data.get('match_id'),
            'status': data.get('status')
        }))

    async def match_end_broadcast(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'type': 'match_ended',
            'match_id': data.get('match_id'),
            'status': data.get('status')
        }))
