import argparse
import os

parser = argparse.ArgumentParser()
parser.add_argument("-s", "--ssid", type=str)
parser.add_argument("-p", "--psk", type=str)

args = parser.parse_args()
ssid = args.ssid
psk = args.psk

try:
	f = open("/etc/wpa_supplicant/wpa_supplicant.conf", "w")
	f.write("country=DE"+"\n")
	f.write("ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev"+"\n")
	f.write("update_config=1"+"\n")
	f.write("network={"+"\n")
	f.write("  ssid=\""+ssid+"\""+"\n")
	f.write("  scan_ssid=1"+"\n")
	f.write("  psk=\""+psk+"\""+"\n")
	f.write("  key_mgmt=WPA-PSK"+"\n")
	f.write("}")
	f.close()
except Exception as e:
	print(e)
    
os.system("sudo reboot now")