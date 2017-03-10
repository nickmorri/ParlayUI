from utils.native import getWidgetProperty, setWidgetProperty

class _widgetPropWrapper(object):
    """
    Wrapper for widget properties to ease scripting of multi depth properties
    """
    def __init__(self, prop_parent, key, value):
        object.__setattr__(self, "_parent", prop_parent)
        object.__setattr__(self, "_key", key)
        object.__setattr__(self, "_value", value)

    def __repr__(self):
        return self._value

    def __str__(self):
        return str(self._value)

    def __getitem__(self, key):
        if isinstance(self._value, dict) or isinstance(self._value, list):
            return _widgetPropWrapper(self, key, self._value[key])
        raise TypeError

    def __getattr__(self, name):
        if isinstance(self._value, dict):
            return _widgetPropWrapper(self, name, self._value[name])
        raise TypeError

    def __setattr__(self, name, value):
        self._value[name] = value
        self._parent.__setattr__(self._key, self._value)

    def __setitem__(self, key, value):
        if not( isinstance(self._value, dict) or isinstance(self._value, list)):
            raise TypeError
        self._value[key] = value
        self._parent.__setattr__(self._key, self._value)

class _widgetImpl(object):
    """
    The Implementation for a widget iteself
    """
    def __init__(self, widget_id):
        object.__setattr__(self, "_wid", widget_id)

    def __getattr__(self, name):
        if name.startswith("__"): return object.__getattr__(self, name)
        return _widgetPropWrapper(self, name, getWidgetProperty(self._wid, name))

    def __setattr__(self, name, value):
        return setWidgetProperty(self._wid, name, value)

class _widgetDictImpl(object):
    """
    The Implementation for the widget dictionary
    """
    def __getitem__(self, key):
        return _widgetImpl(str(key))

widgets = _widgetDictImpl()
