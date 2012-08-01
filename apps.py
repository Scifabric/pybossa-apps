#!/usr/bin/env python

import web
import pbclient

endpoint = 'http://pybossa.vis4.net'  # no trailing slash
pbclient.set('endpoint', endpoint)

urls = (
  '/', 'hello',
  '/([^\/]+)', 'app_index',
  '/([^\/]+)/newtask', 'app_newtask',
  '/([^\/]+)/task/(\d+)', 'app_task'
)

app = web.application(urls, globals())
render = web.template.render('templates/')

_pybossa_application_cache = {}


def _get_app_id(app_name):
    global _pybossa_application_cache
    if app_name in _pybossa_application_cache:
        return _pybossa_application_cache[app_name].id
    app = pbclient.find_app(short_name=app_name)
    _pybossa_application_cache[app_name] = app
    return app.id


class app_index:
    def GET(self, app_name):
        return render.app(endpoint, app_name)


class app_newtask:
    def GET(self, app_name):
        return render.newtask(endpoint, app_name, _get_app_id(app_name))


class app_task:
    def GET(self, app_name, task_id):
        return render.task(endpoint, app_name, task_id)


if __name__ == "__main__":
    app.run()
