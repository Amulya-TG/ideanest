from django.contrib import admin
from .models import Idea, Spark, Comment

admin.site.register(Idea)
admin.site.register(Spark)
admin.site.register(Comment)