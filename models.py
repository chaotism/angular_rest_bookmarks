# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth import get_user_model
from django.utils.translation import ugettext_lazy as _
from django.db import models
from django.conf import settings
import treebeard.mp_tree
import treebeard.al_tree


APP_LABEL = 'angular_rest_bookmarks'

USER_MODEL = get_user_model()


class Folder_AL(treebeard.al_tree.AL_Node):
    name = models.CharField(max_length=100, verbose_name=_('Название'))
    user = models.ForeignKey(USER_MODEL, verbose_name='пользователь', blank=True, null=True, related_name='folders_al')
    source = models.ForeignKey('source.Source', blank=True, null=True)
    # source = models.ForeignKey(verbose_name=_('Ид_ресурса'), max_length=200, blank=True, null=True)
    #source = models.ForeignKey('source.Source', verbose_name=_('Название раздела'), related_name='folders', blank=True, null=True)
    parent = models.ForeignKey('self', related_name='children_set', blank=True, null=True, db_index=True)

    node_order_by = ['name']

    def __unicode__(self):
        return 'Раздел: %s' % self.name



# class Folder_MP(treebeard.mp_tree.MP_Node):
# name = models.CharField(max_length=100, verbose_name=_('Название'))
#     user = models.ForeignKey(USER_MODEL, verbose_name='пользователь', blank=True,null=True, related_name='folders_mp')
#
#
#     node_order_by = ['name']
#
#     def __unicode__(self):
#         return 'Раздел: %s' % self.name
