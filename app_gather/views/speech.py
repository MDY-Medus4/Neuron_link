from django.shortcuts import render, redirect, HttpResponse
import openpyxl
import pandas as pd

def read_xlsx(file_path, game_type='speech_word'):
    df = pd.read_excel(file_path)

    # 根据 id 合并数据到字典中
    merged_data = {}
    for index, row in df.iterrows():
        if game_type == 'speech_word':
            id_value = row['id']
            if id_value not in merged_data:
                merged_data[id_value] = []
            merged_data[id_value].append({
                'video': row['video'],
                'word' : row['word'],
                'type_word' : row['type'],
            })
        elif game_type == 'speech_picture':
            id_value = row['word']
            if id_value not in merged_data:
                merged_data[id_value] = {'Chinese': row['Chinese']}
                merged_data[id_value]['pictures'] = []
            merged_data[id_value]['pictures'].append({
                'id': row['id'],
                'picture': row['picture'],
            })
        #需要修改，按实际需求来
        elif game_type == 'speech_write':
            level_value = row['level']
            if level_value not in merged_data:
                merged_data[level_value] = []
            merged_data[level_value].append({
                'id': row['id'],
                'video': row['video'],
                'word' : row['word'],
                'Chinese': row['Chinese'],
            })

    return merged_data

# 选择界面，选择需要的语言训练
def speech_selection(request):
    return render(request, 'speech_select.html')

# 发音训练界面
def speech_word(request):
    session = request.GET.get('session')
    level = request.GET.get('level')
    time = request.GET.get('time')
    #speech_type = request.GET.get('type')
    game_type = 'speech_word'
    xlsx_file_path = 'app_gather/static/excel/' + game_type + '.xlsx'
    video_data = read_xlsx(xlsx_file_path, game_type)
    return render(request, 'speech_word.html',
                  {'session': session, 'level': level, 'time':time, 'mergedData': video_data})

# 字图匹配
def speech_picture(request):
    session = request.GET.get('session')
    level = request.GET.get('level')
    #speech_type = request.GET.get('type')
    game_type = 'speech_picture'
    xlsx_file_path = 'app_gather/static/excel/' + game_type + '.xlsx'
    picture_data = read_xlsx(xlsx_file_path, game_type)
    return render(request, 'speech_picture.html',
                  {'session': session, 'level': level, 'mergedData': picture_data})
    
# 笔划想象
def speech_write(request):
    session = request.GET.get('session')
    level = request.GET.get('level')
    #speech_type = request.GET.get('type')
    game_type = 'speech_write'
    xlsx_file_path = 'app_gather/static/excel/' + game_type + '.xlsx'
    write_data = read_xlsx(xlsx_file_path, game_type)
    return render(request, 'speech_write.html',
                  {'session': session, 'level': level, 'mergedData': write_data})
