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

        hostElement.load("views\\main.html", function () {
            ko.applyBindings(new GameViewModel());
        });
    }

    var GameViewModel = function () {
        var that = this;

        that.isRunning = ko.observable(false);
        that.isValidInput = ko.observable(true);
        that.guesses = ko.observableArray();

        that.number1 = ko.observable(1);
        that.number2 = ko.observable(2);
        that.number3 = ko.observable(3);
        that.number4 = ko.observable(4);

        that.socket = io(consts.SERVER_ADDRESS);

        that.gameId = "";
        that.initialized = false;

        this.canGuess = ko.computed(function () {
            return this.isRunning() && this.isValidInput();
        }, this);

        that.onGameStarted = function (data) {
            that.isRunning(true);
            that.gameId = data.gameId;
            that.guesses.removeAll();
            that.number1(1);
            that.number2(2);
            that.number3(3);
            that.number4(4);
        }

        that.onGameOver = function (data) {
            that.isRunning(false);
            var winStr = data.win ? "win" : "lose";
            var result = "Game over! You " + winStr + "! Number is: " + data.number.join('');
            alert(result);
            that.guesses.push(result);

            that.gameId = "";
        }

        that.onGuessResponse = function (data) {
            var gameId = data.gameId;
            var bulls = data.bulls, cows = data.cows;
            var number = data.number;

            that.guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
        }

        that.initialize = function () {
            if (!that.initialized) {
                this.socket.on("game started", function (data) {
                    that.onGameStarted(data);
                });

                this.socket.on("game over", function (data) {
                    that.onGameOver(data);
                });

                this.socket.on("guess response", function (data) {
                    that.onGuessResponse(data);
                });

                that.initialized = true;
            }
        }

        that.StartNewGame = function () {
            //that.Surrender();

            this.socket.emit("start new game", {});

            that.initialize();
        }

        that.Surrender = function () {
            this.socket.emit("game surrender", {gameId: this.gameId});

            this.isRunning(false);
        }

        that.Guess = function () {
            if (!that.canGuess()) {
                alert("Guess number cannot contain duplicating digits!");
                return;
            }

            this.socket.emit("guess", { gameId: this.gameId, number: [this.number1(), this.number2(), this.number3(), this.number4()] });
        }

        that.onValidate = function () {
            that.isValidInput(that.isValidNumber());
        }

        that.isValidNumber = function () {
            if (this.number1() == 0) {
                return false;
            }

            var result = 
                this.number1() != this.number2() &&
                this.number1() != this.number3() &&
                this.number1() != this.number4() &&
                this.number2() != this.number3() &&
                this.number2() != this.number4() &&
                this.number3() != this.number4();

            return result;
        }
    };
})();