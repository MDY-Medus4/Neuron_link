from django.shortcuts import render, redirect, HttpResponse
import openpyxl
import pandas as pd

def read_xlsx(file_path, game_type='speech_imagery'):
    """根据不同游戏类型读取 Excel 文件并返回合并的数据字典"""
    df = pd.read_excel(file_path)

    merged_data = {}

    for index, row in df.iterrows():
        # 处理“言语想象”模式的数据
        if game_type == 'speech_imagery':
            id_value = row['id']
            if id_value not in merged_data:
                merged_data[id_value] = []
            merged_data[id_value].append({
                'picture': row['picture'],
                'word': row.get('word', ''),  # 使用 .get 以防止 KeyError
                'hint': row.get('hint', '')   # 同上
            })

        # 处理“公开言语”模式的数据
        elif game_type == 'speech_public':
            id_value = row['word']  # 用 'word' 作为字典的键
            if id_value not in merged_data:
                merged_data[id_value] = {
                    'word': row['word'],
                    'Chinese': row['Chinese'],
                    'picture': row['picture'],
                    'pictures': []  # 初始化图片列表
                }
            merged_data[id_value]['pictures'].append({
                'picture': row['picture']
            })

    return merged_data

def setting(request):
    """选择界面，选择需要的语言训练"""
    return render(request, 'composite_setting.html')


def composite_paradigm(request):
    """言语想象 - 通过图片进行想象"""
    session = request.GET.get('session')
    level = request.GET.get('level')
    time = request.GET.get('time')

    game_type_1 = 'speech_imagery'
    xlsx_file_path = f'app_gather/static/excel/{game_type_1}.xlsx'
    imagery_data = read_xlsx(xlsx_file_path, game_type_1)

    game_type_2 = 'speech_public'
    xlsx_file_path = f'app_gather/static/excel/{game_type_2}.xlsx'
    public_data = read_xlsx(xlsx_file_path, game_type_2)


    all_data = {
        'speech_imagery': imagery_data,
        'speech_public': public_data
    }
    return render(request, 'composite_paradigm.html', {
        'session': session,
        'level': level,
        'time': time,
        'alldata': all_data
    })


