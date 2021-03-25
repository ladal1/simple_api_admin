import json
from json.decoder import JSONDecodeError

from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.http import Http404, JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.utils.functional import LazyObject
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.conf import settings


class Simple_API_site:
    def __init__(self, name='frontend'):
        self.name = name

    def get_urls(self):
        from django.conf.urls import url
        from django.urls import path

        urlpatterns = [
            path('login', self.simple_login, name='simple_login'),
            url(r'^.*', self.react, name='simple_frontend'),
        ]
        return urlpatterns

    @property
    def urls(self):
        return self.get_urls(), 'frontend', self.name

    @method_decorator(ensure_csrf_cookie)
    def react(self, request):
        if not settings.DEBUG:
            raise Http404
        return render(request, "index.html", context={})

    @method_decorator(require_http_methods(["POST"]))
    def simple_login(self, request):
        if not settings.DEBUG:
            raise Http404
        try:
            received = json.loads(request.body)
            if received["operation"] == "status":
                data = {
                    'username': request.user.username,
                    'success': request.user.is_authenticated,
                    'operation': received["operation"],
                }
                return JsonResponse(data)
            if received["operation"] == "login":
                if User.objects.filter(username__iexact=received["username"]).exists():
                    login(request, User.objects.get(username__iexact=received["username"]))
                    data = {
                        'username': received["username"],
                        'success': True,
                        'operation': received["operation"],
                        'reason': None
                    }
                    return JsonResponse(data)
                else:
                    data = {
                        'username': received["username"],
                        'success': False,
                        'operation': received["operation"],
                        'reason': "User does not exist"
                    }
                    return JsonResponse(data)
            else:
                if received["operation"] == "logout":
                    logout(request)
                    data = {
                        'success': True,
                        'operation': received["operation"],
                        'reason': None
                    }
                    return JsonResponse(data)
                else:
                    data = {
                        'username': received["username"],
                        'success': False,
                        'operation': received["operation"],
                        'reason': "Invalid operation"
                    }
                    return JsonResponse(data)
        except (KeyError, JSONDecodeError) as e:
            data = {
                'success': False,
                'reason': "Invalid request"
            }
            return JsonResponse(data)


class DefaultFrontend(LazyObject):
    def _setup(self):
        FrontendClass = Simple_API_site
        self._wrapped = FrontendClass()


# This global object represents the default admin site with deferred loading, for the common case.
# Shamelessly stolen from Django admin
site = DefaultFrontend()
