define(["knockout", "socket.io", "jquery", "js/consts", "viewModels/baseMultiplayerViewModel"], function (ko, io, $, consts, BaseMultiplayerViewModel) {
    Peer2PeerViewModel.prototype = new BaseMultiplayerViewModel;
    function Peer2PeerViewModel() {
        var that = this;

        BaseMultiplayerViewModel.call(that);

        that.opponentGuesses = ko.observableArray();

        that.secretNumber = ko.observable("");
        that.secretNumberAsArr = ko.computed(function () {
            return that.secretNumber().split("");
        });

        that.gameType(consts.gameType.PEER_2_PEER);

        that.bots = [],

        that.initSocket();

        that.ListGames();
    };

    Peer2PeerViewModel.prototype.initSocket = function () {
        var that = this;

        BaseMultiplayerViewModel.prototype.initSocket.call(that);

        that.socket.on(consts.events.GUESS_PEER_NUMBER_SERVER_EVENT, function (data) {
            $.proxy(that.onGuessPeerIncomingQuery(data), that);
        });

        that.socket.on(consts.events.GUESS_PEER_NUMBER_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGuessPeerNumberResponse(data), that);
        });

        that.socket.on(consts.events.GAME_OVER_PEER_SERVER_EVENT, function (data) {
            $.proxy(that.onGameOver(data), that);
        });
    }

    Peer2PeerViewModel.prototype.Guess = function () {
        var that = this;

        if (!that.isValidNumber()) {
            alert("Guess number cannot contain duplicating digits!");
            return;
        }

        that.socket.emit(consts.events.GUESS_PEER_NUMBER_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken,
            number: [that.number1(), that.number2(), that.number3(), that.number4()]
        }, function (data) {
            if (!data.success) {
                alert(data.msg);
            }
        });

        that.isMyTurn(false);
    }

    Peer2PeerViewModel.prototype.onGuessPeerIncomingQuery = function (data) {
        var that = this;

        var bullscows = { bulls: 0, cows: 0 };

        var r = that.checkGuessNumber(data.number);
        if (r.bulls == consts.consts.NUMBER_LENGH) {
            that.fireGameOver();
            return;
        }

        that.opponentGuesses.push("number: " + data.number.join('') + ", bulls: " + r.bulls + ", cows: " + r.cows);

        that.socket.emit(consts.events.GUESS_PEER_NUMBER_CLIENT_RESPONSE_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken,
            nickname: that.nickname(),
            success: true,
            number: data.number,
            bulls: r.bulls,
            cows: r.cows
        });
    }

    Peer2PeerViewModel.prototype.onGuessPeerNumberResponse = function (data) {
        var that = this;

        var bulls = data.bulls, cows = data.cows;
        var number = data.number;

        that.guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
    }

    Peer2PeerViewModel.prototype.fireGameOver = function () {
        var that = this;

        that.socket.emit(consts.events.GAME_OVER_PEER_CLIENT_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken,
            nickname: that.nickname(),
            number: that.secretNumberAsArr(),
            success: true
        });
    }

    Peer2PeerViewModel.prototype.onGameOver = function (data) {
        var that = this;

        that.isGameOver(true);
        that.isRunning(false);

        var nickname = data.nickname;

        var result = "Game over! ";

        if (nickname != that.nickname()) {
            result += "You win! Number is: " + data.number.join('');;
        } else {
            result += "You lose! Your opponent guessed your secret number!";
        }

        that.guesses.push(result);

        that.gameId = "";

        that.socket.removeAllListeners();
        that.socket.disconnect();
        that.socket = null;
    }

    Peer2PeerViewModel.prototype.checkGuessNumber = function (guessNumber) {
        var that = this;

        var bulls = 0, cows = 0;
        var secretNumArr = that.secretNumberAsArr();
            
        for (var i = 0; i < guessNumber.length; i++) {
            var num = guessNumber[i];
                
            var index = secretNumArr.indexOf(num.toString());
            if (index >= 0) {
                if (index == i) {
                    bulls++;
                } else {
                    cows++;
                }
            }
        }
            
        var res = 
         {
             bulls: bulls, cows: cows
         }
            
        return res;
    }

    return Peer2PeerViewModel;
});