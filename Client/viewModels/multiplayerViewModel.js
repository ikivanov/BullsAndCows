define(["knockout", "socket.io", "jquery", "js/consts", "js/botPlayer", "viewModels/BaseViewModel"], function (ko, io, $, consts, BotPlayer, BaseViewModel) {
    MultiplayerViewModel.prototype = new BaseViewModel;
    function MultiplayerViewModel() {
        var that = this;

        BaseViewModel.call(that);

        that.step = ko.observable(0);
        that.isRunning = ko.observable(false);
        that.isMyTurn = ko.observable(false);

        that.isGameCreator = false;

        that.nickname = ko.observable("");
        that.gameName = ko.observable("");
        that.gamesList = ko.observableArray();

        that.gamePlayers = ko.observableArray();

        that.selectedGame = ko.observable();

        that.isGameOver = ko.observable(false);

        that.bots = [],

        that.initSocket();

        that.ListGames();
    };

    MultiplayerViewModel.prototype.initSocket = function () {
        var that = this;

        BaseViewModel.prototype.initSocket.call(that);

        that.socket.on(consts.events.CREATE_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameCreated(data), that);
        });

        that.socket.on(consts.events.LIST_GAMES_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGamesListed(data), that);
        });

        that.socket.on(consts.events.LIST_GAME_PLAYERS_RESPONSE_EVENT, function (data) {
            $.proxy(that.onPlayersListed(data), that);
        });

        that.socket.on(consts.events.JOIN_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameJoined(data), that);
        });

        that.socket.on(consts.events.START_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameStarted(data), that);
        });

        that.socket.on(consts.events.PLAYER_TURN_SERVER_EVENT, function (data) {
            $.proxy(that.onPlayerTurn(data), that);
        });

        that.socket.on(consts.events.GUESS_NUMBER_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGuessResponse(data), that);
        });

        that.socket.on(consts.events.GAME_OVER_EVENT, function (data) {
            $.proxy(that.onGameOver(data), that);
        });

        that.socket.on(consts.events.CHECK_NICKNAME_EXISTS_RESPONSE_EVENT, function (data) {
            $.proxy(that.onNicknameExistsResponse(data), that);
        });
    }

    MultiplayerViewModel.prototype.ListGames = function () {
        var that = this;

        that.socket.emit(consts.events.LIST_GAMES_EVENT, {
            type: consts.gameType.MULTIPLAYER
        });
    }

    MultiplayerViewModel.prototype.onGamesListed = function (data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.gamesList(data.gamesList);
    }

    MultiplayerViewModel.prototype.CreateGame = function () {
        var that = this;

        if (!that.socket) {
            that.initSocket();
        }

        that.socket.emit(consts.events.CREATE_GAME_EVENT, {
            name: that.gameName(),
            nickname: that.nickname(),
            type: consts.gameType.MULTIPLAYER
        });
    },

    MultiplayerViewModel.prototype.onGameCreated = function (data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.gameId = data.gameId;
        that.playerToken = data.playerToken;

        that.isGameCreator = true;

        that.ListPlayers();

        that.step(1);
    }

    MultiplayerViewModel.prototype.JoinGame = function () {
        var that = this;

        if (!that.socket) {
            that.initSocket();
        }

        that.socket.emit(consts.events.CHECK_NICKNAME_EXISTS_EVENT, {
            gameId: that.selectedGame().id,
            nickname: that.nickname()
        });
    },

    MultiplayerViewModel.prototype.onNicknameExistsResponse = function (data) {
        var that = this;

        var exists = data.exists;
        if (exists) {
            alert(data.msg);
            return;
        }

        that.socket.emit(consts.events.JOIN_GAME_EVENT, {
            gameId: that.selectedGame().id,
            nickname: that.nickname()
        });
    }

    MultiplayerViewModel.prototype.onGameJoined = function (data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        if (that.nickname() == data.nickname) { //current user has joined the game, go to step 2
            that.gameId = data.gameId;
            that.playerToken = data.playerToken;

            that.step(2);
        } else { //another user has joined the game, update the player list
            if (that.isGameCreator) {
                that.ListPlayers();
            }
        }
    }

    MultiplayerViewModel.prototype.ListPlayers = function () {
        var that = this;

        that.socket.emit(consts.events.LIST_GAME_PLAYERS_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken
        });
    }

    MultiplayerViewModel.prototype.onPlayersListed = function (data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.gamePlayers(data.players);
    }

    MultiplayerViewModel.prototype.StartGame = function () {
        var that = this;

        that.socket.emit(consts.events.START_GAME_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken
        });
    }

    MultiplayerViewModel.prototype.onGameStarted = function (data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.isRunning(true);
        that.step(2);
    }

    MultiplayerViewModel.prototype.onPlayerTurn = function (data) {
        var that = this;

        if (data.nickname == that.nickname()) {
            that.isMyTurn(true);
        }
    },

    MultiplayerViewModel.prototype.Guess = function () {
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

        that.isMyTurn(false);
    },

    MultiplayerViewModel.prototype.onGuessResponse = function (data) {
        var that = this;

        var bulls = data.bulls, cows = data.cows;
        var number = data.number;

        that.guesses.push(data.nickname + ": " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
    },

    MultiplayerViewModel.prototype.AddBot = function () {
        var that = this;

        var botSocket = io.connect(consts.config.SERVER_ADDRESS, { 'forceNew': true });
        var nickname = "botPlayer_" + new Date().getTime();

        var bot = new BotPlayer(null, botSocket, that.gameId, nickname);
        bot.joinGame(that.gameId);
    }

    return MultiplayerViewModel;
});