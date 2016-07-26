"""
Define a base class for creating a client script
"""

import time

DEFAULT_ENGINE_WEBSOCKET_PORT = 8085

class TestItem:
    def say_hello(self):
        return "Hi!"

class ParlayScript():

    def __init__(self, item_id=None, name=None, _reactor=None, adapter=None):
        print "ParlayScript initialized!"

    def discover(self, force=True):
        print "Pretending to discover"

    def get_item_by_name(self, item_name):
        print ("Pretending to get item: " + item_name)
        return TestItem()

    def get_item_by_id(self, item_id):
        print ("Pretending to get item: " + item_id)
        return TestItem()

    def sleep(self, secs):
        time.sleep(secs)

    def shutdown_broker(self):
        print "Pretending to shut down broker"

def start_script(script_class, engine_ip='localhost', engine_port=DEFAULT_ENGINE_WEBSOCKET_PORT,
                 stop_reactor_on_close=None, skip_checks=False, reactor=None):

    print "Starting script!"

