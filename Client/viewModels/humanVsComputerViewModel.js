var HumanVsComputerViewModel = (function () {
    var consts = {
        SERVER_ADDRESS: "localhost:1337",
    };

    var that, socket;

    var HumanVsComputerViewModel = function () {
        that = this;

        that.isRunning = ko.observable(false);
        that.isValidInput = ko.observable(true);
        that.guesses = ko.observableArray();

        that.number1 = ko.observable(1);
        that.number2 = ko.observable(2);
        that.number3 = ko.observable(3);
        that.number4 = ko.observable(4);

        socket = io(consts.SERVER_ADDRESS);

        that.gameId = "";
        that.playerToken = "";

        socket.on("create game response", function (data) {
            that.onGameCreated(data);
        });

        socket.on("start game response", function (data) {
            that.onGameStarted(data);
        });

        socket.on("guess number response", function (data) {
            that.onGuessResponse(data);
        });

        socket.on("game over", function (data) {
            that.onGameOver(data);
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
            socket.emit("create game", { //TODO: refactor (extract const)
                name: "unknown_h_vs_c",
                nickname: "guest",
                type: 0 //TODO: refactor
            });
        },

        onGameCreated: function (data) {
            var success = data.success;
            if (!success) {
                alert(data.msg);
                return;
            }

            that.gameId = data.gameId;
            that.playerToken = data.playerToken;

            socket.emit("start game", { //TODO: refactor (extract const)
                gameId: that.gameId,
                playerToken: that.playerToken
            });
        },

        onGameStarted: function (data) {
            that.isRunning(true);
            that.guesses.removeAll();
            that.number1(1);
            that.number2(2);
            that.number3(3);
            that.number4(4);
        },

        Guess: function () {
            if (!that.isValidNumber()) {
                alert("Guess number cannot contain duplicating digits!");
                return;
            }

            socket.emit("guess number", { //TODO: refactor (extract const)
                gameId: that.gameId,
                playerToken: that.playerToken,
                number: [that.number1(), that.number2(), that.number3(), that.number4()]
            });
        },

        onGuessResponse: function (data) {
            var gameId = data.gameId;
            var bulls = data.bulls, cows = data.cows;
            var number = data.number;

            that.guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
        },

        Surrender: function () {
            socket.emit("surrender game", {
                gameId: this.gameId,
                playerToken: this.playerToken
            });

            that.isRunning(false);
        },

        onGameOver: function (data) {
            that.isRunning(false);
            var winStr = data.win ? "win" : "lose";
            var result = "Game over! You " + winStr + "! Number is: " + data.number.join('');
            alert(result);
            that.guesses.push(result);

            that.gameId = "";
        },

        onValidate: function () {
            that.isValidInput(that.isValidNumber());
        },

        isValidNumber: function () {
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