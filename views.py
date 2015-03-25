# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.views.generic import TemplateView


class SimpleStaticView(TemplateView):
    def get_template_names(self):
        return [self.kwargs.get('template_name') + ".html"]

    def get(self, request, *args, **kwargs):
        return super(SimpleStaticView, self).get(request, *args, **kwargs)