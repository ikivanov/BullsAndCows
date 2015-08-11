var MultiplayerViewModel = (function () {
    var MultiplayerViewModel = function () {
        var that = this;

        that.step = ko.observable(0);
        that.isRunning = ko.observable(false);
        that.isMyTurn = ko.observable(false);
        that.number1 = ko.observable(1),
        that.number2 = ko.observable(2),
        that.number3 = ko.observable(3),
        that.number4 = ko.observable(4)
        that.isValidInput = ko.observable(true),
        that.guesses = ko.observableArray()

        that.isGameCreator = false;

        that.nickname = ko.observable("");
        that.gameName = ko.observable("");
        that.gamesList = ko.observableArray();

        that.gamePlayers = ko.observableArray();

        that.selectedGame = ko.observable();

        that.isGameOver = ko.observable(false);

        that.bots = [],

        that.socket = io.connect(App.config.SERVER_ADDRESS, { 'forceNew': true });

        that.socket.on(App.events.CREATE_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameCreated(data), that);
        });

        that.socket.on(App.events.LIST_GAMES_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGamesListed(data), that);
        });

        that.socket.on(App.events.LIST_GAME_PLAYERS_RESPONSE_EVENT, function (data) {
            $.proxy(that.onPlayersListed(data), that);
        });

        that.socket.on(App.events.JOIN_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameJoined(data), that);
        });

        that.socket.on(App.events.START_GAME_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGameStarted(data), that);
        });

        that.socket.on(App.events.PLAYER_TURN_SERVER_EVENT, function (data) {
            $.proxy(that.onPlayerTurn(data), that);
        });

        that.socket.on(App.events.GUESS_NUMBER_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGuessResponse(data), that);
        });

        that.socket.on(App.events.GAME_OVER_EVENT, function (data) {
            $.proxy(that.onGameOver(data), that);
        });

        that.socket.on(App.events.CHECK_NICKNAME_EXISTS_RESPONSE_EVENT, function (data) {
            $.proxy(that.onNicknameExistsResponse(data), that);
        });

        that.ListGames();
    };

    MultiplayerViewModel.prototype = {
        constructor: MultiplayerViewModel,

        ListGames: function () {
            var that = this;

            that.socket.emit(App.events.LIST_GAMES_EVENT, {
                type: App.gameType.MULTIPLAYER
            });
        },

        onGamesListed: function(data) {
            var that = this;

            var success = data.success;
            if (!success) {
                alert(data.msg);
                return;
            }

            that.gamesList(data.gamesList);
        },

        CreateGame: function () {
            var that = this;

            that.socket.emit(App.events.CREATE_GAME_EVENT, {
                name: that.gameName(),
                nickname: that.nickname(),
                type: App.gameType.MULTIPLAYER
            });
        },

        onGameCreated: function(data) {
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
        },

        JoinGame: function () {
            var that = this;

            that.socket.emit(App.events.CHECK_NICKNAME_EXISTS_EVENT, {
                gameId: that.selectedGame().id,
                nickname: that.nickname()
            });
        },

        onNicknameExistsResponse: function (data) {
            var that = this;

            var exists = data.exists;
            if (exists) {
                alert(data.msg);
                return;
            }

            that.socket.emit(App.events.JOIN_GAME_EVENT, {
                gameId: that.selectedGame().id,
                nickname: that.nickname()
            });
        },

        onGameJoined: function(data) {
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
        },

        ListPlayers: function () {
            var that = this;

            that.socket.emit(App.events.LIST_GAME_PLAYERS_EVENT, {
                gameId: that.gameId,
                playerToken: that.playerToken
            });
        },

        onPlayersListed: function(data) {
            var that = this;

            var success = data.success;
            if (!success) {
                alert(data.msg);
                return;
            }

            that.gamePlayers(data.players);
        },

        StartGame: function () {
            var that = this;

            that.socket.emit(App.events.START_GAME_EVENT, {
                gameId: that.gameId,
                playerToken: that.playerToken
            });
        },

        onGameStarted: function(data) {
            var that = this;

            var success = data.success;
            if (!success) {
                alert(data.msg);
                return;
            }

            that.isRunning(true);
            that.step(2);
        },

        onPlayerTurn: function(data) {
            var that = this;

            if (data.nickname == that.nickname()) {
                that.isMyTurn(true);
            }
        },

        Guess: function() {
            var that = this;

            if (!that.isValidNumber()) {
                alert("Guess number cannot contain duplicating digits!");
                return;
            }

            that.socket.emit(App.events.GUESS_NUMBER_EVENT, {
                gameId: that.gameId,
                playerToken: that.playerToken,
                number: [that.number1(), that.number2(), that.number3(), that.number4()]
            });

            that.isMyTurn(false);
        },

        onGuessResponse: function(data) {
            var that = this;

            var bulls = data.bulls, cows = data.cows;
            var number = data.number;

            that.guesses.push(data.nickname + ": " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
        },

        AddBot: function () {
            var that = this;

            var botSocket = io.connect(App.config.SERVER_ADDRESS, { 'forceNew': true });
            var nickname = "botPlayer_" + new Date().getTime();

            var bot = new BotPlayer(null, botSocket, that.gameId, nickname);
            bot.joinGame(that.gameId);
        },

        onValidate: function () {
            var that = this;

            that.isValidInput(that.isValidNumber());
        },

        isValidNumber: function () {
            var that = this;

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
        },

        onGameOver: function (data) {
            var that = this;

            that.isGameOver(true);
            that.isRunning(false);

            var winStr = data.win ? "win" : "lose";
            var result = "Game over! You " + winStr + "! Number is: " + data.number.join('');
            alert(result);
            that.guesses.push(result);

            that.gameId = "";
        }
    };

    return MultiplayerViewModel;
})();