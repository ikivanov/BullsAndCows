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
        that.number1 = ko.observable(1),
        that.number2 = ko.observable(2),
        that.number3 = ko.observable(3),
        that.number4 = ko.observable(4)
        isValidInput= ko.observable(true),
        guesses = ko.observableArray()

        that.nickname = ko.observable("");
        that.gameName = ko.observable("");
        that.gamesList = ko.observableArray();

        that.gamePlayers = ko.observableArray();

        that.selectedGame = ko.observable();

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

            that.ListPlayers();

            that.step(1);
        },

        JoinGame: function () {
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
                that.step(2);
            } else { //another use has joined the game, update the player list
                that.ListPlayers();
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

        Guess: function() {

        },

        AddBot: function() {
            alert('Not implemented!');
        },

        onValidate: function () {

        }
    };

    return MultiplayerViewModel;
})();