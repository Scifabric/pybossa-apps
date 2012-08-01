
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

    function app() {
        _load_app(function(app) {
            $('.loading').hide();
            $('.container').show();

            $('.app-name').html(app.name);
            $('.app-description').html(app.description);
            $('.app-long-description').html(app.long_description);
            $('.solve-tasks').attr('href', '/'+global.app_name+'/newtask');
            $('.solve-tasks').html(app.info && app.info.engage_text ? app.info.engage_text : 'Do some Tasks!');
        });
    }

    function newtask() {
        pybossa.newTask(global.app_name, global.endpoint).done( function( data ) {
            if ( !$.isEmptyObject(data.task) ) {
                window.location.pathname = '/'+global.app_name+'/task/' + data.task.id;
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

} ( window.pybossa_apps, jQuery ));