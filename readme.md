# PyBossa Apps

Light-weight framework for developing PyBossa apps outside of PyBossa.


## Setup

PyBossa Apps is a Python-based web application that uses the [web.py](http://webpy.org) framework.

```sh
> git clone https://github.com/pybossa/pybossa-apps.git
> cd pybossa-apps
```

Copy the ``default_settings.py`` to ``settings.py`` and edit it to set the url of your PyBossa instance.

```sh
> cp default_settings.py settings.py
```

Run PyBossa Apps locally to test installation:

```sh
> python apps.py
http://0.0.0.0:8080/
```

## Setup with Authentication

If you want to use PyBossa Apps with user authentication you need to deploy it on a sub-domain of your PyBossa instance. To make the PyBossa session cookies accessible from subdomains you need to add the following to the ``settings_local.py`` of **your PyBossa instance** (and not PyBossa Apps). Replace example.com with your domain and don't forget the leading dot.

```Python
# allow subdomains to access the auth cookie
REMEMBER_COOKIE_DOMAIN = '.example.com'
SESSION_COOKIE_DOMAIN = '.example.com'
```
