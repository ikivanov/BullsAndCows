var MultiplayerViewModel = (function () {
    var consts = {
        SERVER_ADDRESS: "localhost:1337",
    };

    var that, socket;

    var MultiplayerViewModel = function () {
        that = this;

        socket = io(consts.SERVER_ADDRESS);
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

        socket.on("create game response", function (data) {
            that.onGameCreated(data);
        });

        socket.on("list games response", function (data) {
            that.onGamesListed(data);
        });

        socket.on("list players response", function (data) {
            that.onPlayersListed(data);
        });

        socket.on("join game response", function (data) {
            that.onGameJoined(data);
        });

        socket.on("start game response", function (data) {
            that.onGameStarted(data);
        });

        socket.on("player turn", function (data) {
            that.onPlayerTurn(data);
        });

        socket.on("guess number response", function (data) {
            that.onGuessResponse(data);
        });

        socket.on("game over", function (data) {
            that.onGameOver(data);
        });

        socket.on("nickname exists response", function (data) {
            that.onNicknameExistsResponse(data);
        });

        that.ListGames();
    };

    MultiplayerViewModel.prototype = {
        constructor: MultiplayerViewModel,

        ListGames: function() {
            socket.emit("list games", { //TODO: refactor (extract const)
                type: 1 //TODO: refactor
            });
        },

        onGamesListed: function(data) {
            var success = data.success;
            if (!success) {
                alert(data.msg);
                return;
            }

            that.gamesList(data.gamesList);
        },

        CreateGame: function () {
            socket.emit("create game", { //TODO: refactor (extract const)
                name: that.gameName(),
                nickname: that.nickname(),
                type: 1 //TODO: refactor
            });
        },

        onGameCreated: function(data) {
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
            socket.emit("nickname exists", { //TODO: refactor (extract const)
                gameId: that.selectedGame().id,
                nickname: that.nickname()
            });
        },

        onNicknameExistsResponse: function (data) {
            var exists = data.exists;
            if (exists) {
                alert(data.msg);
                return;
            }

            socket.emit("join game", { //TODO: refactor (extract const)
                gameId: that.selectedGame().id,
                nickname: that.nickname()
            });
        },

        onGameJoined: function(data) {
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
            socket.emit("list players", { //TODO: refactor (extract const)
                gameId: that.gameId,
                playerToken: that.playerToken
            });
        },

        onPlayersListed: function(data) {
            var success = data.success;
            if (!success) {
                alert(data.msg);
                return;
            }

            that.gamePlayers(data.players);
        },

        StartGame: function () {
            socket.emit("start game", { //TODO: refactor (extract const)
                gameId: that.gameId,
                playerToken: that.playerToken
            });
        },

        onGameStarted: function(data) {
            var success = data.success;
            if (!success) {
                alert(data.msg);
                return;
            }

            that.isRunning(true);
            that.step(2);
        },

        onPlayerTurn: function(data) {
            if (data.nickname == that.nickname()) {
                that.isMyTurn(true);
            }
        },

        Guess: function() {
            if (!that.isValidNumber()) {
                alert("Guess number cannot contain duplicating digits!");
                return;
            }

            socket.emit("guess number", { //TODO: refactor (extract const)
                gameId: that.gameId,
                playerToken: that.playerToken,
                number: [that.number1(), that.number2(), that.number3(), that.number4()]
            });

            that.isMyTurn(false);
        },

        onGuessResponse: function(data) {
            var bulls = data.bulls, cows = data.cows;
            var number = data.number;

            that.guesses.push(data.nickname + ": " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
        },

        AddBot: function () {
            var botSocket = io.connect(consts.SERVER_ADDRESS, { 'forceNew': true });
            var nickname = "botPlayer_" + new Date().getTime();

            var bot = new BotPlayer(null, botSocket, that.gameId, nickname);
            bot.joinGame(that.gameId);
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
        },

        onGameOver: function (data) {
            that.isGameOver(true);
            that.isRunning(false);

            var winStr = data.win ? "win" : "lose";
            var result = "Game over! You " + winStr + "! Number is: " + data.number.join('');
            alert(result);
            that.guesses.push(result);

            that.gameId = "";
        },

    };

    return MultiplayerViewModel;
})();