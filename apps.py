#!/usr/bin/env python

import web
import json
import pbclient
import requests
import settings

web.config.debug = settings.DEBUG

pbclient.set('endpoint', settings.ENDPOINT)

urls = (
  '/', 'app_overview',
  '/api/(.+)', 'api',
  '/([^\/]+)/?', 'app_index',
  '/([^\/]+)/newtask', 'app_newtask',
  '/([^\/]+)/progress', 'app_progress',
  '/([^\/]+)/progress/data', 'app_progress_data',
  '/([^\/]+)/task/(\d+)', 'app_task'
)

app = web.application(urls, globals())
render = web.template.render('templates/')

_pybossa_application_cache = {}


def _get_app(app_name):
    global _pybossa_application_cache
    if app_name in _pybossa_application_cache:
        return _pybossa_application_cache[app_name]
    app = pbclient.find_app(short_name=app_name)[0]
    _pybossa_application_cache[app_name] = app
    return app


class app_overview:
    def GET(self):
        return render.index(settings.ENDPOINT)


class app_index:
    def GET(self, app_name):
        return render.app(settings.ENDPOINT, app_name)


class app_newtask:
    def GET(self, app_name):
        return render.newtask(settings.ENDPOINT, app_name, _get_app(app_name).id)


class app_task:
    def GET(self, app_name, task_id):
        return render.task(settings.ENDPOINT, app_name, task_id)


class app_progress:
    def GET(self, app_name):
        app = _get_app(app_name)
        return render.progress(settings.ENDPOINT, app_name, app.name)


class app_progress_data:
    def GET(self, app_name):
        app = _get_app(app_name)
        taskruns = pbclient.get_taskruns(app.id, limit=3000)
        taskruns_by_id = {}
        self.sdsd = ''

        for taskrun in taskruns:
            if taskrun.task_id not in taskruns_by_id:
                taskruns_by_id[taskrun.task_id] = 0
            taskruns_by_id[taskrun.task_id] += 1
        tasks = pbclient.get_tasks(app.id, limit=1000)
        task_status = {}
        taskruns_needed = 0
        taskruns_finished = 0
        for task in tasks:
            num_taskruns = 0
            if task.id in taskruns_by_id:
                num_taskruns = taskruns_by_id[task.id]
            task_status[task.id] = (num_taskruns, task.info['n_answers'])
            taskruns_needed += task.info['n_answers']
            taskruns_finished += min(task.info['n_answers'], num_taskruns)
        result = {
            'num_tasks': len(tasks),
            'task_status': task_status,
            'taskruns_needed': taskruns_needed,
            'taskruns_finished': taskruns_finished
        }
        return json.dumps(result)


class api:
    """ Cross-domain proxy to forward authenticated requests """
    def GET(self, url):
        data = web.input()
        params = dict()
        for k in data:
            params[k] = data[k]
        cookies = web.cookies()
        r = requests.get(settings.ENDPOINT + '/api/' + url, cookies=cookies, params=params)
        if r.status_code == 200:
            return r.text
        else:
            return 'Error: ' + str(r.status_code)

    def POST(self, url):
        data = web.data()
        cookies = web.cookies()
        if 'remember_token' in cookies:
            headers = {'content-type': 'application/json'}
            r = requests.post(settings.ENDPOINT + '/api/' + url, cookies=cookies, data=data, headers=headers)
            if r.status_code == 200:
                return r.text
            else:
                app.internalerror()
        else:
            app.internalerror()


if __name__ == "__main__":
    app.run()
