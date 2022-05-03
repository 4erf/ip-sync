import threading
import requests
import socket 
import signal
import json
import time
import sys
import os

api_host = os.environ.get('HOST')
api_port = os.environ.get('PORT')

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

def send():
    data = { "ping": True }
    [_, _, _, _, address] = socket.getaddrinfo(api_host, api_port, socket.AF_INET, socket.SOCK_DGRAM).pop()
    message = json.dumps(data)
    sock.sendto(message.encode('ascii', message), address)

def publish_loop():
    while True:
        send_thread = threading.Thread(target=send) 
        send_thread.daemon = True
        send_thread.start()
        time.sleep(15 * 60)

def exit(a,b):
    sock.close()
    sys.exit(-1)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, exit)

    if api_host is None or api_port is None:
        print('Invalid Host or Port')
        sys.exit(-1)

    publish_thread = threading.Thread(target=publish_loop)
    publish_thread.daemon = True

    publish_thread.start()
    publish_thread.join()

