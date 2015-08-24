requirejs.config({
    baseUrl: 'libs',
    paths: {
        app: "../app",
        js: '../js',
        viewModels: '../viewModels'
    }
});

requirejs(['jquery', "settings", "app"], function ($, settings, app) {
    $(function () {
        app.Run("workspace", settings.playerMode);
    });
});
