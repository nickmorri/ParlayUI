"""
Define a base class for creating a client script
"""

import time

from native import ProxyItem, sendQuery

DEFAULT_ENGINE_WEBSOCKET_PORT = 8085

class TestItem:
    def say_hello(self):
        return "Hi!"

class ParlayScript():

    def __init__(self, item_id=None, name=None, _reactor=None, adapter=None):
        print "ParlayScript initialized!"

    def discover(self, force=True):
        # TODO: what to do with the result?
        # and what should the result be?
        sendQuery({"command":"discover", "force": force})

    def get_item_by_name(self, item_name):
        return ProxyItem(sendQuery({"command": "get_item", "key": "NAME", "value": item_name}))

    def get_item_by_id(self, item_id):
        return ProxyItem(sendQuery({"command": "get_item", "key": "ID", "value": item_id}))

    def sleep(self, secs):
        time.sleep(secs)

    def shutdown_broker(self):
        print "Pretending to shut down broker"

def start_script(script_class, engine_ip='localhost', engine_port=DEFAULT_ENGINE_WEBSOCKET_PORT,
                 stop_reactor_on_close=None, skip_checks=False, reactor=None):

    print "Starting script!"

