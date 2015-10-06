define(["knockout", "socket.io", "jquery", "js/consts", "viewModels/BaseViewModel", "js/botPlayer"], function (ko, io, $, consts, BaseViewModel, BotPlayer) {
    ComputerVsComputerViewModel.prototype = new BaseViewModel;
    function ComputerVsComputerViewModel() {
        var that = this;

        BaseViewModel.call(that);

        that.isThinking = ko.observable(false);

        that.gameName("h_vs_c_" + new Date().getTime());
        that.nickname("botPlayer_" + new Date().getTime());
        that.gameType(consts.gameType.SINGLE_PLAYER);

        that.botPlayer = null;
    };

    ComputerVsComputerViewModel.prototype.onGameCreated = function (data) {
        var that = this;

        BaseViewModel.prototype.onGameCreated.call(that, data);

        that.botPlayer = new BotPlayer(that, that.socket, that.gameId, that.nickname(), that.playerToken);

        that.socket.emit(consts.events.START_GAME_EVENT,
            {
                gameId: that.gameId,
                playerToken: that.playerToken
            },
            function (data) {
                BaseViewModel.prototype.onGameStarted.call(that, data);
            });
    }

    ComputerVsComputerViewModel.prototype.showThinkingProgress = function (visible) {
        var that = this;

        that.isThinking(visible);
    }

    return ComputerVsComputerViewModel;
});