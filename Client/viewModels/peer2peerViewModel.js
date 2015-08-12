var Peer2PeerViewModel = (function () {
    Peer2PeerViewModel.prototype = new BaseViewModel;
    function Peer2PeerViewModel() {
        var that = this;

        BaseViewModel.call(that);

        that.step = ko.observable(0);
        that.isRunning = ko.observable(false);
        that.isMyTurn = ko.observable(false);

        that.secretNumber = ko.observable("")

        that.isGameCreator = false;

        that.nickname = ko.observable("");
        that.gameName = ko.observable("");
        that.gamesList = ko.observableArray();

        that.gamePlayers = ko.observableArray();

        that.selectedGame = ko.observable();

        that.bots = [],

        that.initSocket();

        that.ListGames();
    };

    Peer2PeerViewModel.prototype.initSocket = function () {
        var that = this;

        BaseViewModel.prototype.initSocket.call(that);

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

        that.socket.on(App.events.GUESS_PEER_NUMBER_SERVER_EVENT, function (data) {
            $.proxy(that.onGuessPeerIncomingQuery(data), that);
        });

        that.socket.on(App.events.GUESS_PEER_NUMBER_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGuessPeerNumberResponse(data), that);
        });
    }

    Peer2PeerViewModel.prototype.ListGames = function () {
        var that = this;

        that.socket.emit(App.events.LIST_GAMES_EVENT, {
            type: App.gameType.PEER_2_PEER
        });
    },

    Peer2PeerViewModel.prototype.onGamesListed = function(data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.gamesList(data.gamesList);
    }

    Peer2PeerViewModel.prototype.CreateGame = function () {
        var that = this;

        if (!that.socket) {
            that.initSocket();
        }

        that.socket.emit(App.events.CREATE_GAME_EVENT, {
            name: that.gameName(),
            nickname: that.nickname(),
            type: App.gameType.PEER_2_PEER
        });
    }

    Peer2PeerViewModel.prototype.onGameCreated = function(data) {
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

    Peer2PeerViewModel.prototype.onGuessPeerIncomingQuery = function(data) {
        var that = this;

        var bullscows = {bulls: 0, cows: 0};

        that.socket.emit(App.events.GUESS_PEER_NUMBER_CLIENT_RESPONSE_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken,
            nickname: that.nickname(),
            success: true,
            number: data.number,
            bulls: bullscows.bulls,
            cows: bullscows.cows
        });
    }

    Peer2PeerViewModel.prototype.onGuessPeerNumberResponse = function(data){
        var that = this;
    }

    Peer2PeerViewModel.prototype.JoinGame = function () {
        var that = this;

        if (!that.socket) {
            that.initSocket();
        }

        that.socket.emit(App.events.CHECK_NICKNAME_EXISTS_EVENT, {
            gameId: that.selectedGame().id,
            nickname: that.nickname()
        });
    }

    Peer2PeerViewModel.prototype.onNicknameExistsResponse = function (data) {
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
    }

    Peer2PeerViewModel.prototype.onGameJoined = function(data) {
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

    Peer2PeerViewModel.prototype.ListPlayers = function () {
        var that = this;

        that.socket.emit(App.events.LIST_GAME_PLAYERS_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken
        });
    }

    Peer2PeerViewModel.prototype.onPlayersListed = function(data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.gamePlayers(data.players);
    }

    Peer2PeerViewModel.prototype.StartGame = function () {
        var that = this;

        that.socket.emit(App.events.START_GAME_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken
        });
    }

    Peer2PeerViewModel.prototype.onGameStarted = function(data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.isRunning(true);
        that.step(2);
    }

    Peer2PeerViewModel.prototype.onPlayerTurn = function(data) {
        var that = this;

        if (data.nickname == that.nickname()) {
            that.isMyTurn(true);
        }
    }

    Peer2PeerViewModel.prototype.Guess = function() {
        var that = this;

        if (!that.isValidNumber()) {
            alert("Guess number cannot contain duplicating digits!");
            return;
        }

        that.socket.emit(App.events.GUESS_PEER_NUMBER_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken,
            number: [that.number1(), that.number2(), that.number3(), that.number4()]
        });

        that.isMyTurn(false);
    }

    Peer2PeerViewModel.prototype.onGuessResponse = function(data) {
        var that = this;

        var bulls = data.bulls, cows = data.cows;
        var number = data.number;

        that.guesses.push(data.nickname + ": " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
    }

    Peer2PeerViewModel.prototype.AddBot = function () {
        var that = this;

        var botSocket = io.connect(App.config.SERVER_ADDRESS, { 'forceNew': true });
        var nickname = "botPlayer_" + new Date().getTime();

        var bot = new BotPlayer(null, botSocket, that.gameId, nickname);
        bot.joinGame(that.gameId);
    }

    return Peer2PeerViewModel;
})();