from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    # Страницы
    path('', views.index, name='index'),
    path('tables/<int:table_id>/', views.table_page),

    # JSON API
    path('tables/get_tables', views.get_tables),
    path('tables/add_table', views.add_table),
    path('tables/<int:table_id>/get_table', views.get_table),
    path('tables/<int:table_id>/add_row', views.add_row),
    path('tables/<int:table_id>/delete_row', views.delete_row),
    path('tables/<int:table_id>/add_column', views.add_column),
    path('tables/<int:table_id>/delete_column', views.delete_column),
    path('tables/<int:table_id>/edit_column_name', views.edit_column_name),
    path('tables/<int:table_id>/edit_cell', views.edit_cell),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
