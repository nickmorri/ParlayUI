-----------------
Global Script API
-----------------

These items are exposed at the top level of each worker. 
They are available for use within native JavaScript Skulpt modules.

- `print`: A single-argument JavaScript function that implements Python `print`.

- `onResponse`: The response handler called by the worker when the main application sends a response.
    A method that performs synchronous communication with the server should set this variable before sending a message.
    Its most typical use is as a continuation, running the rest of the script once a response is received.

- `newListenerID`: A function that generates worker listener IDs. 
    These IDs are unique within a given worker and are used to keep track of asynchronous listeners.

- `listeners`: A JavaScript Map from listener IDs to listeners. 
    When the worker recevies an asynchronous message, it calls the listener with the ID specified by the message.
    

----------------------
Module `parlay.native`
----------------------

This module exposes the core of the Parlay item system to Skulpt scripts. 
It also provides a few lower-level functions for interacting with the main application.

- `sendMessage`: Sends a one-way message to the main application. 
    This function sends a message to the main application asynchronously and returns.
    It does not expect a response.

- `sendQuery`: Synchronously communicates with the main application.
    Sends some query to the main application, such as requesting an item or performing a command,
    and waits for the response.

- `ProxyItem`: A class for proxy objects that represent Parlay items.
    These items' commands, properties and datastreams may be accessed as fields.
    - `send_parlay_command`: Asynchronously requests execution of a remote Parlay command.
        This method's semantics match those of server-side Parlay scripts.
        
- `ProxyDatastream`: A class for proxy objects that represent Parlay datastreams.
    Its API mirrors the server script datastream API.
    - `get`: Syncronously retrieves the last value recorded for this datastream, if any.
    
    - `wait_for_value`: Synchronously retrieves the last value from this datastream and waits if the is none.
    
    - `attach_listener`: Attaches a Python function as a listener to this datastream.
        The supplied function will be called whenever the value of the datastream is updated.
        The listener will be removed when the supplied function returns `true`.

- `ProxyCommand`: A class for proxy objects that represent Parlay commands. 
    The return result of `ProxyItem.send_parlay_command` is a `ProxyCommand`.