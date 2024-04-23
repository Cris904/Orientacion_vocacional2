from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Room, Chat
from django.db.models import Q
from friend.models import FriendList
from django.contrib.auth.models import User
from channels.generic.websocket import AsyncWebsocketConsumer
import json


@login_required
def room_enroll(request):
    friends = FriendList.objects.filter(user=request.user)[0].friends.all()
    all_rooms = Room.objects.filter(
        Q(author=request.user) | Q(friend=request.user)
    ).order_by('-created')

    context = {
        'all_rooms':all_rooms,
        'all_friends':friends,
    }
    return render(request, 'chat/join_room.html', context)


@login_required
def room_choice(request, friend_id):
    friend = User.objects.filter(pk=friend_id)
    if not friend:
        messages.error(request, 'Invalid User ID')
        return redirect('room-enroll') 
    if not FriendList.objects.filter(user=request.user, friends=friend[0]):
        messages.error(request, 'You need to be friends to chat')
        return redirect('room-enroll') 

    room = Room.objects.filter(
        Q(author=request.user, friend=friend[0]) | Q(author=friend[0], friend=request.user)
    )
    if not room:
        create_room = Room(author=request.user, friend=friend[0])
        create_room.save()
        room = create_room.room_id
        return redirect('room', room, friend_id)

    return redirect('room', room[0].room_id, friend_id)


""" Chatroom between users """
@login_required
def room(request, room_name, friend_id):
    all_rooms = Room.objects.filter(room_id=room_name)
    if not all_rooms:  
        messages.error(request, 'Invalid Room ID')
        return redirect('room-enroll')

    chats = Chat.objects.filter(
        room_id=room_name
    ).order_by('date')

    context = {
        'old_chats':chats,
        'my_name':request.user,
        'friend_name':User.objects.get(pk=friend_id),
        'room_name': room_name
    }
    return render(request, 'chat/chatroom.html', context)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))