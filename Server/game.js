var Player = require("./player").Player;
var Token = require("./token").Token;

var consts = require("./consts").consts;
var gameType = require("./consts").gameType;

var uuid = require('uuid');

var Game = (function () {
    var Game = function (name, type) {
        var that = this;

        that.id = uuid.v4();

        that.name = name;
        that.type = type;
        
        that.secretNumber = generateSecretNumber();

        that.numberOfMoves = 0;
        that.currentPlayerIndex = -1;
        that.players = [];

        that.isStarted = false;
    };
    
    Game.prototype = {
        constructor: Game,
        
        createPlayer: function(nickname, isGameCreator) {
            var that = this;

            var nick = that.ensureNickname(nickname);
            
            var expirationTime = new Date().getTime() + consts.EXPIRATION_TIME_MINUTES * 60 * 1000;

            var token = new Token(uuid.v4(), new Date(expirationTime));

            return new Player(nick, token, isGameCreator);
        },

        addPlayer: function (player) {
            var that = this;

            if (!player) return;
            
            if (that.type == gameType.SINGLE_PLAYER) {
                if (that.players.length == 1) {
                    throw new Error("This game is a single player game. No more that one player can join it!");
                }
            }

            that.players.push(player);
        },

        removePlayer: function (nickname) {
            //TODO:
        },
        
        getPlayerByTokenKey: function (tokenKey) {
            var that = this;

            for (var i = 0; i < that.players.length; i++) {
                var player = that.players[i];
                
                if (player.token.key === tokenKey) {
                    return player;
                }
            }

            return null;
        },

        nicknameExists: function (nickname) {
            var that = this;

            for (var i = 0; i < that.players.length; i++) {
                if (nickname == that.players[i].nickname) {
                    return true;
                }
            }

            return false;
        },

        ensureNickname: function (nickname) {
            var that = this;

            if (!nickname) {
                nickname = "guest";
            }

            var suffix = 2;
            while (that.nicknameExists(nickname)) {
                nickname += suffix;
                suffix++;
            }

            return nickname;
        },
        
        getCurrentTurnPlayer: function () {
            var that = this;
            
            if (that.type == gameType.SINGLE_PLAYER) {
                if (that.players.length > 0) {
                    return that.players[0];
                } else {
                    return null;
                }
            }
            
            if (that.currentPlayerIndex == -1) {
                return null;
            }            
            
            return that.players[that.currentPlayerIndex];
        },

        getNextTurnPlayer: function () {
            var that = this;
            
            if (that.type == gameType.SINGLE_PLAYER) {
                return that.getCurrentTurnPlayer();
            }
            
            if (that.currentPlayerIndex == that.players.length - 1) {
                that.currentPlayerIndex = 0;
            } else {
                that.currentPlayerIndex++;
            }
            
            return that.players[that.currentPlayerIndex];
        },

        start: function () {
            var that = this;

            that.isStarted = true;
        },
    
        checkGuessNumber: function (player, guessNumber) {
            var that = this;

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
        var that = this;

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