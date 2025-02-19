@echo off
call conda activate neuron_link
cd /d %~dp0
python manage.py runserver
pause