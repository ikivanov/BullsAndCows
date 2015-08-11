var HumanVsComputerViewModel = (function () {
    var HumanVsComputerViewModel = function () {
        that = this;

        that.socket = null;

        that.isRunning = ko.observable(false);
        that.isValidInput = ko.observable(true);
        that.guesses = ko.observableArray();

        that.number1 = ko.observable(1);
        that.number2 = ko.observable(2);
        that.number3 = ko.observable(3);
        that.number4 = ko.observable(4);

        that.gameId = "";
        that.playerToken = "";

        that.socket = io.connect(App.config.SERVER_ADDRESS, { 'forceNew': true });

        that.socket.on(App.events.CREATE_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameCreated(data), that);
        });

        that.socket.on(App.events.START_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameStarted(data), that);
        });

        that.socket.on(App.events.GUESS_NUMBER_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGuessResponse(data), that);
        });

        that.socket.on(App.events.GAME_OVER_EVENT, function (data) {
            $.proxy(that.onGameOver(data), that);
        });
    };

    HumanVsComputerViewModel.prototype = {
        constructor: HumanVsComputerViewModel,

        isRunning: ko.observable(false),
        isValidInput: ko.observable(true),
        guesses: ko.observableArray(),

        number1: ko.observable(1),
        number2: ko.observable(2),
        number3: ko.observable(3),
        number4: ko.observable(4),

        CreateNewGame: function () {
            var that = this;

            that.socket.emit(App.events.CREATE_GAME_EVENT, {
                name: "unknown_h_vs_c",
                nickname: "guest",
                type: App.gameType.SINGLE_PLAYER
            });
        },

        onGameCreated: function (data) {
            var that = this;

            var success = data.success;
            if (!success) {
                alert(data.msg);
                return;
            }

            that.gameId = data.gameId;
            that.playerToken = data.playerToken;

            that.socket.emit(App.events.START_GAME_EVENT, {
                gameId: that.gameId,
                playerToken: that.playerToken
            });
        },

        onGameStarted: function (data) {
            var that = this;

            that.isRunning(true);
            that.guesses.removeAll();
            that.number1(1);
            that.number2(2);
            that.number3(3);
            that.number4(4);
        },

        Guess: function () {
            var that = this;

            if (!that.isValidNumber()) {
                alert("Guess number cannot contain duplicating digits!");
                return;
            }

            that.socket.emit(App.events.GUESS_NUMBER_EVENT, {
                gameId: that.gameId,
                playerToken: that.playerToken,
                number: [that.number1(), that.number2(), that.number3(), that.number4()]
            });
        },

        onGuessResponse: function (data) {
            var that = this;

            var gameId = data.gameId;
            var bulls = data.bulls, cows = data.cows;
            var number = data.number;

            that.guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
        },

        Surrender: function () {
            var that = this;

            that.socket.emit(App.events.SURRENDER_GAME_EVENT, {
                gameId: this.gameId,
                playerToken: this.playerToken
            });

            that.isRunning(false);
        },

        onGameOver: function (data) {
            var that = this;

            that.isRunning(false);
            var winStr = data.win ? "win" : "lose";
            var result = "Game over! You " + winStr + "! Number is: " + data.number.join('');
            alert(result);
            that.guesses.push(result);

            that.gameId = "";
        },

        onValidate: function () {
            var that = this;

            that.isValidInput(that.isValidNumber());
        },

        isValidNumber: function () {
            var that = this;

            if (that.number1() == 0) {
                return false;
            }

            var result =
                that.number1() != that.number2() &&
                that.number1() != that.number3() &&
                that.number1() != that.number4() &&
                that.number2() != that.number3() &&
                that.number2() != that.number4() &&
                that.number3() != that.number4();

            return result;
        }
    };

    return HumanVsComputerViewModel;
})();