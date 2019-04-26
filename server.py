import os
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.websocket
import wave
import uuid
import gc
from opus.decoder import Decoder as OpusDecoder

class OpusDecoderWS(tornado.websocket.WebSocketHandler):
    
    def open(self):

        print('new connection')
        self.initialized = False

    def my_init(self, msg) :

        print(msg)
        rate, is_encoded, op_rate, op_frm_dur = [int(i) for i in msg.split(',')]
        #rate : actual sampling rate
        #op_rate : the rate we told opus encoder
        #op_frm_dur : opus frame duration

        filename = str(uuid.uuid4()) + '.wav'

        wave_write = wave.open(filename, 'wb')
        wave_write.setnchannels(1)
        wave_write.setsampwidth(2) #int16, even when not encoded
        wave_write.setframerate(rate)

        if self.initialized :
            self.wave_write.close()

        self.is_encoded = is_encoded
        self.decoder = OpusDecoder(op_rate, 1)
        self.frame_size = op_frm_dur * op_rate
        self.wave_write = wave_write
        self.initialized = True

    def on_message(self, data) :

        if str(data).startswith('m:') :
            self.my_init(str(data[2:]))
        else :
            if self.is_encoded :
                pcm = self.decoder.decode(data, self.frame_size, False)
                self.wave_write.writeframes(pcm)

                # force garbage collector
                # default rate of cleaning is not sufficient
                gc.collect()

            else :
                self.wave_write.writeframes(data)

    def on_close(self):

        if self.initialized :
            self.wave_write.close()

        print('connection closed')

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("www/index.html")

app = tornado.web.Application([
    (r'/ws', OpusDecoderWS),
    (r'/', MainHandler),
    (r'/(.*)', tornado.web.StaticFileHandler, { 'path' : './www' })
])

http_server = tornado.httpserver.HTTPServer(app)
http_server.listen(int(os.environ.get('PORT', 8888)))
print('http server started')
tornado.ioloop.IOLoop.instance().start()
