from django.shortcuts import render, redirect, HttpResponse
import openpyxl
import pandas as pd
def attention_game(request):
    session = request.GET.get('session')
    level = request.GET.get('level')
    map=request.GET.get("map")
    car=request.GET.get("car")
    return render(request,'attention_game.html',{'session':session,'level': level,'map':map,'car':car})

def select(request):
    return render(request,'attention_select.html')