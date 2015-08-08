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

        socket.on("game started", function (data) {
            that.onGameStarted(data);
        });

        socket.on("game over", function (data) {
            that.onGameOver(data);
        });

        socket.on("guess response", function (data) {
            that.onGuessResponse(data);
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

        onGameStarted: function (data) {
            that.isRunning(true);
            that.gameId = data.gameId;
            that.guesses.removeAll();
            that.number1(1);
            that.number2(2);
            that.number3(3);
            that.number4(4);
        },

        onGameOver: function (data) {
            that.isRunning(false);
            var winStr = data.win ? "win" : "lose";
            var result = "Game over! You " + winStr + "! Number is: " + data.number.join('');
            alert(result);
            that.guesses.push(result);

            that.gameId = "";
        },

        onGuessResponse: function (data) {
            var gameId = data.gameId;
            var bulls = data.bulls, cows = data.cows;
            var number = data.number;

            that.guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
        },

        StartNewGame: function () {
            socket.emit("start new game", {});
        },

        Surrender: function () {
            socket.emit("game surrender", { gameId: this.gameId });

            that.isRunning(false);
        },

        Guess: function () {
            if (!that.isValidNumber()) {
                alert("Guess number cannot contain duplicating digits!");
                return;
            }

            socket.emit("guess", { gameId: this.gameId, number: [this.number1(), this.number2(), this.number3(), this.number4()] });
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