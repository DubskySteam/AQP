import sys
import os
import pandas as pd
import xarray as xr
import requests
import time
from datetime import datetime, timedelta

url_path = 'https://opendata.dwd.de/weather/satellite/radiation/'
folder_path = "/var/home/irradiance_germany/"
folder_path_tmp = folder_path + "tmp/"
folder_path_csv = folder_path + "data/"
downloaded_data_file = folder_path + "downloaded_data.txt"
sid_path = "sid/SIDin"
sis_path = "sis/SISin"

if not os.path.isdir(folder_path):
    print("Create Folder " + folder_path)
    os.makedirs(folder_path)
if not os.path.isdir(folder_path_tmp):
    print("Create Folder " + folder_path_tmp)
    os.makedirs(folder_path_tmp)
if not os.path.isdir(folder_path_csv):
    print("Create Folder " + folder_path_csv)
    os.makedirs(folder_path_csv)

def str_to_datetime(time):
    time = str(time)
    return datetime(int(time[:4]), int(time[4:6]), int(time[6:8]), int(time[8:10]), int(time[10:12]))

def datetime_to_str(time):
    year = str(time.year)
    month = str(time.month)
    if time.month < 10:
        month = "0" + month
    day = str(time.day)
    if time.day < 10:
        day = "0" + day
    hour = str(time.hour)
    if time.hour < 10:
        hour = "0" + hour
    minute = str(time.minute)
    if time.minute < 10:
        minute = "0" + minute
    return  year + month + day + hour + minute

def create_last_24():
    last = []
    time = datetime.now()
    for i in range(0,25):
        for j in range(0,50,15):
            time = time.replace(minute=j)
            last.append(datetime_to_str(time - timedelta(0, 0, 0, 0, 0, i)))
    return last

def download_data(elem):
    path = url_path + sid_path + elem + "DEv3.nc"
    r = requests.get(path, allow_redirects=True)
    if r.status_code == 404:
        return False
    file_path_sid = folder_path_tmp + elem + "_sid.nc"
    
    if os.path.isfile(file_path_sid):
        print("Sid File " + elem + " " + file_path_sid + " already there")
        return False
    with open(file_path_sid, "wb") as text_file:
        text_file.write(r.content)

    path = url_path + sis_path + elem + "DEv3.nc"
    r = requests.get(path, allow_redirects=True)
    if r.status_code == 404:
        return False
    file_path_sis = folder_path_tmp + elem + "_sis.nc"
    
    if os.path.isfile(file_path_sis):
        print("Sis File already there")
        return False
    with open(file_path_sis, "wb") as text_file:
        text_file.write(r.content)

    ds = xr.open_dataset(file_path_sis)
    df_sis = ds.to_dataframe()
    ds.close()
    dd = xr.open_dataset(file_path_sid)
    df_sid = dd.to_dataframe()
    dd.close()

    df_sis.loc[:, "SID"] = df_sid
    # df_sis.index = df_sis.index.set_levels([df_sis.index.levels[0],df_sis.index.levels[1], pd.to_datetime(df_sis.index.levels[2]).strftime('%Y-%m-%dT%H:%M:%S')])
    
    df_sis.to_csv(folder_path_csv + elem + ".csv")
    
    os.remove(file_path_sis)
    os.remove(file_path_sid)

    return True

def check_download_list(l): # check for old entries and remove them
    yesterday = datetime.now() - timedelta(1, 0, 0, 0, 0, 4) # Die Daten vor einem Tag und 4 Stunden sollten nicht mehr verfügbar sein
    
    for elem in l:
        if yesterday > str_to_datetime(elem):
            l.remove(elem)
            
    # die Datei mit bereits gedownloadeten Dateien kann bereinigt werden, um Platz zu sparen
    with open(downloaded_data_file, "r+") as f:
        d = f.readlines()
        f.seek(0)
        for i in d:
            if yesterday < str_to_datetime(i):
                f.write(i)
        f.truncate()
    
    # tmp Ordner leeren - manchmal bleiben Dateien hängen 
    if os.path.exists(folder_path_tmp):
        for file in os.listdir(folder_path_tmp):
            file_path = os.path.join(folder_path_tmp, file)
            try:
                if os.path.isfile(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(e)
        
    return l

download_list = create_last_24()
with open(downloaded_data_file, "a"): # create file if not existent
    pass
with open(downloaded_data_file, "r") as d_file: # check if already downloaded with file
    for line in d_file:
        for elem in download_list:
            if str(line.rstrip("\n")) == str(elem):
                download_list.remove(elem)
        
for elem in download_list:
    if download_data(elem):
        download_list.remove(elem)
        with open(downloaded_data_file, "a") as myfile:
            myfile.write(str(elem) + "\n")
    time.sleep(10)

while(True):
    if datetime.now().minute%15 == 0:
        check_download_list(download_list)
        new_time = datetime_to_str(datetime.now() - timedelta(0, 0, 0, 0, 0, 1))
        
        if not new_time in download_list:
            download_list.append(new_time)
            
        for elem in download_list:
            if download_data(elem):
                download_list.remove(elem)
                with open(downloaded_data_file, "a") as myfile:
                    myfile.write(str(elem) + "\n")
            time.sleep(5)
        
    time.sleep(50)