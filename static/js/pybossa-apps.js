
(function(global, $) {

    function app() {
        $.ajax({
            url: global.endpoint + '/api/app?short_name=' + global.app_name,
            success: function(data) {
                $('.loading').hide();
                $('.container').show();

                var app = data[0];
                $('.app-name').html(app.name);
                $('.app-description').html(app.description);
                $('.app-long-description').html(app.long_description);
                $('.solve-tasks').attr('href', '/'+global.app_name+'/newtask');
                $('.solve-tasks').html(app.info.engage_text ? app.info.engage_text : 'Solve some tasks');
            }
        });
    }

    function newtask() {

    }

    function task() {

    }

    $(function() {
        if (global.view == 'app') app();
        else if (global.view == 'newtask') newtask();
        else if (global.view == 'task') task();
    });

} ( window.pybossa_apps, jQuery ));