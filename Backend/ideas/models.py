from django.db import models
from django.contrib.auth.models import User

STAGE_CHOICES = [
    ('raw',      '💡 Raw Idea'),
    ('progress', '🔧 In Progress'),
    ('launch',   '🚀 Ready to Launch'),
    ('partner',  '🤝 Looking for Partner'),
]

CATEGORY_CHOICES = [
    ('tech',      '💻 Tech'),
    ('health',    '🏥 Health'),
    ('education', '📚 Education'),
    ('finance',   '💰 Finance'),
    ('social',    '🌍 Social Impact'),
    ('creative',  '🎨 Creative'),
    ('other',     '🔮 Other'),
]


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Idea(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ideas')
    title = models.CharField(max_length=150)
    description = models.TextField()
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='raw')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    contact = models.CharField(max_length=200, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name='ideas')  # ← was MISSING
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Spark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='sparks')

    class Meta:
        unique_together = ('user', 'idea')


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text


class SavedIdea(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_ideas')
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='saves')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'idea')
