"""
Define a base class for creating a client script
"""

import time

from native import ProxyItem, sendQuery

DEFAULT_ENGINE_WEBSOCKET_PORT = 58085

class ParlayScript():

    def __init__(self, item_id=None, name=None, _reactor=None, adapter=None):
        pass

    def discover(self, force=True):
        # TODO: what to do with the result?
        # and what should the result be?
        sendQuery({"command":"discover", "force": force})

    def get_item_by_name(self, item_name):
        response = sendQuery({"command": "get_item", "key": "NAME", "value": item_name})
        if response is None:
            raise TypeError("Could not find item " + str(item_name) + " in discovery")
        return ProxyItem(response)

    def get_item_by_id(self, item_id):
        response = sendQuery({"command": "get_item", "key": "ID", "value": item_id})
        if response is None:
            raise TypeError("Could not find item " + str(item_id) + " in discovery")
        return ProxyItem(response)

    def sleep(self, secs):
        time.sleep(secs)

    def shutdown_broker(self):
        print "Pretending to shut down Parlay Connect"

def start_script(script_class, engine_ip='localhost', engine_port=DEFAULT_ENGINE_WEBSOCKET_PORT,
                 stop_reactor_on_close=None, skip_checks=False, reactor=None):
    pass
