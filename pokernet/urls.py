from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'pokernet.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    (r'^users/', include('users.urls')),
    (r'^tables/', include('tables.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
