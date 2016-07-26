import scripting_setup

# public API
setup = scripting_setup.setup

discover = lambda force=True: scripting_setup.script.discover(force)
get_item_by_name = lambda item_name: scripting_setup.script.get_item_by_name(item_name)
get_item_by_id = lambda item_id: scripting_setup.script.get_item_by_id(item_id)
sleep = lambda time: scripting_setup.script.sleep(time)
shutdown_broker = lambda: scripting_setup.script.shutdown_broker()
