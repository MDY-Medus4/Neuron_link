from django.shortcuts import render, redirect, HttpResponse

def setting(request):
    return render(request, 'motor_setting.html')

def game(request):
    gameType = request.GET.get('type')
    session = request.GET.get('session')
    #level = request.GET.get('level')
    #game_type = request.GET.get('type')
   # print(game_type, level, session)
    # if game_type == 'square':
    #     xlsx_file_path = 'app_gather/static/excel/' + game_type + '.xlsx'
    # else:
    #     xlsx_file_path = 'app_gather/static/excel/' + game_type + '-' + level + '.xlsx'
    # image_data = read_xlsx(xlsx_file_path, game_type)
    if gameType == 'hand':
        return render(request, 'motor_game_hand.html',
                    {'session': session})
    elif gameType == 'upper_limbs':
        return render(request, 'motor_game_upper_limbs.html',
                    {'session': session})
    elif gameType == 'lower_limbs':
        return render(request, 'motor_game_lower_limbs.html',
                    {'session': session})