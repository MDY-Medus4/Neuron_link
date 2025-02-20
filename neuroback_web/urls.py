"""
URL configuration for neuroback_web project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect
from app_gather.views import index, motorImagery
from app_gather.views import zhou
from app_gather.views import attention
from app_gather.views import memory
from app_gather.views import speech
from app_gather.addons import vr
from app_gather.views import composite_paradigm

urlpatterns = [
    # redirect / to /index
    path("", lambda request: redirect("index/")),

    
    path("admin/", admin.site.urls),
    path("index/", index.index),

    # 患者校验模块
    path("index/login", index.login),
    path("index/logout", index.logout),

    # 游戏模块
    path("game/spatial/rotate", zhou.spatial),
    path("game/spatial/select", zhou.spatial_select),

    path("game/emotion/identify", zhou.emotion),
    path("game/emotion/select", zhou.emotion_select),

    path("game/attention/select",attention.select),
    path("game/attention/game",attention.attention_game),

    path("game/memory/select",memory.select),
    path("game/memory/memory_card",memory.memory_cardgame),
    path("game/memory/memory_road",memory.memory_findroad),

    path("game/speech/select",speech.speech_selection),
    path("game/speech/word",speech.speech_word),
    path("game/speech/picture",speech.speech_picture),
    path("game/speech/write",speech.speech_write),

    path("game/motor_imagery/setting",motorImagery.setting),
    path("game/motor_imagery/game",motorImagery.game),

    path("game/composite_paradigm/setting",composite_paradigm.setting),
    path("game/composite_paradigm/game",composite_paradigm.game),




    # 脑电帽连接模块
    path("eeg/connect", index.eegConnect),
    path("eeg/stop", index.eegStop),
    path("eeg/index/record", index.index_record),
    path("eeg/index/save", index.index_save),
    
    path("addons/vr_controller", vr.vr_controller),
    path("addons/vr_start", vr.vr_start),
]
