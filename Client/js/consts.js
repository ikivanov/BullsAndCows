define(function () {
    var c = {
        config: {
            SERVER_ADDRESS: "localhost:8080"
        },

        consts: {
            NUMBER_LENGH: 4,
            MISSING_HOST_ELEMENT_MESSAGE: "Host element cannot be null, undentified or an empty string!",
            INVALID_HOST_ELEMENT_MESSAGE: "Invalid host element! A valid html element identifier or jquery html object should be provided!",
            INVALID_PLAYER_MODE_MESSAGE: "Invalid player mode!",
            MISSING_GAME_NAME_MESSAGE: "Game name should be specified before starting a new game!",
            MISSING_NICKNAME_MESSAGE: "A non empty nickname should be specified before starting a new game!",
            MISSING_GAME_TYPE_MESSAGE: "Game type should be specified before starting a new game!"
        },

        gameType: {
            SINGLE_PLAYER: 0,
            MULTIPLAYER: 1,
            PEER_2_PEER: 2
        },

        playerModes: {
            HUMAN_VS_COMPUTER: 0,
            COMPUTER_VS_COMPUTER: 1,
            MULTIPLAYER: 2,
            PEER_2_PEER: 3
        },

        events: {
            CREATE_GAME_EVENT: "create game",

            START_GAME_EVENT: "start game",
            GAME_STARTED_SERVER_EVENT: "game started server event",

            SURRENDER_GAME_EVENT: "surrender game",

            GUESS_NUMBER_EVENT: "guess number",
            GUESS_NUMBER_SERVER_EVENT: "guess number server event",

            GUESS_PEER_NUMBER_EVENT: "guess peer number",
            GUESS_PEER_NUMBER_SERVER_EVENT: "check peer number",
            GUESS_PEER_NUMBER_CLIENT_RESPONSE_EVENT: "check peer number response",
            GUESS_PEER_NUMBER_RESPONSE_EVENT: "guess peer number response",

            GAME_OVER_EVENT: "game over",
            GAME_OVER_PEER_CLIENT_EVENT: "game over peer client",
            GAME_OVER_PEER_SERVER_EVENT: "game over peer server",

            JOIN_GAME_EVENT: "join game",
            JOIN_GAME_SERVER_EVENT: "join server game",

            LIST_GAMES_EVENT: "list games",
            LIST_GAMES_RESPONSE_EVENT: "list games response",

            LIST_GAME_PLAYERS_EVENT: "list players",

            POST_NUMBER_EVENT: "post number",
            POST_NUMBER_RESPONSE_EVENT: "post number response",

            PLAYER_TURN_SERVER_EVENT: "player turn",

            CHECK_NICKNAME_EXISTS_EVENT: "nickname exists",
            CHECK_NICKNAME_EXISTS_RESPONSE_EVENT: "nickname exists response"
        }
    }

    return c;
});