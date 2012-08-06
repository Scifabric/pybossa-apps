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

## Updating your task presenters

The PyBossa Apps framework allows you to simplify the logic of your task presenters. Here's an example of a very simple task presenter:

```HTML
<h1>My PyBossa App</h1>

<!-- status message if no more tasks are available, hidden by default -->
<div id="finish" style="display:none">
    <p>Congrats, you solved all tasks!</p>
</div>

<!-- task details, hidden by default -->
<div class="task" style="display:none">
    <div class="task-info"></div>
    <p>Do you see a human on this image?</p>
    <button class="btn" onclick="submitTask('yes')">yes</button>
    <button class="btn" onclick="submitTask('no')">no</button>
    <div class="status"></div>
</div>

<script type="text/javascript">

/*
 * will be called automatically after the task has been loaded
 */
function taskLoaded(info) {
    // show image
    $('.task-info').append('<img src="' + info.imageUrl + '" />');
    // unhide task details
    $('.task').show();
}

function submitTask(answer) {
    // show that the task will be submitted (optional)
    $('button').attr('disabled', true);
    $('.status').html('Your answer will be submitted now.');

    // submit task
    PyBossaApp.saveTask(taskid, answer, function(data) {
        // show that the next task will be loaded
        $('.status').html('Your answer has been submitted. Loading next task now.');

        // load next task, will unhide #finish if no more tasks are available
        PyBossaApp.nextTask();
    });
}

</script>
```