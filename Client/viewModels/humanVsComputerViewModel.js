define(["knockout", "socket.io", "jquery", "js/consts", "viewModels/BaseViewModel"], function (ko, io, $, consts, BaseViewModel) {
    HumanVsComputerViewModel.prototype = new BaseViewModel;
    function HumanVsComputerViewModel() {
        var that = this;

        BaseViewModel.call(that);

        that.isRunning = ko.observable(false);
    }

    HumanVsComputerViewModel.prototype.CreateGame = function () {
        var that = this;

        that.gameName("h_vs_c" + new Date().getTime());
        that.nickname("guest");
        that.gameType(consts.gameType.SINGLE_PLAYER);

        BaseViewModel.prototype.CreateGame.call(that);
    }

    HumanVsComputerViewModel.prototype.onGameCreated = function (data) {
        var that = this;

        BaseViewModel.prototype.onGameCreated.call(that, data);

        that.socket.emit(consts.events.START_GAME_EVENT,
            {
                gameId: that.gameId,
                playerToken: that.playerToken
            },
            function (data) {
                BaseViewModel.prototype.onGameStarted.call(that, data);
        });
    }

    HumanVsComputerViewModel.prototype.Guess = function () {
        var that = this;

        if (!that.isValidNumber()) {
            alert("Guess number cannot contain duplicating digits!");
            return;
        }

        that.socket.emit(consts.events.GUESS_NUMBER_EVENT,
            {
                gameId: that.gameId,
                playerToken: that.playerToken,
                number: [that.number1(), that.number2(), that.number3(), that.number4()]
            },
            function (data) {
                BaseViewModel.prototype.onGuessResponse.call(that, data);
            }
        );
    }

    HumanVsComputerViewModel.prototype.Surrender = function () {
        var that = this;

        that.socket.emit(consts.events.SURRENDER_GAME_EVENT,
            {
                gameId: this.gameId,
                playerToken: this.playerToken
            },
            function (data) {
                if (!data.success) {
                    alert(data.msg);
                }
            }
        );

        that.isRunning(false);
    }

    return HumanVsComputerViewModel;
});