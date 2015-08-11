﻿(function () {
    var consts = {
        CREATED_GAME_SUCCESS_MSG: "A new game has been created!",
        CREATED_GAME_ERROR_MSG: "An error occured while creating a game!",
    
        STARTED_GAME_SUCCESS_MSG: "A new game has been started!",
    
        JOIN_GAME_SUCCESS_MSG: "New player has joind the game!",
        JOIN_GAME_ERROR_MSG: "The game you are trying to join does not exists or just expired!",
        SURRENDER_GAME_ERROR_MSG: "You are trying to surrender the game by using an invalid nickname or you are not the creator of the game! Only game creators are allowed to surrender it!",
    
        GAME_NOT_FOUND_MSG: "Game does not exist or has been expired!",
        PLAYER_NOT_FOUND_MSG: "Player does not exist or has been expired!",

        NUMBER_SIZE: 4,
        EXPIRATION_TIME_MINUTES: 120 
    };

    exports.consts = consts;

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
        LIST_GAMES_RESPONSE_EVENT: "list games response",
    
        LIST_GAME_PLAYERS_EVENT: "list players",
        LIST_GAME_PLAYERS_RESPONSE_EVENT: "list players response",
    
        POST_NUMBER_EVENT: "post number",
        POST_NUMBER_RESPONSE_EVENT: "post number response",
    
        PLAYER_TURN_SERVER_EVENT: "player turn",
    
        CHECK_NICKNAME_EXISTS_EVENT: "nickname exists",
        CHECK_NICKNAME_EXISTS_RESPONSE_EVENT: "nickname exists response"
    };
    exports.events = events;

    var gameType = {
        SINGLE_PLAYER: 0,
        MULTIPLAYER: 1,
        PEER_2_PEER: 2
    }

    exports.gameType = gameType;
})();