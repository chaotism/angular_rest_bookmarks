# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf.urls import patterns, include, url
from django.conf import settings
from .views import SimpleStaticView


urlpatterns = patterns('',
    url(r'^api/', include('angular_rest_bookmarks.api.urls', namespace='api')),
)

if settings.DEBUG:
    urlpatterns += patterns('',
                            url(r'^(?P<template_name>\w+)$', SimpleStaticView.as_view(), name='example'),
                            )
