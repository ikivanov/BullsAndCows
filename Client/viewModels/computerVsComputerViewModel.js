var ComputerVsComputerViewModel = (function () {
    ComputerVsComputerViewModel.prototype = new BaseViewModel;
    function ComputerVsComputerViewModel () {
        var that = this;

        BaseViewModel.call(that);

        that.isRunning = ko.observable(false);
        that.isThinking = ko.observable(false);

        that.gameName = "h_vs_c";
        that.nickname = "botPlayer_" + new Date().getTime();

        that.botPlayer = null;
    };

    ComputerVsComputerViewModel.prototype.initSocket = function()
    {
        BaseViewModel.prototype.initSocket.call(that);

        var that = this;

        that.socket = io.connect(App.config.SERVER_ADDRESS, { 'forceNew': true });

        that.socket.on(App.events.CREATE_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameCreated(data), that);
        });

        that.socket.on(App.events.START_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameStarted(data), that);
        });

        that.socket.on(App.events.GAME_OVER_EVENT, function (data) {
            $.proxy(that.onGameOver(data), that);
        });
    }

    ComputerVsComputerViewModel.prototype.CreateNewGame = function()
    {
        var that = this;

        that.initSocket();

        that.socket.emit(App.events.CREATE_GAME_EVENT, {
            name: that.gameName,
            nickname: that.nickname,
            type: App.gameType.SINGLE_PLAYER
        });
    }

    ComputerVsComputerViewModel.prototype.onGameCreated = function(data)
    {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.gameId = data.gameId;
        that.playerToken = data.playerToken;

        that.botPlayer = new BotPlayer(that, that.socket, that.gameId, that.nickname, that.playerToken);

        that.socket.emit(App.events.START_GAME_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken
        });
    }

    ComputerVsComputerViewModel.prototype.onGameStarted = function (data) {
        var that = this;

        that.isRunning(true);
        that.guesses.removeAll();
    }

    ComputerVsComputerViewModel.prototype.onGuessResponse = function (data) {
        var that = this;

        var bulls = data.bulls, cows = data.cows;
        var number = data.number;

        that.guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
    },

    ComputerVsComputerViewModel.prototype.showThinkingProgress = function (visible) {
        var that = this;

        that.isThinking(visible);
    }

    return ComputerVsComputerViewModel;
})();