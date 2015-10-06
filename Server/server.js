var Game = require("./game").Game;
var Player = require("./player").Player;
var Token = require("./token").Token;

var events = require("./consts").events;
var consts = require("./consts").consts;
var gameType = require("./consts").gameType;

//Server class is responsible for low level socket comunication
//and delegates most of the business logic to the Game and Player classes
var Server = (function () {
    var Server = function (io) {
        var that = this;

        that.io = io;
        that.runningGames = {};

        that.initSocketIO();
    };
    
    Server.prototype = {
        constructor: Server,
        
        initSocketIO: function () {
            var that = this;

            that.io.on('connection', function (socket) {
                socket.on(events.CREATE_GAME_EVENT, function (data, callback) {
                    that.createGame(socket, data, callback); //create channel with id = roomId
                });

                socket.on(events.JOIN_GAME_EVENT, function (data, callback) {
                    that.joinGame(socket, data, callback); //join channel with id = roomId
                });

                socket.on(events.START_GAME_EVENT, function (data, callback) {
                    that.startGame(socket, data, callback);
                });

                socket.on(events.LIST_GAMES_EVENT, function (data, callback) {
                    that.listGames(socket, data, callback);
                });

                socket.on(events.LIST_GAME_PLAYERS_EVENT, function (data, callback) {
                    that.listPlayers(socket, data, callback);
                });

                socket.on(events.SURRENDER_GAME_EVENT, function (data, callback) {
                    that.surrenderGame(socket, data, callback);
                });

                socket.on(events.GUESS_NUMBER_EVENT, function (data, callback) {
                    that.guessNumber(socket, data, callback);
                });

                socket.on(events.GUESS_PEER_NUMBER_EVENT, function (data, callback) {
                    that.guessPeerNumber(socket, data, callback);
                });

                socket.on(events.GUESS_PEER_NUMBER_CLIENT_RESPONSE_EVENT, function (data, callback) {
                    that.guessPeerNumberClientResponse(socket, data, callback);
                });

                socket.on(events.POST_NUMBER_EVENT, function (data) {
                    that.postSecretNumber(socket, data);
                });

                socket.on(events.CHECK_NICKNAME_EXISTS_EVENT, function (data, callback) {
                    that.checkNicknameExists(socket, data, callback);
                });

                socket.on(events.GAME_OVER_PEER_CLIENT_EVENT, function (data) {
                    that.gameOverPeerClient(socket, data);
                });
            });
        },
        
        ensureGame: function (socket, gameId, callback) {
            var that = this;

            var game = that.runningGames[gameId];
            if (!game) {
                if (callback) {
                    callback({
                        success: false,
                        msg: consts.GAME_NOT_FOUND_MSG
                    });
                }
                return false;
            }

            return true;
        },
        
        ensurePlayer: function(socket, game, playerToken, callback) {
            var that = this;

            var player = game.getPlayerByTokenKey(playerToken);
            if (!player) {
                if (callback) {
                    callback({
                        success: false,
                        msg: consts.PLAYER_NOT_FOUND_MSG
                    });
                }
                return false;
            }

            return true;
        },
        
        //creates new game with one player, the game creator
        //this method has public access, everyone is allowed to call it
        createGame: function (socket, data, callback) {
            var that = this;

            try {
                var game = new Game(data.name, data.type);
                var player = game.createPlayer(data.nickname, true);
                game.addPlayer(player);
                
                that.runningGames[game.id] = game;
                
                socket.join(game.id)
                
                if (callback) {
                    callback({
                        success: true,
                        gameId: game.id, 
                        playerToken: player.token.key,
                        name: game.name,
                        msg: consts.CREATED_GAME_SUCCESS_MSG
                    });
                }
            }
            catch (e) {
                if (callback) {
                    callback({
                        success: false,
                        msg: consts.CREATED_GAME_ERROR_MSG + " " + e
                    });
                }
            }
        },
        
        //starts an existing game        
        //this method has private access, only game creator is allowed to call it
        startGame: function (socket, data, callback) {
            var that = this;

            var gameId = data.gameId;
            var playerToken = data.playerToken;
            
            if (!that.ensureGame(socket, gameId, callback)) return;
            
            var game = that.runningGames[gameId];
            if (!that.ensurePlayer(socket, game, playerToken, callback)) return;
            
            game.start();
            
            if (callback) {
                callback({
                    success: true,
                    msg: consts.STARTED_GAME_SUCCESS_MSG
                });
            
                //send PLAYER_TURN_SERVER_EVENT to all the players of the room
                var player = game.getNextTurnPlayer();
                
                that.io.to(game.id).emit(events.PLAYER_TURN_SERVER_EVENT, {
                    nickname: player.nickname
                });
            }
            
            if (game.type != gameType.SINGLE_PLAYER) {
                that.io.to(game.id).emit(events.GAME_STARTED_SERVER_EVENT, {
                    success: true,
                    msg: consts.STARTED_GAME_SUCCESS_MSG
                });
            }
        },

        //surrenders an existing game
        //this method has private access, only game creator is allowed to call it
        surrenderGame: function (socket, data, callback) {
            var that = this;

            var gameId = data.gameId;
            var playerToken = data.playerToken;
            
            if (!that.ensureGame(socket, gameId, callback)) return;

            var game = that.runningGames[gameId];
            if (!that.ensurePlayer(socket, game, playerToken, callback)) return;

            var player = game.getPlayerByTokenKey(playerToken);
            if (callback) {
                if (!player.isGameCreator) {
                    callback({
                        success: false,
                        msg: consts.SURRENDER_GAME_ERROR_MSG
                    });
                    return;
                } else {
                    callback({
                        success: true,
                        msg: "OK!"
                    });
                }
            }
            that.gameOver(socket, gameId, false);
        },
        
        //tries to guess the secret number
        //this method has private access, only players joined the current game are allowed to call it
        //additionaly, in mutiplayer mode, only the player who is on move is allowed to call the method
        guessNumber: function (socket, data, callback) {
            var that = this;

            var gameId = data.gameId;
            var playerToken = data.playerToken;
            var guessNum = data.number;
            
            if (!that.ensureGame(socket, gameId, callback)) return;
            
            var game = that.runningGames[gameId];
            if (!that.ensurePlayer(socket, game, playerToken, callback)) return;

            var player = game.getPlayerByTokenKey(playerToken);

            if (player != game.getCurrentTurnPlayer()) {
                callback({
                    success: false,
                    msg: "It is not your turn!"
                });
                return;
            }
            
            if (game.numberOfMoves == consts.NUMBER_OF_ALLOWED_MOVES) {
                that.gameOver(socket, gameId, false);
                
                return;
            }
            
            var bullscows = game.checkGuessNumber(player, guessNum);
            if (bullscows.bulls == consts.NUMBER_SIZE) {
                that.gameOver(socket, gameId, true);
                
                return;
            }
            
            if (callback) {
                callback({
                    nickname: player.nickname,
                    success: true,
                    number: guessNum, 
                    bulls: bullscows.bulls, 
                    cows: bullscows.cows
                });

                if (game.type == gameType.MULTIPLAYER || game.type == gameType.PEER_2_PEER) {
                    that.io.to(game.id).emit(events.GUESS_NUMBER_SERVER_EVENT, { //send GUESS_NUMBER_SERVER_EVENT so all players can see the current player turn
                        nickname: player.nickname,
                        success: true,
                        number: guessNum, 
                        bulls: bullscows.bulls, 
                        cows: bullscows.cows
                    });
                }

                //send PLAYER_TURN_SERVER_EVENT to all the players of the room
                var nextTurnPlayer = game.getNextTurnPlayer();
                
                that.io.to(game.id).emit(events.PLAYER_TURN_SERVER_EVENT, {
                    nickname: nextTurnPlayer.nickname
                });
            }
        },
        
        guessPeerNumber: function (socket, data, callback) {
            var that = this;
            
            var gameId = data.gameId;
            var playerToken = data.playerToken;
            var guessNum = data.number;
            
            if (!that.ensureGame(socket, gameId, callback)) return;
            
            var game = that.runningGames[gameId];
            if (!that.ensurePlayer(socket, game, playerToken, callback)) return;
            
            var player = game.getPlayerByTokenKey(playerToken);
            
            if (player != game.getCurrentTurnPlayer()) {
                callback({
                    success: false,
                    msg: "It is not your turn!"
                });
                return;
            }
            
            socket.broadcast.to(game.id).emit(events.GUESS_PEER_NUMBER_SERVER_EVENT, {
                number: data.number
            });
        },
        
        guessPeerNumberClientResponse: function (socket, data, callback) {
            var that = this;

            var gameId = data.gameId;
            var playerToken = data.playerToken;

            if (!that.ensureGame(socket, gameId, callback)) return;
            
            var game = that.runningGames[gameId];
            if (!that.ensurePlayer(socket, game, playerToken, callback)) return;
            
            socket.broadcast.to(game.id).emit(events.GUESS_PEER_NUMBER_RESPONSE_EVENT, {
                number: data.number,
                bulls: data.bulls,
                cows: data.cows
            });

            var nextTurnPlayer = game.getNextTurnPlayer();

            that.io.to(game.id).emit(events.PLAYER_TURN_SERVER_EVENT, {
                nickname: nextTurnPlayer.nickname
            });
        },
        
        //joins a player to an existing game
        //this method has public access, everyone is allowed to call it
        joinGame: function (socket, data, callback) {
            var that = this;

            var gameId = data.gameId;
            var game = that.runningGames[gameId];
            if (!game) {
                if (callback) {
                    callback({ success: false, msg: consts.JOIN_GAME_ERROR});
                }

                return;
            }
            
            var nickname = data.nickname;
            var player = game.createPlayer(nickname, false);
            
            try {
                game.addPlayer(player);
            }
            catch (e) {
                if (callback) {
                    callback({ success: false, msg: e});
                }
                return;
            }
            
            socket.join(game.id);
            
            if (callback) {
                callback({
                    success: true,
                    gameId: gameId,
                    playerToken: player.token.key,
                    nickname: player.nickname,
                    msg: consts.JOIN_GAME_SUCCESS
                });
            }

            that.io.to(game.id).emit(events.JOIN_GAME_SERVER_EVENT, {
                success: true,
                gameId: gameId,
                playerToken: player.token.key,
                nickname: player.nickname,
                msg: consts.JOIN_GAME_SUCCESS
            });
        },
        
        //lists all available non-runing, multiplayer games
        //this method has public access, everyone is allowed to call it
        listGames: function (socket, data, callback) {
            var that = this;

            var type = data.type;
            var gamesList = [];

            for (var id in that.runningGames) {
                var game = that.runningGames[id];

                if (game.isStarted || game.type != type) continue;

                gamesList.push({
                    id: game.id,
                    name: game.name
                });
            }
            
            if (callback) {
                callback({
                    success: true,
                    gamesList: gamesList,
                    msg: "OK"
                });
            }
        },
        
        //lists all players who join the current game
        //this method has private access, only the creator of the current game is allowed to call it
        listPlayers: function (socket, data, callback) {
            var that = this;

            var gameId = data.gameId;
            var playerToken = data.playerToken;
            
            if (!that.ensureGame(socket, gameId, callback)) return;
            
            var game = that.runningGames[gameId];
            if (!that.ensurePlayer(socket, game, playerToken, callback)) return;
            
            var player = game.getPlayerByTokenKey(playerToken);
            if (!player.isGameCreator) {
                if (callback) {
                    callback({
                        success: false,
                        msg: "Only the creator of the game is allowed to list the game's players!"
                    });
                }
                return;
            }

            var players = [];
            
            for (var i = 0; i < game.players.length; i++) {
                players.push(game.players[i].nickname);
            }
            
            if (callback) {
                callback({
                    success: true,
                    msg: "OK!",
                    players: players
                });
            }
        }, 
        
        checkNicknameExists: function(socket, data, callback) {
            var that = this;

            var gameId = data.gameId;
            var nickname = data.nickname;

            if (!that.ensureGame(socket, gameId, callback)) return;
            
            var game = that.runningGames[gameId];
            var exists = game.nicknameExists(nickname);
            
            if (callback) {
                callback({
                    success: true,
                    msg: "This nickname is already in use!",
                    exists: exists
                });
            }
        },
        
        gameOver: function (socket, gameId, win) {
            var that = this;

            var game = that.runningGames[gameId];
            that.io.to(game.id).emit(events.GAME_OVER_EVENT, { gameId: gameId, number: game.secretNumber, win: win });
            
            that.runningGames[gameId] = null;
            delete that.runningGames[gameId];
        },

        gameOverPeerClient: function (socket, data) {
            var that = this;

            var gameId = data.gameId;
            var game = that.runningGames[gameId];

            that.io.to(game.id).emit(events.GAME_OVER_PEER_SERVER_EVENT, { gameId: gameId, nickname: data.nickname, number: data.number });

            that.runningGames[gameId] = null;
            delete that.runningGames[gameId];
        }
    };
    
    return Server;
})();

exports.Server = Server;