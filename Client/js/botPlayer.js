var BotPlayer = (function () {
    var consts = {
        SERVER_ADDRESS: "localhost:1337",
        NUMBER_LENGH: 4
    };

    var that;

    var BotPlayer = function (viewModel, socket, gameId, nickname, playerToken) {
        that = this;

        that.viewModel = viewModel;
        that.socket = socket;
        that.gameId = gameId;
        that.playerToken = playerToken;
        that.nickname = nickname ? nickname : "botPlayer_" + Date().getTime();;

        that.socket.on("guess number response", function (data) {
            that.onGuessResponse(data);
        });

        that.socket.on("player turn", function (data) {
            that.onPlayerTurn(data);
        });

        that.answers = that.getPermutations(consts.NUMBER_LENGH, "123456789");
        that.answers = that.shuffle(that.answers);
    };

    BotPlayer.prototype = {
        constructor: BotPlayer,

        joinGame: function(gameId) {
            socket.emit("join game", { //TODO: refactor (extract const)
                gameId: gameId,
                nickname: that.nickname
            });
        },

        onGameJoined: function (data) {
            var success = data.success;
            if (!success) {
                return;
            }

            //bug: nickname can be changed from server if there is another user with the same nickname!
            if (that.nickname == data.nickname) { //current user has joined the game, go to step 2
                that.gameId = data.gameId;
                that.playerToken = data.playerToken;
            }
        },

        onPlayerTurn: function (data) {
            if (data.nickname == that.nickname) {

                that.viewModel.showThinkingProgress(true);
                setTimeout(function () {
                    that.viewModel.showThinkingProgress(false);
                    that.guess();
                }, 1500);
            }
        },

        guess: function () {
            var guessNum = that.answers[0];
            var arr = guessNum.split('');

            that.socket.emit("guess number", {
                gameId: that.gameId,
                playerToken: that.playerToken,
                number: [arr[0], arr[1], arr[2], arr[3]]
            });
        },

        onGuessResponse: function (data) {
            var gameId = data.gameId;
            var bulls = data.bulls, cows = data.cows;
            var number = data.number;

            that.reduceAnswers(that.answers[0], bulls, cows);

            that.viewModel.onGuessResponse(data);
        },

        reduceAnswers: function (guess, bulls, cows) {
            for (var i = that.answers.length - 1; i >= 0; i--) {
                var tb = 0, tc = 0;
                for (var ix = 0; ix < consts.NUMBER_LENGH; ix++)
                    if (that.answers[i][ix] == guess[ix])
                        tb++;
                    else if (that.answers[i].indexOf(guess[ix]) >= 0)
                        tc++;
                if ((tb != bulls) || (tc != cows))
                    that.answers.splice(i, 1);
            }
        },

        getPermutations: function (n, word) {
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
})();