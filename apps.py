#!/usr/bin/env python

import web

endpoint = 'http://pybossa.vis4.net'  # no trailing slash

urls = (
  '/', 'hello',
  '/([^\/]+)', 'app_index',
  '/([^\/]+)/newtask', 'app_newtask',
  '/([^\/]+)/task/(\d+)', 'app_task'
)

app = web.application(urls, globals())
render = web.template.render('templates/')


class app_index:
    def GET(self, app_name):
        return render.app(endpoint, app_name)


class app_newtask:
    def GET(self, app_name):
        return render.newtask(endpoint, app_name)


class app_task:
    def GET(self, app_name, task_id):
        return render.task(endpoint, app_name, task_id)


if __name__ == "__main__":
    app.run()
