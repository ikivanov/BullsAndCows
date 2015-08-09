var MultiplayerViewModel = (function () {
    var consts = {
        SERVER_ADDRESS: "localhost:1337",
    };

    var that, socket;

    var MultiplayerViewModel = function () {
        that = this;

        socket = io(consts.SERVER_ADDRESS);
        that.step = ko.observable(0);
        that.isRunning = ko.observable(false);
        that.number1 = ko.observable(1),
        that.number2 = ko.observable(2),
        that.number3 = ko.observable(3),
        that.number4 = ko.observable(4)
        isValidInput= ko.observable(true),
        guesses= ko.observableArray()
    };

    MultiplayerViewModel.prototype = {
        constructor: MultiplayerViewModel,

        CreateGame: function () {
            that.step(1);
        },

        JoinGame: function () {
            that.step(2);
        },

        LeaveGame: function () {
            that.step(0);
        },

        StartGame: function () {
            that.step(2);
        },

        Guess: function() {

        },

        onValidate: function () {

        }
    };

    return MultiplayerViewModel;
})();