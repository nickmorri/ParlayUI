from parlay_script import ParlayScript, DEFAULT_ENGINE_WEBSOCKET_PORT
#import time
#import datetime
global script

# get the script name importing me so it can have an ID
script_name = "Mock Script Name"



script = None

class ThreadedParlayScript(ParlayScript):

    ready = False

    def _start_script(self):
        global script
        ThreadedParlayScript.ready = True
        script = self  # so everyone knows we're THE script
        # do nothing. This is just an appliance class that doesn't run anything
        pass

def start_reactor(ip, port):
    try:
        print "Starting the reactor!"
        print "DONE REACTING"
    except Exception as e:
        print e


def setup(ip='localhost', port=DEFAULT_ENGINE_WEBSOCKET_PORT, timeout=3):
    """
    Connect this script to the broker's websocket server.

    :param ip: ip address of the broker websocket server
    :param port: port of the broker websocket server
    :param timeout: try for this long to connect to broker before giving up
    :return: none
    """
    global script
    # **ON IMPORT** start the reactor in a separate thread
    if script is None:
        ThreadedParlayScript()._start_script()

def run_in_threaded_reactor(fn):
    """
    Decorator to run the decorated function in the threaded reactor.
    """
    print "Running in the threaded reactor."
