define(["knockout", "socket.io", "jquery", "js/consts", "js/botPlayer", "viewModels/baseMultiplayerViewModel"], function (ko, io, $, consts, BotPlayer, BaseMultiplayerViewModel) {
    MultiplayerViewModel.prototype = new BaseMultiplayerViewModel;
    function MultiplayerViewModel() {
        var that = this;

        BaseMultiplayerViewModel.call(that);

        that.gameType(consts.gameType.MULTIPLAYER);

        that.bots = [],

        that.initSocket();

        that.ListGames();
    };

    MultiplayerViewModel.prototype.AddBot = function () {
        var that = this;

        var botSocket = io.connect(consts.config.SERVER_ADDRESS, { 'forceNew': true });
        var nickname = "botPlayer_" + new Date().getTime();

        var bot = new BotPlayer(null, botSocket, that.gameId, nickname);
        bot.joinGame(that.gameId);
    }

    return MultiplayerViewModel;
});