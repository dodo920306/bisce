from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User

from .serializers import NoteSerializer
from base.models import Note

import subprocess
from subprocess import Popen
import json
import os
from dotenv import load_dotenv, dotenv_values

from pathlib import Path

DIR = Path(__file__).resolve().parent.parent.parent.parent


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username # encrypted
        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['GET', 'POST'])
def getSignup(request):
    if request.method == "POST":
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        un = body['username']
        pwd = body['password']
        mail = body['email']
        org = mail.removesuffix('@gmail.com')
        try:
            user = User.objects.create_user(username=un, password=pwd, email=mail)
            output = subprocess.run([str(DIR) + '/blockchain/signUp.sh', str(org), str(un)], capture_output=True)
            print(output)
            return JsonResponse({"un": un, "pwd": pwd, "status": "success"})
        except:
            return JsonResponse({"un": un, "pwd": pwd, "status": "failed"})
    else:
        return HttpResponse('sign up')


@api_view(['GET'])
def getEmail(request):
    return JsonResponse({"email": request.user.email})


@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/notes',
        '/api/token',
        '/api/token/refresh',
        '/api/query',
        '/api/tx',
        '/api/signup',
        '/api/email',
    ]
    return Response(routes)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getNotes(request):
    user = request.user
    notes = user.note_set.all()
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def index(request):
    un = request.user.username
    mail = request.user.email
    org = mail.removesuffix('@gmail.com')
    cmd = 'sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/' + un + '/msp $(sudo docker ps --filter "name=^peer0.*" --format "{{.Names}}") /etc/hyperledger/application/token_erc_20 ' + request.GET.get('cmd')
    res = subprocess.run(cmd, capture_output=True, shell=True)
    output = res.stdout.decode().split("***")
    transaction, result = output[0].strip("-> ").rsplit(".", 1)[0], ""
    action = ""
    if (res.stderr.decode() != ""):
        result = "Failed."
    if (len(output) > 1):
        result = output[1].strip().replace("Result: ", "")
    if (len(transaction.split(" ")) > 2):
        action = transaction.split(" ")[0].strip()
        transaction = transaction.split(" ")[2]
    return JsonResponse({"user": un, "action": action, "transaction": transaction, "result": result, 'error_msg': res.stderr.decode()})


@api_view(['GET'])
def getTx(request):
    un = request.user.username
    mail = request.user.email
    org = mail.removesuffix('@gmail.com')
    cmd = 'sudo docker exec $(sudo docker ps --filter "name=^peer0.*" --format "{{.Names}}") /etc/hyperledger/fetchBlock/fetchBlock.sh'
    res = subprocess.run(cmd, capture_output=True, shell=True)
    cmd = 'sudo docker exec $(sudo docker ps --filter "name=^peer0.*" --format "{{.Names}}") /etc/hyperledger/fetchTx/fetchTx'
    res = subprocess.run(cmd, capture_output=True, shell=True)
    resFormatString = res.stdout.decode().split("\n")[:-1]
    for i in range(0, len(resFormatString)):
        resFormatString[i] = json.loads(resFormatString[i])
        resFormatString[i]['Payload'] = json.loads(resFormatString[i]['Payload'])
    return JsonResponse({"output": resFormatString})
