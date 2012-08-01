
(function(global, $) {

    function app() {
        $.ajax({
            url: global.endpoint + '/api/app?short_name=' + global.app_name,
            success: function(data) {
                console.log(data);
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