var ComputerVsComputerViewModel = (function () {
    var consts = {
        SERVER_ADDRESS: "localhost:1337",
        NUMBER_LENGH: 4
    };

    var that, socket;

    var ComputerVsComputerViewModel = function () {
        that = this;

        that.isRunning = ko.observable(false);
        that.guesses = ko.observableArray();
        that.isThinking = ko.observable(false);

        socket = io(consts.SERVER_ADDRESS);

        that.gameId = "";

        socket.on("game started", function (data) {
            that.onGameStarted(data);
        });

        socket.on("game over", function (data) {
            that.onGameOver(data);
        });

        socket.on("guess response", function (data) {
            that.onGuessResponse(data);
        });
    };

    ComputerVsComputerViewModel.prototype = {
        constructor: ComputerVsComputerViewModel,

        isRunning: ko.observable(false),
        guesses: ko.observableArray(),
        answers: [],

        onGameStarted: function (data) {
            that.isRunning(true);
            that.gameId = data.gameId;
            that.guesses.removeAll();

            that.answers = that.getPermutations(consts.NUMBER_LENGH, "123456789");
            that.answers = that.shuffle(that.answers);

            that.guess();
        },

        onGameOver: function (data) {
            that.isRunning(false);
            var winStr = data.win ? "win" : "lose";
            var result = "Game over! You " + winStr + "! Number is: " + data.number.join('');
            that.guesses.push(result);

            that.gameId = "";
        },

        onGuessResponse: function (data) {
            var gameId = data.gameId;
            var bulls = data.bulls, cows = data.cows;
            var number = data.number;

            that.guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);

            that.reduceAnswers(that.answers[0], bulls, cows);

            setTimeout(function () {
                that.guess();
            }, 1000);
        },

        guess: function () {
            var guessNum = that.answers[0];
            var arr = guessNum.split('');

            that.isThinking(true);
            setTimeout(function () {
                that.isThinking(false);
                socket.emit("guess", { gameId: that.gameId, number: [arr[0], arr[1], arr[2], arr[3]] });
            }, 1500);
        },

        reduceAnswers: function(guess, bulls, cows) {
            for (var i = that.answers.length - 1; i >= 0; i--)
            {
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

            if (!word || word.length == 0 || n <= 0)
            {
                tmpPermutation.push("");
            }
            else
            {
                for (var i = 0; i < word.length; i++)
                {
                    var tmpWord = word.substr(0, i) + word.substr(i + 1);
                    var perms = that.getPermutations(n - 1, tmpWord);
                    for (var j = 0; j < perms.length; j++)
                    {
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
        },

        StartNewGame: function () {
            socket.emit("start new game", {});
        }
    };

    return ComputerVsComputerViewModel;
})();