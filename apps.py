#!/usr/bin/env python

import web

endpoint = 'http://pybossa.vis4.net/'

urls = (
  '/', 'hello',
  '/([^\/]+)', 'app_index',
  '/([^\/]+)/newtask', 'app_newtask',
  '/([^\/]+)/task/(\d+)', 'app_task'
)

app = web.application(urls, globals())
render = web.template.render('templates/')

req_count = 0


class hello:
    def GET(self):
        global req_count
        req_count += 1
        return 'Hello, offeneparteien! %d' % req_count


class app_index:
    def GET(self, app_name):
        global endpoint
        return render.app(endpoint, app_name)


class app_task:
    def GET(self, app_name, task_id):
        return 'solve task ' + str(task_id) + ' of ' + app_name


class app_newtask:
    def GET(self, app_name):
        return 'redirect to new task in ' + app_name




if __name__ == "__main__":
#    web.wsgi.runwsgi = lambda func, addr = None: web.wsgi.runfcgi(func, addr) 
    app.run()
