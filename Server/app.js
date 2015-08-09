var http = require('http');
var port = process.env.port || 1337;

var uuid = require('uuid');

var app = http.createServer(function (req, res) {
    res.end();
});

var io = require('socket.io')(app);

app.listen(port);

var runningGames = {};

var NUMBER_SIZE = 4;

var generateSecretNumber = function () {
    var result = [];
    
    for (var i = 0; i < NUMBER_SIZE; i++) {
        
        while (true) {
            var num = Math.floor((Math.random() * 9) + 1);

            if (result.indexOf(num) == -1) {
                result.push(num);
                break;
            } else {
                continue;
            }
        }
    }

    return result;
}

var checkGuessNumber = function (game, guessNumber) {
    var bulls = 0, cows = 0;
    var secretNum = game.number;
    
    for (var i = 0; i < guessNumber.length; i++) {
        var num = parseInt(guessNumber[i]);

        var index = secretNum.indexOf(num);
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

var gameOver = function (socket, gameId, win) {
    var game = runningGames[gameId];
    socket.emit('game over', { gameId: gameId, number: game.number, win: win });
        
    runningGames[gameId] = null;
    delete runningGames[gameId];
        
    return;
}

io.on('connection', function (socket) {
    socket.on('start new game', function (data) {
        var gameId = uuid.v4();
        var number = generateSecretNumber();
        runningGames[gameId] = {
            moves: 0,
            number: number
        };

        socket.emit('game started', {gameId: gameId, msg: "A new game has been started!"});
    });

    socket.on('game surrender', function (data) {
        var gameId = data.gameId;
        
        gameOver(socket, gameId, false);
    });

    socket.on('guess', function (data) {
        var gameId = data.gameId;
        var guessNum = data.number;

        var game = runningGames[gameId];
        if (game && game.moves++ >= 10) {
            gameOver(socket, gameId, false);

            return;
        }

        var bullscows = checkGuessNumber(game, guessNum);
        if (bullscows.bulls == 4) {
            gameOver(socket, gameId, true);

            return;
        }

        socket.emit('guess response', { gameId: gameId, number: guessNum, bulls: bullscows.bulls, cows: bullscows.cows });
    });
});