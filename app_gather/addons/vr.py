import os
import socket

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

VRPORT = 1234
SOFTWAREPATH = r"D:\RayJin\Downloads\people\Myproject.exe"

@require_http_methods(["GET"])
def vr_start(request):
    os.system(SOFTWAREPATH)
    return JsonResponse({"message": "success"})
    

@require_http_methods(["POST"])
def vr_controller(request):
    client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    message = request.body
    client.sendto(message, ('localhost', VRPORT))

    return JsonResponse({"message": "success"})
