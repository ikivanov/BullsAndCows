var Player = require("./player").Player;
var Token = require("./token").Token;

var uuid = require('uuid');

var gameType = {
    SINGLE_PLAYER: 0,
    MULTIPLAYER: 1,
    PEER_2_PEER: 2
}

exports.gameType = gameType;

var consts = {
    NUMBER_SIZE: 4,
    EXPIRATION_TIME_MINUTES: 120 
};

var Game = (function () {
    var that;

    var Game = function (name, type) {
        that = this;

        this.id = uuid.v4();

        this.name = name;
        this.type = type;
        
        this.secretNumber = generateSecretNumber();

        this.numberOfMoves = 0;
        this.currentPlayer = 0;
        this.players = [];

        this.isStarted = false;
    };
    
    Game.prototype = {
        constructor: Game,
        
        createPlayer: function(nickname, isGameCreator) {
            var nick = that.ensureNickname(nickname);
            
            var expirationTime = new Date().getTime() + consts.EXPIRATION_TIME_MINUTES * 60 * 1000;

            var token = new Token(uuid.v4(), new Date(expirationTime));

            return new Player(nick, token, isGameCreator);
        },

        addPlayer: function (player) {
            if (!player) return;
            
            if (this.type == gameType.SINGLE_PLAYER) {
                if (this.players.length == 1) {
                    throw new Error("This game is a single player game. No more that one player can join it!");
                }
            }

            this.players.push(player);
        },

        removePlayer: function (nickname) {
            //TODO:
        },
        
        getPlayerByTokenKey: function (tokenKey) {
            for (var i = 0; i < this.players.length; i++) {
                var player = this.players[i];
                
                if (player.token.key === tokenKey) {
                    return player;
                }
            }

            return null;
        },

        nicknameExists: function (nickname) {
            for (var i = 0; i < that.players.length; i++) {
                if (nickname == that.players[i].nickname) {
                    return true;
                }
            }

            return false;
        },

        ensureNickname: function (nickname) {
            if (!nickname) {
                nickname = "guest";
            }

            var suffix = 2;
            while (that.nicknameExists(nickname)) {
                nickname + suffix;
                suffix++;
            }

            return nickname;
        },
        
        isPlayerTurn: function (player) {
            //TODO: implement
            return true;
        },

        start: function () {
            this.isStarted = true;
        },
    
        checkGuessNumber: function (guessNumber) {
            var bulls = 0, cows = 0;
            
            for (var i = 0; i < guessNumber.length; i++) {
                var num = parseInt(guessNumber[i]);
                
                var index = that.secretNumber.indexOf(num);
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
            
            that.numberOfMoves++;
            
            return res;
        }
    };
    
    var generateSecretNumber = function () {
        var result = [];
        
        for (var i = 0; i < consts.NUMBER_SIZE; i++) {
            
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
    
    return Game;
})();

exports.Game = Game;