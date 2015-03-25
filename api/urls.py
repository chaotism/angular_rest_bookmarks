# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf.urls import patterns, include, url
from .views import BookMarkTreeALDetail, BookMarkTreeALAPIView

from rest_framework.urlpatterns import format_suffix_patterns

nodes_urls = patterns(
    '',
    url(r'^$', BookMarkTreeALAPIView.as_view(), name='list'),
    url(r'^/(?P<pk>\d+)$',BookMarkTreeALDetail.as_view(), name='detail'),

)

urlpatterns = patterns(
    '',
    url(r'^nodes', include(nodes_urls , namespace='nodes')),
    # url(r'^$', BookMarkTreeMPAPIView.as_view(), name='list'),
    # url(r'^$', BookMarkTreeALAPIView.as_view(), name='list'),
    # url(r'^/(?P<pk>\d+)$',BookMarkTreeALDetail.as_view(), name='detail'),

)
