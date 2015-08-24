define(["knockout", "socket.io", "jquery", "js/consts", "viewModels/BaseViewModel"], function (ko, io, $, consts, BaseViewModel) {
    HumanVsComputerViewModel.prototype = new BaseViewModel;
    function HumanVsComputerViewModel() {
        var that = this;

        BaseViewModel.call(that);

        that.isRunning = ko.observable(false);
    }

    HumanVsComputerViewModel.prototype.initSocket = function () {
        var that = this;

        BaseViewModel.prototype.initSocket.call(that);

        that.socket.on(consts.events.CREATE_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameCreated(data), that);
        });

        that.socket.on(consts.events.START_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameStarted(data), that);
        });

        that.socket.on(consts.events.GUESS_NUMBER_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGuessResponse(data), that);
        });

        that.socket.on(consts.events.GAME_OVER_EVENT, function (data) {
            $.proxy(that.onGameOver(data), that);
        });
    }

    HumanVsComputerViewModel.prototype.CreateNewGame = function () {
        var that = this;

        that.initSocket();

        that.socket.emit(consts.events.CREATE_GAME_EVENT, {
            name: "unknown_h_vs_c",
            nickname: "guest",
            type: consts.gameType.SINGLE_PLAYER
        });
    }

    HumanVsComputerViewModel.prototype.onGameCreated = function (data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.gameId = data.gameId;
        that.playerToken = data.playerToken;

        that.socket.emit(consts.events.START_GAME_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken
        });
    }

    HumanVsComputerViewModel.prototype.onGameStarted = function (data) {
        var that = this;

        that.isRunning(true);
        that.guesses.removeAll();
        that.number1(1);
        that.number2(2);
        that.number3(3);
        that.number4(4);
    }

    HumanVsComputerViewModel.prototype.Guess = function () {
        var that = this;

        if (!that.isValidNumber()) {
            alert("Guess number cannot contain duplicating digits!");
            return;
        }

        that.socket.emit(consts.events.GUESS_NUMBER_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken,
            number: [that.number1(), that.number2(), that.number3(), that.number4()]
        });
    }

    HumanVsComputerViewModel.prototype.onGuessResponse = function (data) {
        var that = this;

        var gameId = data.gameId;
        var bulls = data.bulls, cows = data.cows;
        var number = data.number;

        that.guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
    }

    HumanVsComputerViewModel.prototype.Surrender = function () {
        var that = this;

        that.socket.emit(consts.events.SURRENDER_GAME_EVENT, {
            gameId: this.gameId,
            playerToken: this.playerToken
        });

        that.isRunning(false);
    }

    return HumanVsComputerViewModel;
});