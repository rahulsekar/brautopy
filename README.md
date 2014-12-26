brautopy
========

BRowser webAUdio TO PYthon webserver

This sample application :
* Captures microphone input from a web browser (the webaudio API)
* Encodes audio stream with opus.js encoder
* Sends the stream to a python websocket server (tornado)
* Decodes the stream with python-opus & saves wav file on the server

Installation:

pip install -r requirements.txt

Start web server:

python server.py

In browser:

http://\<server-ip\>:8888
