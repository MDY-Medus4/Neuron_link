from django.utils.deprecation import MiddlewareMixin
from django.shortcuts import redirect, HttpResponse


class AuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # 如果是登录页面不用执行以下操作
        if request.path_info == '/index/login':
            return

        # 读取用户访问的session信息 读的到才通过
        info_dict = request.session.get('info')
        # 已登录
        if info_dict:
            return
        # 未登录 回到登陆页面
        return redirect('/index/login')

    def process_response(self, request, response):
        # print('M1 out')
        return response
