from rest_framework.generics import CreateAPIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer
from .models import Profile

User = get_user_model()


class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    from ideas.models import Idea, SavedIdea
    profile, _ = Profile.objects.get_or_create(user=request.user)
    my_ideas     = Idea.objects.filter(user=request.user)
    total_sparks = sum(idea.sparks.count() for idea in my_ideas)
    saved_count  = SavedIdea.objects.filter(user=request.user).count()

    return Response({
        'username':     request.user.username,
        'bio':          profile.bio,
        'total_ideas':  my_ideas.count(),
        'total_sparks': total_sparks,
        'saved_count':  saved_count,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    profile.bio = request.data.get('bio', profile.bio)
    profile.save()
    return Response({
        'username': request.user.username,
        'bio':      profile.bio,
    })
