from django.urls import path
from . import views

urlpatterns = [
    path('',views.idea_list), 
    path('create/',views.idea_create),     
    path('my-ideas/',views.my_ideas), 
    path('saved/',views.my_saved_ideas),  

    path('<int:idea_id>/', views.idea_detail),   
    path('<int:idea_id>/edit/',views.idea_edit), 
    path('<int:idea_id>/delete/',views.idea_delete),

    path('<int:idea_id>/spark/',views.toggle_spark),  
    path('<int:idea_id>/save/', views.toggle_save),  

    path('<int:idea_id>/comment/',views.add_comment),     
    path('<int:idea_id>/comments/',views.get_comments), 

    path('tags/',views.tag_list),   
]
