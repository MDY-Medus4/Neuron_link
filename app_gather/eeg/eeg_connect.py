import os  # handy system and path functions
import sys  # to get file system encoding
import time
import threading
from app_gather.eeg.neuracle_lib.dataServer import DataServerThread
import numpy as np


def init(div, time_buffer=3):
    # 配置设备
    neuracle_32 = dict(device_name='Neuracle', hostname='127.0.0.1', port=8712,
    				srate=1000, chanlocs=['Fp1', 'Fp2', 'F8',  't8', 'P8', 'O2', 'Oz', 'P7', 'CP5', 'T7', 'F7', 'FC2', 'F4' 'FC6', 'CP6', 'PO6',
                           'PO4', 'POZ', 'PO3', 'P3', 'C3', 'CZ', 'C4', 'P4', 'CP2', 'CP1', 'O1', 'PO5', 'Pz', 'F3', 'FC5', 'FC1'], n_chan=32)
    neuracle_64 = dict(device_name='Neuracle', hostname='127.0.0.1', port=8712,
                    srate=1000, chanlocs=[
            'Fpz', 'Fp1', 'Fp2', 'AF3', 'AF4', 'AF7', 'AF8', 'Fz', 'F1', 'F2',
            'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'FCz', 'FC1', 'FC2', 'FC3', 'FC4',
            'FC5', 'FC6', 'FT7', 'FT8', 'Cz', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
            'T7', 'T8', 'CP1', 'CP2', 'CP3', 'CP4', 'CP5', 'CP6', 'TP7', 'TP8',
            'Pz', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'POz', 'PO3', 'PO4', 'PO5',
            'PO6', 'PO7', 'PO8', 'OZ', 'O1', 'O2', 'ECG', 'HEOR', 'HEOL', 
            'VEOU', 'VEOL'], n_chan=64)
    dsi = dict(device_name='DSI', hostname='127.0.0.1', port=8844,
               srate=300,
               chanlocs=['P3', 'C3', 'F3', 'Fz', 'F4', 'C4', 'P4', 'Cz', 'CM', 'A1', 'Fp1', 'Fp2', 'T3', 'T5', '01',
                         'O2', 'X3', 'X2', 'F7', 'F8', 'X1', 'A2', 'T6', 'T4', 'TRG'], n_chan=25)
    neuroscan = dict(device_name='Neuracle', hostname='127.0.0.1', port=8712,
                     srate=1000,
                     chanlocs=['Fp1', 'Fp2', 'F8', 't8', 'P8', 'O2', 'Oz', 'P7', 'CP5', 'T7', 'F7', 'FC2', 'F4' 'FC6',
                               'CP6', 'PO6',
                               'PO4', 'POZ', 'PO3', 'P3', 'C3', 'CZ', 'C4', 'P4', 'CP2', 'CP1', 'O1', 'PO5', 'Pz', 'F3',
                               'FC5', 'FC1'], n_chan=64)
    emg8 = dict(device_name='Emg8', hostname='127.0.0.1', port=8713,
                srate=1000, chanlocs=['S01', 'S02', 'S03', 'SO4', 'SO5', 'SO6', 'S07', 'S08', 'trigger'], n_chan=9)

    # dsi是脑电设备
    device = [neuracle_32,neuracle_64,dsi, neuroscan, emg8]
    if div == "eeg":
        devicenum = input_type  # 脑电
    elif div == "emg":
        devicenum = 3  # 肌电

    target_device = device[devicenum]
    # 初始化 DataServerThread 线程
    thread_data_server = DataServerThread(device=target_device['device_name'], n_chan=target_device['n_chan'],
                                          srate=target_device['srate'], t_buffer=time_buffer)
    # 建立TCP/IP连接
    notconnect = thread_data_server.connect(hostname=target_device['hostname'], port=target_device['port'])
    if notconnect:
        raise TypeError("Plz open the hostport,can't connect recorder")
    else:
        # 启动线程
        thread_data_server.Daemon = True
        thread_data_server.start()
        print('Data server connected')
    # 阻塞3秒，保证脑电帽正常记录
    # time.sleep(3)

    return thread_data_server

buffer_exist = 0
def rec_data(div: str):
    
    global eeg_data,  run_flag, record_flag, buffer_exist
    record_flag = True
    # print("--------------------enter------------------")

    data_server = init(div)
    fq = sfq if div == 'eeg' else sfq
    data = eeg_data
    cnt = 0
    while run_flag:
        
        nUpdate = data_server.GetDataLenCount()
        # print("nUpdate:%d\n",nUpdate )
        buffer_exist = nUpdate
        if nUpdate > (1 * fq - 1):
            buffer_exist = 0
            # print("开始记录")
            tmp_data = data_server.GetBufferData()[:, -nUpdate:]
            # tmp = data_server.GetBufferData()
            # cnt = cnt + 1
            # if(cnt==1):
            # 	np.savetxt('./1.csv', tmp, delimiter=',')
            # 	np.savetxt('./1_1.csv', tmp_data, delimiter=',')
            # elif(cnt==2):
            # 	np.savetxt('./2.csv', tmp, delimiter=',')
            # 	np.savetxt('./2_1.csv', tmp_data, delimiter=',')
            # print(tmp)
            # print(tmp_data.shape)
            data_server.ResetDataLenCount()
            if record_flag and div == 'eeg':
                eeg_data = np.hstack([eeg_data, tmp_data])
                print(eeg_data.shape)
        time.sleep(0.2)
    print("stop!!!!!!!")
    eeg_data = np.empty((channel, 0))
    buffer_exist = 0
    data_server.stop()

global p_eeg
p_eeg = None
# 脑电帽启动开关
run_flag = True
record_flag = False
channel = 65
# eeg_data = np.empty((33, 0))
eeg_data = np.empty((channel, 0))
input_type = 1
sfq = 1000
fore_index = './raw_data/'


def stop_status(exp_name, file_name):
    global run_flag, eeg_data, buffer_exist, channel

    # Setting the run flag to False to stop further data processing
    run_flag = False

    # Saving the EEG data to a file
    print("当前工作目录为：" + os.getcwd())
    if eeg_data.size > 0:  # Check if eeg_data is not empty
        np.savetxt(fore_index + exp_name + '/eeg/' + file_name, eeg_data, delimiter=',')


def save_data():
    global eeg_data, buffer_exist
    return eeg_data.shape[1]+buffer_exist


def set_fore():
    global fore_index
    fore_index = './raw_data/'


def main():
    # 脑电帽 启动！
    global p_eeg, run_flag
    if not p_eeg or not p_eeg.is_alive():
        run_flag = True
        p_eeg = threading.Thread(target=rec_data, args=('eeg',))
        p_eeg.start()
        time.sleep(3)
