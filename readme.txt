приложение в режиме тестирования
для работы добавить в local.py
#bookmarks
INSTALLED_APPS += ('angular_rest_bookmarks', 'treebeard')
в url.py
if 'angular_rest_bookmarks' in settings.INSTALLED_APPS:
    urlpatterns += patterns('',
        url(r'^bookmarks/', include('angular_rest_bookmarks.urls', namespace='rest_bookmarks')),
    )
