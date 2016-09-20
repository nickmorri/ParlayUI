from utils.native import getWidgetProperty, setWidgetProperty

class _widgetImpl(object):
    """
    The Implementation for a widget iteself
    """

    def __init__(self, widget_id):
        object.__setattr__(self, "_wid", widget_id)

    def __getattr__(self, name):
        if name.startswith("__"): return object.__getattr__(self, name)
        return getWidgetProperty(self._wid, name)

    def __setattr__(self, name, value):
        return setWidgetProperty(self._wid, name, value)

class _widgetDictImpl(object):
    """
    The Implementation for the widget dictionary
    """
    def __getitem__(self, key):
        return _widgetImpl(str(key))

widgets = _widgetDictImpl()
