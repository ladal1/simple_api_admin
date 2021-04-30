simple_api_frontend
==============================

Quick but powerful web admin interface for testing [simple_API](https://github.com/karlosss/simple_api)

Installing
----------
```shell
  pip install -e ./build
  OR
  pip install -i https://test.pypi.org/simple/ simple_api_admin
```
How to use
----------
In your django settings.py include simple_api_frontend in you installed apps:

```python
  # ....
  INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'graphene_django',
    'testcases',
    'simple_api_admin',
    #...
  ]
  #...
```


And then add simple_api_admin into your urls.py (patterns is simple_api.adapters.graphql.utils.build_patterns to create Simple API):

```python
from django.urls import path
from simple_api_admin import views


urlpatterns += [# ...Other urls, path('simple/', views.site.urls)]
```

### Warning: Currently frontend is hardcoded to expect API at ../api/
