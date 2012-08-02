
(function(global, $) {

    function _load_app(callback) {
        $.ajax({
            url: global.endpoint + '/api/app?short_name=' + global.app_name,
            dataType: 'json',
            success: function(data) {
                callback(data[0]);
            }
        });
    }

    function _load_task(id, callback) {
        $.ajax({
            url: global.endpoint + '/api/task/' + id,
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
                url: global.endpoint + '/api/taskrun',
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
            url: global.endpoint + '/api/app/' + global.app_id + '/newtask',
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

    function app() {
        _load_app(function(app) {
            $('.loading').hide();
            $('.container').show();

            $('.app-name').html(app.name);
            $('.app-description').html(app.description);
            $('.app-long-description').html(app.long_description);
            $('.solve-tasks').attr('href', '/'+global.app_name+'/newtask');
            $('.solve-tasks').html(app.info && app.info.engage_text ? app.info.engage_text : 'Do some Tasks!');

            _set_footer(app);

            if ($.cookie('remember_token')) {
                $('a.login').attr('href', global.endpoint+'/account/signout?next='+location.href);
                $('a.login').html(app.info && app.info.logout_text ? app.info.logout_text : 'Sign Out');
            } else {
                $('a.login').attr('href', global.endpoint+'/account/signin?next='+location.href);
                $('a.login').html(app.info && app.info.login_text ? app.info.login_text : 'Sign In');
            }
        });
    }

    function newtask() {
        _load_next_task(function(task) {
            if ( !$.isEmptyObject(task) ) {
                window.location.pathname = '/'+global.app_name+'/task/' + task.id;
            } else {
                $("#finish").fadeIn();
            }
        });
    }

    function task() {
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

    $(function() {
        if (global.view == 'app') app();
        else if (global.view == 'newtask') newtask();
        else if (global.view == 'task') task();
    });

    /* public api */
    global.saveTask = function(task_id, answer, callback) {
        _solve_task(task_id, answer, callback);
    };

    global.nextTask = function(callback) {
        newtask();
    };

} ( window.PyBossaApp, jQuery ));