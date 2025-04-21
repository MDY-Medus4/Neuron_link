from django.shortcuts import render, redirect, HttpResponse
import openpyxl
import pandas as pd
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os

def read_xlsx(file_path, game_type='speech_imagery'):
    """根据不同游戏类型读取 Excel 文件并返回合并的数据字典"""
    if not os.path.exists(file_path):
        return {}
        
    df = pd.read_excel(file_path)
    merged_data = {}

    for index, row in df.iterrows():
        # 处理"言语想象"模式的数据
        if game_type == 'speech_imagery':
            id_value = row['id']
            if id_value not in merged_data:
                merged_data[id_value] = {
                    'id': id_value,
                    'Chinese': row.get('Chinese', ''),
                    'pictures': []
                }
            merged_data[id_value]['pictures'].append({
                'picture': row['picture'],
                'word': row.get('word', ''),
                'hint': row.get('hint', '')
            })

        # 处理"公开言语"模式的数据
        elif game_type == 'speech_public':
            id_value = row['word']
            if id_value not in merged_data:
                merged_data[id_value] = {
                    'word': row['word'],
                    'Chinese': row['Chinese'],
                    'pictures': []
                }
            merged_data[id_value]['pictures'].append({
                'picture': row['picture']
            })

    return merged_data

def setting(request):
    """选择界面，选择需要的语言训练"""
    return render(request, 'composite_setting.html')

def game(request):
    """复合言语任务 - 包含言语想象和公开言语两个阶段"""
    session = request.GET.get('session')
    level = request.GET.get('level')
    time = request.GET.get('time')

    # 读取两种模式的数据
    game_type_1 = 'speech_imagery'
    xlsx_file_path = f'app_gather/static/excel/{game_type_1}.xlsx'
    imagery_data = read_xlsx(xlsx_file_path, game_type_1)

    game_type_2 = 'speech_public'
    xlsx_file_path = f'app_gather/static/excel/{game_type_2}.xlsx'
    public_data = read_xlsx(xlsx_file_path, game_type_2)

    # 合并数据
    all_data = {
        'speech_imagery': imagery_data,
        'speech_public': public_data
    }

    return render(request, 'composite_paradigm_game.html', {
        'session': session,
        'level': level,
        'time': time,
        'alldata': json.dumps(all_data)
    })

@csrf_exempt
def save_data(request):
    """保存实验数据"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # 保存实验数据到数据库
            from app_gather.models import ExperimentData
            experiment_data = ExperimentData(
                name=data.get('name'),
                exp_name=data.get('exp_name'),
                session=data.get('session'),
                data=json.dumps(data.get('mark_save'))
            )
            experiment_data.save()
            
            # 保存脑电标记
            from app_gather.eeg.eeg_connect import stop_status
            stop_status(data.get('exp_name'), data.get('session') + '.csv')
            
            return JsonResponse({'status': 'success', 'message': '数据保存成功'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': '不支持的请求方法'}, status=405)


