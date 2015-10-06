define(["jquery", "js/consts"], function ($, consts) {
    function BotPlayer(viewModel, socket, gameId, nickname, playerToken) {
        var that = this;

        that.viewModel = viewModel;
        that.socket = socket;
        that.gameId = gameId;
        that.playerToken = playerToken;
        that.nickname = nickname ? nickname : "botPlayer_" + new Date().getTime();

        that.socket.on(consts.events.PLAYER_TURN_SERVER_EVENT, function (data) {
            $.proxy(that.onPlayerTurn(data), that);
        });

        that.answers = that.getPermutations(consts.consts.NUMBER_LENGH, "123456789");
        that.answers = that.shuffle(that.answers);
    };

    BotPlayer.prototype = {
        constructor: BotPlayer,

        joinGame: function (gameId) {
            var that = this;

            that.socket.emit(consts.events.JOIN_GAME_EVENT,
                {
                    gameId: gameId,
                    nickname: that.nickname
                },
                function (data) {
                    that.onGameJoined.call(that, data);
                }
            );
        },

        onGameJoined: function (data) {
            var that = this;
            var success = data.success;

            if (!success) {
                return;
            }

            if (that.nickname == data.nickname) {
                that.gameId = data.gameId;
                that.playerToken = data.playerToken;
            }
        },

        onPlayerTurn: function (data) {
            var that = this;

            if (data.nickname == that.nickname) {
                that.guess();
            }
        },

        guess: function () {
            var that = this;
            var guessNum = that.answers[0];
            var arr = guessNum.split('');

            that.socket.emit(consts.events.GUESS_NUMBER_EVENT,
                {
                    gameId: that.gameId,
                    playerToken: that.playerToken,
                    number: [arr[0], arr[1], arr[2], arr[3]]
                },
                function (data) {
                    that.onGuessResponse.call(that, data);
                }
            );
        },

        onGuessResponse: function (data) {
            var that = this;
            var gameId = data.gameId;
            var bulls = data.bulls, cows = data.cows;
            var number = data.number;

            that.reduceAnswers(number.join(''), bulls, cows);

            if (that.viewModel) {
                that.viewModel.onGuessResponse(data);
            }
        },

        reduceAnswers: function (guess, bulls, cows) {
            var that = this;

            for (var i = that.answers.length - 1; i >= 0; i--) {
                var tb = 0, tc = 0;
                for (var ix = 0; ix < consts.consts.NUMBER_LENGH; ix++)
                    if (that.answers[i][ix] == guess[ix])
                        tb++;
                    else if (that.answers[i].indexOf(guess[ix]) >= 0)
                        tc++;
                if ((tb != bulls) || (tc != cows))
                    that.answers.splice(i, 1);
            }
        },

        getPermutations: function (n, word) {
            var that = this;

            var tmpPermutation = [];

            if (!word || word.length == 0 || n <= 0) {
                tmpPermutation.push("");
            }
            else {
                for (var i = 0; i < word.length; i++) {
                    var tmpWord = word.substr(0, i) + word.substr(i + 1);
                    var perms = that.getPermutations(n - 1, tmpWord);
                    for (var j = 0; j < perms.length; j++) {
                        var item = perms[j];
                        tmpPermutation.push(word[i] + item);
                    }
                }
            }

            return tmpPermutation;
        },

        //Fisher–Yates Shuffle
        shuffle: function (array) {
            var that = this;

            var m = array.length, t, i;

            // While there remain elements to shuffle…
            while (m) {

                // Pick a remaining element…
                i = Math.floor(Math.random() * m--);

                // And swap it with the current element.
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }

            return array;
        }
    };

    return BotPlayer;
});