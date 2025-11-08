"""
ASGI config for badminton_tournament project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import scoring.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'badminton_tournament.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            scoring.routing.websocket_urlpatterns
        )
    ),
})
