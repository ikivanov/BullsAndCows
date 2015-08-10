﻿var Game = require("./game").Game;
var Player = require("./player").Player;
var Token = require("./token").Token;

//Server class is responsible for low level socket comunication
//and delegates most of the business logic to the Game and Player classes
var Server = (function () {
    var that;
    
    var consts = {
        CREATED_GAME_SUCCESS_MSG: "A new game has been created!",
        CREATED_GAME_ERROR_MSG: "An error occured while creating a game!",

        STARTED_GAME_SUCCESS_MSG: "A new game has been started!",
        
        JOIN_GAME_SUCCESS_MSG: "New player has joind the game!",
        JOIN_GAME_ERROR_MSG: "The game you are trying to join does not exists or just expired!",
        SURRENDER_GAME_ERROR_MSG: "You are trying to surrender the game by using an invalid nickname or you are not the creator of the game! Only game creators are allowed to surrender it!",

        GAME_NOT_FOUND_MSG: "Game does not exist or has been expired!",
        PLAYER_NOT_FOUND_MSG: "Player does not exist or has been expired!"
    };
    
    var events = {
        CREATE_GAME_EVENT: "create game",
        CREATE_GAME_RESPONSE_EVENT: "create game response",
        
        START_GAME_EVENT: "start game",
        START_GAME_RESPONSE_EVENT: "start game response",

        SURRENDER_GAME_EVENT: "surrender game",
        SURRENDER_GAME_RESPONSE_EVENT: "surrender game response",

        GUESS_NUMBER_EVENT: "guess number",
        GUESS_NUMBER_RESPONSE_EVENT: "guess number response",
        
        GAME_OVER_EVENT: "game over",

        JOIN_GAME_EVENT: "join game",
        JOIN_GAME_RESPONSE_EVENT: "join game response",

        LIST_GAMES_EVENT: "list games",
        LIST_GAME_RESPONSE_EVENT: "list games response",

        POST_NUMBER_EVENT: "post number",
        POST_NUMBER_RESPONSE_EVENT: "post number response"
    };

    var Server = function (io) {
        that = this;

        this.io = io;
        this.runningGames = {};

        this.initSocketIO();
    };
    
    Server.prototype = {
        constructor: Server,
        
        initSocketIO: function () {
            var that = this;

            that.io.on('connection', function (socket) {
                socket.on(events.CREATE_GAME_EVENT, function (data) {
                    that.createGame(socket, data);
                });

                socket.on(events.JOIN_GAME_EVENT, function (data) {
                    that.joinGame(socket, data);
                });

                socket.on(events.START_GAME_EVENT, function (data) {
                    that.startGame(socket, data);
                });

                socket.on(events.LIST_GAMES_EVENT, function (data) {
                    that.listGames(socket, data);
                });

                socket.on(events.SURRENDER_GAME_EVENT, function (data) {
                    that.surrenderGame(socket, data);
                });

                socket.on(events.GUESS_NUMBER_EVENT, function (data) {
                    that.guessNumber(socket, data);
                });

                socket.on(events.POST_NUMBER_EVENT, function (data) {
                    that.postSecretNumber(socket, data);
                });
            });
        },
        
        ensureGame: function (socket, gameId, eventName) {
            var game = that.runningGames[gameId];
            if (!game) {
                socket.emit(eventName, {
                    success: false,
                    msg: consts.GAME_NOT_FOUND_MSG
                });
                return false;
            }

            return true;
        },
        
        ensurePlayer: function(socket, game, playerToken, eventName) {
            var player = game.getPlayerByTokenKey(playerToken);
            if (!player) {
                socket.emit(eventName, {
                    success: false,
                    msg: consts.PLAYER_NOT_FOUND_MSG
                });
                return false;
            }

            return true;
        },
        
        //creates new game with one player, the game creator
        //this method has public access, everyone is allowed to call it
        createGame: function (socket, data) {
            try {
                var game = new Game(data.name, data.type);
                var player = game.createPlayer(data.nickname, true);
                game.addPlayer(player);
                
                that.runningGames[game.id] = game;
                
                socket.emit(events.CREATE_GAME_RESPONSE_EVENT, {
                    success: true,
                    gameId: game.id, 
                    playerToken: player.token.key,
                    name: game.name,
                    msg: consts.CREATED_GAME_SUCCESS_MSG
                });
            }
            catch (e) {
                socket.emit(events.CREATE_GAME_RESPONSE_EVENT, {
                    success: false,
                    msg: consts.CREATED_GAME_ERROR_MSG + " " + e
                });
            }
        },
        
        //starts an existing game        
        //this method has private access, only game creator is allowed to call it
        startGame: function (socket, data) {
            var gameId = data.gameId;
            var playerToken = data.playerToken;
            
            if (!that.ensureGame(socket, gameId, events.START_GAME_RESPONSE_EVENT)) return;
            
            var game = this.runningGames[gameId];
            if (!that.ensurePlayer(socket, game, playerToken, events.START_GAME_RESPONSE_EVENT)) return;
            
            socket.emit(events.START_GAME_RESPONSE_EVENT, {
                success: true,
                msg: consts.STARTED_GAME_SUCCESS_MSG
            });
        },

        //surrenders an existing game
        //this method has private access, only game creator is allowed to call it
        surrenderGame: function (socket, data) {
            var gameId = data.gameId;
            var playerToken = data.playerToken;
            
            if (!that.ensureGame(socket, gameId, events.SURRENDER_GAME_RESPONSE_EVENT)) return;

            var game = this.runningGames[gameId];
            if (!that.ensurePlayer(socket, game, playerToken, events.SURRENDER_GAME_RESPONSE_EVENT)) return;

            var player = game.getPlayerByTokenKey(playerToken);
            if (!player.isGameCreator) {
                socket.emit(events.SURRENDER_GAME_RESPONSE_EVENT, {
                    success: false,
                    msg: consts.SURRENDER_GAME_ERROR_MSG
                });
                return;
            }
            
            that.gameOver(socket, gameId, false);
        },
        
        //tries to guess the secret number
        //this method has private access, only players joined the current game are allowed to call it
        //additionaly, in mutiplayer mode, only the player who is on move is allowed to call the method
        guessNumber: function (socket, data) {
            var gameId = data.gameId;
            var playerToken = data.playerToken;
            var guessNum = data.number;
            
            if (!that.ensureGame(socket, gameId, events.GUESS_NUMBER_RESPONSE_EVENT)) return;
            
            var game = this.runningGames[gameId];
            if (!that.ensurePlayer(socket, game, playerToken, events.GUESS_NUMBER_RESPONSE_EVENT)) return;

            var player = game.getPlayerByTokenKey(playerToken);

            if (!game.isPlayerTurn(player)) {
                socket.emit(events.GUESS_NUMBER_RESPONSE_EVENT, {
                    success: false,
                    msg: "It is not your turn!"
                });
                return;
            }
            
            if (game.numberOfMoves == 10) {
                that.gameOver(socket, gameId, false);
                
                return;
            }
            
            var bullscows = game.checkGuessNumber(guessNum);
            if (bullscows.bulls == 4) {
                that.gameOver(socket, gameId, true);
                
                return;
            }
            
            socket.emit(events.GUESS_NUMBER_RESPONSE_EVENT, {
                success: true,
                number: guessNum, 
                bulls: bullscows.bulls, 
                cows: bullscows.cows
            });
        },
        
        //================================================

        //joins a player to an existing game
        //this method has public access, everyone is allowed to call it
        joinGame: function (socket, data) {
            var gameId = data.gameId;
            var game = that.runningGames[gameId];
            if (!game) {
                socket.emit(events.JOIN_GAME_ERROR_RESULT_EVENT, {
                    msg: consts.JOIN_GAME_ERROR
                });

                return;
            }
            
            var player = game.createPlayer(nickname, false);
            
            try {
                game.addPlayer(player);
            }
            catch (e) {
                socket.emit(events.JOIN_GAME_ERROR_RESULT_EVENT, {
                    msg: e
                });
                return;
            }

            socket.emit(events.JOIN_GAME_SUCCESS_RESULT_EVENT, {
                msg: consts.JOIN_GAME_SUCCESS
            });
        },
        
        //lists all available games
        //this method has public access, everyone is allowed to call it
        listGames: function (socket, data) {
            //TODO:
        },
        
        //posts a secret number, this method is relevant for Peer 2 Peer game mode only
        //this method has private access, only players joined the current game are allowed to call it
        postSecretNumber: function (socket, data) {
            //TODO:
        },
        
        //leaves the current game        
        //this method has private access, only players joined the current game are allowed to call it
        leaveGame: function (socket, data) {
            //TODO:
        },

        //destroys the current game
        //this method has private access, only game creator is allowed to call it
        destroyGame: function (socket, data) {
            //TODO:
        },

        gameOver: function (socket, gameId, win) {
            var game = this.runningGames[gameId];
            socket.emit(events.GAME_OVER_EVENT, { gameId: gameId, number: game.secretNumber, win: win });
            
            this.runningGames[gameId] = null;
            delete this.runningGames[gameId];
        }
    };
    
    return Server;
})();

exports.Server = Server;