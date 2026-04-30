from rest_framework import serializers
from .models import Tag, Idea, Spark, Comment, SavedIdea

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Tag
        fields = ['id', 'name']

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model  = Comment
        fields = ['id', 'username', 'text', 'created_at']


class IdeaSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    sparks_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()
    tags_input = serializers.CharField(write_only=True, required=False, allow_blank=True,default='',)

    class Meta:
        model  = Idea
        fields = [
            'id', 'user', 'title', 'description',
            'stage', 'category', 'contact',
            'tags', 'tags_input',
            'sparks_count', 'comments_count', 'comments',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'title': {'required': True},
            'description': {'required': True},
            'stage': {'required': False},
            'category': {'required': False},
            'contact': {'required': False, 'allow_blank': True},
        }

    def get_sparks_count(self, obj):
        return obj.sparks.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_tags(self, obj):
        return [tag.name for tag in obj.tags.all()]

    def _save_tags(self, idea, tags_input):
        if tags_input is None:
            return
        raw_names = [t.strip().lstrip('#') for t in tags_input.split(',')]
        tag_names = [n for n in raw_names if n][:10]

        tag_objects = []
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            tag_objects.append(tag)
        idea.tags.set(tag_objects)

    def create(self, validated_data):
        tags_input = validated_data.pop('tags_input', '')
        idea = Idea.objects.create(**validated_data)
        self._save_tags(idea, tags_input)
        return idea

    def update(self, instance, validated_data):
        tags_input = validated_data.pop('tags_input', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_input is not None:
            self._save_tags(instance, tags_input)
        return instance


class IdeaListSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    sparks_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model  = Idea
        fields = [
            'id', 'user', 'title', 'description',
            'stage', 'category', 'contact',
            'tags', 'sparks_count', 'comments_count',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
        
    def get_sparks_count(self, obj):
        return obj.sparks.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_tags(self, obj):
        return [tag.name for tag in obj.tags.all()]


class SavedIdeaSerializer(serializers.ModelSerializer):
    idea = IdeaListSerializer(read_only=True)

    class Meta:
        model  = SavedIdea
        fields = ['id', 'idea', 'saved_at']
