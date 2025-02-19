from django.shortcuts import render, redirect, HttpResponse
import openpyxl
import pandas as pd
def memory_cardgame(request):
    session = request.GET.get('session')
    level = request.GET.get('level')
    game_type = request.GET.get('type')
    print(game_type, level, session)
    # xlsx_file_path = 'app_gather/static/excel/' + game_type + '.xlsx'
    # image_data = read_xlsx(xlsx_file_path, game_type)
    return render(request, game_type+'.html',
                  { 'session': session,'level': level, 'game_type': game_type})

def memory_findroad(request):
    session = request.GET.get('session')
    level = request.GET.get('level')
    game_type = request.GET.get('type')
    return render(request, game_type+'.html',
                  { 'session': session,'level': level, 'game_type': game_type})


def select(request):
    return render(request,'memory_select.html')