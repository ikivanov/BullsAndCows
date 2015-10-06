define(["knockout", "socket.io", "jquery", "js/consts", "viewModels/BaseViewModel", "js/botPlayer"], function (ko, io, $, consts, BaseViewModel, BotPlayer) {
    BaseMultiplayerViewModel.prototype = new BaseViewModel;
    function BaseMultiplayerViewModel() {
        var that = this;

        BaseViewModel.call(that);

        that.isGameCreator = false;
        that.selectedGame = ko.observable();
        that.step = ko.observable(0);
        that.isMyTurn = ko.observable(false);
        that.gamesList = ko.observableArray();
        that.gamePlayers = ko.observableArray();
    };

    BaseMultiplayerViewModel.prototype.initSocket = function () {
        var that = this;

        BaseViewModel.prototype.initSocket.call(that);

        that.socket.on(consts.events.JOIN_GAME_SERVER_EVENT, function (data) {
            $.proxy(that.onGameJoined(data), that);
        });

        that.socket.on(consts.events.PLAYER_TURN_SERVER_EVENT, function (data) {
            $.proxy(that.onPlayerTurn(data), that);
        });

        that.socket.on(consts.events.GAME_STARTED_SERVER_EVENT, function (data) {
            $.proxy(that.onGameStarted(data), that);
        });

        that.socket.on(consts.events.GUESS_NUMBER_SERVER_EVENT, function (data) {
            $.proxy(that.onGuessNumber(data), that);
        });
    }

    BaseMultiplayerViewModel.prototype.onGameCreated = function (data) {
        var that = this;

        BaseViewModel.prototype.onGameCreated.call(that, data);

        that.isGameCreator = true;

        that.ListPlayers();

        that.step(1);
    }

    BaseMultiplayerViewModel.prototype.ListGames = function () {
        var that = this;

        that.socket.emit(consts.events.LIST_GAMES_EVENT,
            {
                type: that.gameType()
            },
            function (data) {
                that.onGamesListed(data);
            }
        );
    },

    BaseMultiplayerViewModel.prototype.onGamesListed = function (data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.gamesList(data.gamesList);
    }

    BaseMultiplayerViewModel.prototype.onGuessNumber = function (data) {
        var that = this;

        if (data.nickname == that.nickname()) {
            return;
        }

        that.onGuessResponse(data);
    }

    BaseMultiplayerViewModel.prototype.JoinGame = function () {
        var that = this;

        if (!that.socket) {
            that.initSocket();
        }

        that.socket.emit(consts.events.CHECK_NICKNAME_EXISTS_EVENT, {
            gameId: that.selectedGame().id,
            nickname: that.nickname()
        }, function (data) {
            that.onNicknameExistsResponse(data);
        });
    }

    BaseMultiplayerViewModel.prototype.onNicknameExistsResponse = function (data) {
        var that = this;

        var exists = data.exists;
        if (exists) {
            alert(data.msg);
            return;
        }

        that.socket.emit(consts.events.JOIN_GAME_EVENT, {
            gameId: that.selectedGame().id,
            nickname: that.nickname()
        }, function (data) {
            that.onGameJoined(data);
        });
    }

    BaseMultiplayerViewModel.prototype.onGameJoined = function (data) {
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

    BaseMultiplayerViewModel.prototype.ListPlayers = function () {
        var that = this;

        that.socket.emit(consts.events.LIST_GAME_PLAYERS_EVENT,
            {
                gameId: that.gameId,
                playerToken: that.playerToken
            },
            function (data) {
                that.onPlayersListed(data);
            }
        );
    }

    BaseMultiplayerViewModel.prototype.onPlayersListed = function (data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.gamePlayers(data.players);
    }

    BaseMultiplayerViewModel.prototype.StartGame = function () {
        var that = this;

        that.socket.emit(consts.events.START_GAME_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken
        }, function (data) {
            that.onGameStarted(data);
        });
    }

    BaseMultiplayerViewModel.prototype.onGameStarted = function (data) {
        var that = this;

        BaseViewModel.prototype.onGameStarted.call(that, data);

        that.step(2);
    }

    BaseMultiplayerViewModel.prototype.onPlayerTurn = function (data) {
        var that = this;

        if (data.nickname == that.nickname()) {
            that.isMyTurn(true);
        }
    }

    BaseMultiplayerViewModel.prototype.Guess = function () {
        var that = this;

        if (!that.isValidNumber()) {
            alert("Guess number cannot contain duplicating digits!");
            return;
        }

        that.socket.emit(consts.events.GUESS_NUMBER_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken,
            number: [that.number1(), that.number2(), that.number3(), that.number4()]
        }, function (data) {
            that.onGuessResponse(data);
            that.isMyTurn(false);
        });
    }

    BaseMultiplayerViewModel.prototype.onGuessResponse = function (data) {
        var that = this;

        var bulls = data.bulls, cows = data.cows;
        var number = data.number;

        that.guesses.push(data.nickname + ": " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
    }

    return BaseMultiplayerViewModel;
});