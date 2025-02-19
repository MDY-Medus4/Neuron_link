from django.shortcuts import render, redirect, HttpResponse
import openpyxl
import pandas as pd


def read_xlsx(file_path, game_type='square'):
    df = pd.read_excel(file_path)

    # 根据 id 合并数据到字典中
    merged_data = {}
    for index, row in df.iterrows():
        id_value = row['id']
        if id_value not in merged_data:
            merged_data[id_value] = []
        if game_type == 'square':
            merged_data[id_value].append({
                'pic': row['pic'],
                'rotate_angle': row['rotate_angle'],
            })
        elif game_type == 'hands':
            merged_data[id_value].append({
                'pic': row['pic'],
                'type': row['type'],
                'rotate_angle': row['rotate_angle'],
            })
        elif game_type == 'face':
            merged_data[id_value].append({
                'pic': row['pic'],
                'type': row['type'],
            })
        else:
            merged_data[id_value].append({
                'id': id_value,
                'pic': row['pic'],
                'type': row['type'],
            })
    return merged_data


def spatial(request):
    session = request.GET.get('session')
    level = request.GET.get('level')
    game_type = request.GET.get('type')
    print(game_type, level, session)
    if game_type == 'square':
        xlsx_file_path = 'app_gather/static/excel/' + game_type + '.xlsx'
    else:
        xlsx_file_path = 'app_gather/static/excel/' + game_type + '-' + level + '.xlsx'
    image_data = read_xlsx(xlsx_file_path, game_type)

    return render(request, game_type+'_game.html',
                  {'mergedData': image_data, 'session': session,
                   'level': level, 'game_type': game_type})


def spatial_select(request):
    return render(request, 'para_select.html')


# 情绪-----------------------------
# 情绪选择
def emotion_select(request):
    return render(request, 'emo_select.html')


# 对应情绪游戏
def emotion(request):
    session = request.GET.get('session')
    level = request.GET.get('level')
    game_type = request.GET.get('type')
    print(game_type, level, session)
    xlsx_file_path = 'app_gather/static/excel/' + game_type + '.xlsx'
    image_data = read_xlsx(xlsx_file_path, game_type)

    return render(request, game_type+'_game.html',
                  {'mergedData': image_data, 'session': session,
                   'level': level, 'game_type': game_type})


