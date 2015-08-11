var ComputerVsComputerViewModel = (function () {
    var consts = {
        SERVER_ADDRESS: "localhost:1337"
    };

    var that;

    var ComputerVsComputerViewModel = function () {
        that = this;

        that.isRunning = ko.observable(false);
        that.guesses = ko.observableArray();
        that.isThinking = ko.observable(false);

        that.gameName = "h_vs_c";
        that.nickname = "botPlayer_" + new Date().getTime();

        that.socket = null;;

        that.gameId = "";
        that.playerToken = "";

        that.botPlayer = null;
    };

    ComputerVsComputerViewModel.prototype = {
        constructor: ComputerVsComputerViewModel,

        isRunning: ko.observable(false),
        guesses: ko.observableArray(),
        answers: [],

        initSocket: function() {
            that.socket = io.connect(consts.SERVER_ADDRESS, {'forceNew': true});

            that.socket.on("create game response", function (data) {
                that.onGameCreated(data);
            });

            that.socket.on("start game response", function (data) {
                that.onGameStarted(data);
            });

            that.socket.on("game over", function (data) {
                that.onGameOver(data);
            });
        },

        CreateNewGame: function () {
            that.initSocket();

            that.socket.emit("create game", { //TODO: refactor (extract const)
                name: that.gameName,
                nickname: that.nickname,
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

            that.botPlayer = new BotPlayer(that, that.socket, that.gameId, that.nickname, that.playerToken);

            that.socket.emit("start game", { //TODO: refactor (extract const)
                gameId: that.gameId,
                playerToken: that.playerToken
            });
        },

        onGameStarted: function (data) {
            that.isRunning(true);
            that.guesses.removeAll();
        },

        onGameOver: function (data) {
            that.isRunning(false);
            var winStr = data.win ? "win" : "lose";
            var result = "Game over! You " + winStr + "! Number is: " + data.number.join('');
            that.guesses.push(result);

            that.gameId = "";

            that.socket.disconnect();
            that.socket = null;
        },

        onGuessResponse: function (data) {
            var bulls = data.bulls, cows = data.cows;
            var number = data.number;

            that.guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
        },

        showThinkingProgress: function (visible) {
            that.isThinking(visible);
        }
    };

    return ComputerVsComputerViewModel;
})();