from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Idea, Spark, Comment, Tag, SavedIdea
from .serializers import (
    IdeaSerializer, IdeaListSerializer,
    CommentSerializer, TagSerializer, SavedIdeaSerializer
)

# LIST
@api_view(['GET'])
@permission_classes([AllowAny])
def idea_list(request):
    ideas = Idea.objects.all()

    stage    = request.query_params.get('stage', '').strip()
    category = request.query_params.get('category', '').strip()
    tag      = request.query_params.get('tag', '').strip()
    search   = request.query_params.get('search', '').strip()
    sort     = request.query_params.get('sort', 'latest')

    if stage:
        ideas = ideas.filter(stage=stage)
    if category:
        ideas = ideas.filter(category=category)
    if tag:
        ideas = ideas.filter(tags__name__iexact=tag)
    if search:
        ideas = ideas.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(tags__name__icontains=search)
        ).distinct()

    if sort == 'sparks':
        ideas = ideas.annotate(spark_count=Count('sparks')).order_by('-spark_count', '-created_at')
    elif sort == 'comments':
        ideas = ideas.annotate(comment_count=Count('comments')).order_by('-comment_count', '-created_at')
    else:
        ideas = ideas.order_by('-created_at')

    return Response(IdeaListSerializer(ideas, many=True).data)


# TRENDING
@api_view(['GET'])
@permission_classes([AllowAny])
def trending_ideas(request):
    ideas = (
        Idea.objects
        .annotate(spark_count=Count('sparks'), comment_count=Count('comments'))
        .order_by('-spark_count', '-comment_count', '-created_at')[:6]
    )
    return Response(IdeaListSerializer(ideas, many=True).data)


# CREATE
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def idea_create(request):
    serializer = IdeaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


# DETAIL
@api_view(['GET'])
@permission_classes([AllowAny])
def idea_detail(request, idea_id):
    try:
        idea = Idea.objects.get(id=idea_id)
    except Idea.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    return Response(IdeaSerializer(idea).data)


# EDIT (owner only)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def idea_edit(request, idea_id):
    try:
        idea = Idea.objects.get(id=idea_id, user=request.user)
    except Idea.DoesNotExist:
        return Response({'error': 'Not found or not authorized'}, status=404)
    serializer = IdeaSerializer(idea, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response({'errors': serializer.errors}, status=400)


# DELETE (owner only)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def idea_delete(request, idea_id):
    try:
        idea = Idea.objects.get(id=idea_id, user=request.user)
        idea.delete()
        return Response({'message': 'Deleted'}, status=204)
    except Idea.DoesNotExist:
        return Response({'error': 'Not found or not authorized'}, status=404)


# MY IDEAS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_ideas(request):
    ideas = Idea.objects.filter(user=request.user).order_by('-created_at')
    return Response(IdeaListSerializer(ideas, many=True).data)


# SPARK TOGGLE
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_spark(request, idea_id):
    try:
        idea = Idea.objects.get(id=idea_id)
    except Idea.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    spark, created = Spark.objects.get_or_create(user=request.user, idea=idea)
    if not created:
        spark.delete()
        return Response({'sparked': False, 'sparks_count': idea.sparks.count()})
    return Response({'sparked': True, 'sparks_count': idea.sparks.count()})


# SAVE TOGGLE
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_save(request, idea_id):
    try:
        idea = Idea.objects.get(id=idea_id)
    except Idea.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    saved_obj, created = SavedIdea.objects.get_or_create(user=request.user, idea=idea)
    if not created:
        saved_obj.delete()
        return Response({'saved': False})
    return Response({'saved': True})


# MY SAVED IDEAS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_saved_ideas(request):
    saved = SavedIdea.objects.filter(user=request.user).order_by('-saved_at')
    return Response(SavedIdeaSerializer(saved, many=True).data)


# ADD COMMENT
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, idea_id):
    try:
        idea = Idea.objects.get(id=idea_id)
    except Idea.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    text = request.data.get('text', '').strip()
    if not text:
        return Response({'error': 'Comment text is required'}, status=400)
    comment = Comment.objects.create(user=request.user, idea=idea, text=text)
    return Response(CommentSerializer(comment).data, status=201)


# GET COMMENTS
@api_view(['GET'])
@permission_classes([AllowAny])
def get_comments(request, idea_id):
    comments = Comment.objects.filter(idea_id=idea_id).order_by('created_at')
    return Response(CommentSerializer(comments, many=True).data)


# TAG LIST
@api_view(['GET'])    
@permission_classes([AllowAny])
def tag_list(request):
    tags = Tag.objects.all().order_by('name')
    return Response(TagSerializer(tags, many=True).data)
