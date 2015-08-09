var App = App || {};

(function () {
    var consts = {
        SERVER_ADDRESS: "localhost:1337",
        MISSING_HOST_ELEMENT_MESSAGE: "Host element cannot be null, undentified or an empty string!",
        INVALID_HOST_ELEMENT_MESSAGE: "Invalid host element! A valid html element identifier or jquery html object should be provided!",
    };

    App.Run = function (hostElement) {
        if (!hostElement) {
            throw new Error(consts.MISSING_HOST_ELEMENT_MESSAGE);
        }

        var el = typeof hostElement === "string" ? $("#" + hostElement) : hostElement;

        if (el.length === 0) {
            throw new Error(consts.INVALID_HOST_ELEMENT_MESSAGE);
        }

        render(el);
    }

    var render = function (hostElement) {
        var that = this;

        hostElement.load("views\\computerVsComputerView.html", function () {
            ko.applyBindings(new ComputerVsComputerViewModel());
        });
    }
})();