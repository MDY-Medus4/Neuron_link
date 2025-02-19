import os 
import json
import random

import pandas as pd
from django.shortcuts import render, redirect, HttpResponse
from django import forms
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from datetime import datetime
from app_gather.eeg import eeg_connect

data_to_save = []  # 保存标签和实验数据


class LoginForm(forms.Form):
    name = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)



def login(request):
    """登录"""
    if request.method == 'GET':
        form = LoginForm()
        return render(request, 'login.html', {'form': form})
    form = LoginForm(data=request.POST)
    if form.is_valid():
        # 数据校验
        print(form.cleaned_data['name'])
        print(form.cleaned_data['password'])
        if not form.cleaned_data['password'] == "51515":
            form.add_error('password', "管理员密码错误")
            return render(request, 'login.html', {'form': form})
        # 网站生成随机字符串；写到用户浏览器的cookie中；在写入到session中
        print("成功进入系统")
        request.session['info'] = {'name': form.cleaned_data['name']}
        return redirect('/index')

    else:
        return render(request, 'login.html', {'form': form})


def index(request):
    return render(request, 'index.html')


def logout(request):
    """注销"""
    request.session.clear()
    return redirect('index/login')


@csrf_exempt
@require_http_methods(["POST"])
# 脑电毛启动
def eegConnect(request):
    eeg_connect.main()
    if eeg_connect.save_data():
        return JsonResponse({"message": "脑电帽连接成功！！！！"})
    else:
        return JsonResponse({"message": "脑电帽连接失败！！！！"})


def eegStop(request):
    exp_name = request.GET.get('exp_name')
    participant_id = request.GET.get('participant_id')
    session_number = request.GET.get('session_number')
    date = datetime.now().strftime('%Y-%m-%d')
    file_name = f"{exp_name}_{date}_P{participant_id}_S{session_number}.csv"
    eeg_connect.stop_status(exp_name, file_name)
    return JsonResponse({"message": "功能已关闭", "data": file_name})


@csrf_exempt
@require_http_methods(["POST"])
def index_record(request):
    eeg_index = eeg_connect.save_data()
    #  数据校验
    if eeg_index:
        return JsonResponse({"eeg_index": eeg_index})
    else:
        rand = random.randint(-100, 0)
        return JsonResponse({"eeg_index": rand})



@csrf_exempt
@require_http_methods(["POST"])
def index_save(request):
    data = json.loads(request.body)
    mark = data.get('mark_save')
    df = pd.DataFrame(mark)

    participant_id = data.get('name')
    exp_name = data.get('exp_name')
    session_number = data.get('session')
    date = datetime.now().strftime('%Y-%m-%d')
    file_name = f"{exp_name}_{date}_P{participant_id}_S{session_number}.csv"
    
    if not os.path.exists('./raw_data/' + exp_name + '/mark'):
        os.makedirs('./raw_data/' + exp_name + '/mark')

    # print("mark", mark)
    df.to_csv('./raw_data/' + exp_name + '/mark/' + file_name, index=False)
    return redirect(f'/eeg/stop?exp_name={exp_name}&participant_id={participant_id}&session_number={session_number}')
    # return JsonResponse({"eeg_index": file_name})
