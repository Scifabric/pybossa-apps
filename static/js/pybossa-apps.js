
(function(global, $) {

    function _endpoint() {
        if ($.cookie('remember_token')) {
            return '';  // use cross-domain proxy for signed requests
        } else {
            return global.endpoint;  // access api directly for guest requests
        }
    }

    function _load_app(callback) {
        $.ajax({
            url: _endpoint() + '/api/app?short_name=' + global.app_name,
            dataType: 'json',
            success: function(data) {
                callback(data[0]);
            }
        });
    }

    function _load_apps(callback) {
        $.ajax({
            url: _endpoint() + '/api/app',
            dataType: 'json',
            success: function(data) {
                callback(data);
            }
        });
    }

    function _load_task(id, callback) {
        $.ajax({
            url: _endpoint() + '/api/task/' + id,
            dataType: 'json',
            success: function(data) {
                callback(data);
            }
        });
    }

    function _solve_task(id, answer, callback) {
        _load_task(id, function(task) {
            var data = {
                app_id: task.app_id,
                task_id: task.id,
                info: answer
            };
            $.ajax({
                url: _endpoint() + '/api/taskrun',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function(data) {
                    callback(data);
                },
                error: function(a,b,c) {
                    console.warn('req error', a,b,c);
                }
            });
        });
    }

    function _load_next_task(callback) {
        $.ajax({
            url: _endpoint() + '/api/app/' + global.app_id + '/newtask',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                console.log(data);
                callback(data);
            }
        });
    }

    function _set_footer(app) {
        if (app.info.footer) {
            $('body').append('<div class="container footer"><div class="row">'+
                '<div class="span12 content"><span>'+app.info.footer+'</span></div>'+
                '</div></div>');
        }
    }

    function _load_progress(callback) {
        $.ajax({
            url: '/'+global.app_name+'/progress/data',
            dataType: 'json',
            success: function(data) {
                callback(data);
            }
        });
    }

    function _get_current_task_id(url) {
        var pathArray = url.split('/');
        if (url.indexOf('/task/')!=-1) {
            var l = pathArray.length;
            var i = 0;
            for (i=0;i<l;i++) {
                if (pathArray[i]=='task') {
                    return pathArray[i+1];
                }
            }
        }
        return false;
     }


    /*
     * entry points
     */

    global._views = {

        index: function() {
            _load_apps(function(apps) {
                $.each(apps, function(i, app) {
                    var li = $('<li><a href="/'+app.short_name+'">'+app.name+'</a><br />'+app.description+'</li>');
                    li.hide();
                    setTimeout(function() { li.fadeIn(500); }, i*300);
                    $('.apps ul').append(li);
                });
                $('.loading').hide();
                $('.apps').show();
            });
        },

        app: function() {
            _load_app(function(app) {
                $('.loading').hide();
                $('.container').show();

                $('.app-name').html(app.name);
                $('.app-description').html(app.description);
                $('.app-long-description').html(app.long_description);
                $('.solve-tasks').attr('href', '/'+global.app_name+'/newtask');
                $('.solve-tasks').html(app.info && app.info.engage_text ? app.info.engage_text : 'Do some Tasks!');
                $('.see-progress span').html(app.info && app.info.progress_text ? app.info.progress_text : 'See current progress');

                _set_footer(app);

                if ($.cookie('remember_token')) {
                    $('a.login').attr('href', global.endpoint+'/account/signout?next='+location.href);
                    $('a.login span').html(app.info && app.info.logout_text ? app.info.logout_text : 'Sign Out');
                } else {
                    $('a.login').attr('href', global.endpoint+'/account/signin?next='+location.href);
                    $('a.login span').html(app.info && app.info.login_text ? app.info.login_text : 'Sign In');
                }

                document.title = app.name;
            });
        },

        progress: function() {

            $('.container').show();

            function __ease(f) {
                if (f === 0) return 0;
                f = 1 - f * 2;
                return (Math.acos(f*0.5 + Math.pow(f, 3)*0.5 )/ Math.PI);
            }

            _load_progress(function(data) {
                $('.loading').fadeOut(300);
                var progress = data.taskruns_finished / data.taskruns_needed;
                if (progress > 0.8) $('.progress').addClass('progress-success');
                if (progress < 0.2) $('.progress').addClass('progress-warning');

                setTimeout(function() {
                    $('.progress .bar').width((100 * progress) +'%');
                }, 700);
                $('.progress .bar').html('<span style="display:none">'+Math.round(100*progress) + '%</span>');
                setTimeout(function() {
                    $('.progress .bar span').fadeIn(1000);
                }, 1500);

                setTimeout(function() {
                    var t = 10, vel = 100, acc = 0.96, i = 0, dur = 3000;
                    $.each(data.task_status, function(key, status) {
                        var badge = $('<span class="badge"><a href="/'+global.app_name+'/task/'+key+'">'+ status[0] +'</a></span>');
                        if (status[0] >= status[1]) {
                            badge.addClass('badge-success');
                            badge.data('progress', 1);
                        } else {
                            if (status[0] > 0) badge.addClass('badge-warning');
                            badge.data('progress', status[0] / status[1]);
                        }

                        $('.app-progress').append(badge);
                        badge.after(" ");
                        badge.css({ opacity: 0 });

                        t = __ease(i / data.num_tasks) * dur;
                        i += 1;
                        setTimeout(function() {
                           badge.css({ opacity: Math.max(0.3, badge.data('progress')) });
                        }, t);
                    });
                }, 1500);
            });
        },

        newtask: function() {
            _load_next_task(function(task) {
                if ( !$.isEmptyObject(task) ) {
                    window.location.pathname = '/'+global.app_name+'/task/' + task.id;
                } else {
                    $("#finish").fadeIn();
                }
            });
        },

        task: function() {
            // at first we load the task presenter
            _load_app(function(app) {
                $('#task-presenter').html(app.info.task_presenter);
                $('.loading').hide();

                global.app_id = app.id;

                _set_footer(app);

                // then we load load the task_id
                _load_task(global.task_id, function(task) {
                    taskLoaded(task.info);
                });
            });
        }

    };

    /*
     * bootstrap
     */

    $(function() {

        if ($.isFunction(global._views[global.view])) {
            global._views[global.view]();
        } else {
            console.warn('unknown view:', global.view);
        }
    });

    /* public api */
    global.saveTask = function(answer, callback) {
        var task_id = _get_current_task_id(window.location.pathname);
        if (task_id) {
            _solve_task(task_id, answer, callback);
        } else {
            throw 'Cannot find task id';
        }
    };

    global.nextTask = function(callback) {
        global._views.newtask();
    };

} ( window.PyBossaApp, jQuery ));