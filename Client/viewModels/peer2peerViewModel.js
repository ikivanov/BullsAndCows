define(["knockout", "socket.io", "jquery", "js/consts", "viewModels/baseMultiplayerViewModel"], function (ko, io, $, consts, BaseMultiplayerViewModel) {
    Peer2PeerViewModel.prototype = new BaseMultiplayerViewModel;
    function Peer2PeerViewModel() {
        var that = this;

        BaseMultiplayerViewModel.call(that);

        that.secretNumber = ko.observable("")

        that.gameType(consts.gameType.PEER_2_PEER);

        that.bots = [],

        that.initSocket();

        that.ListGames();
    };

    Peer2PeerViewModel.prototype.initSocket = function () {
        var that = this;

        BaseMultiplayerViewModel.prototype.initSocket.call(that);

        that.socket.on(consts.events.GUESS_PEER_NUMBER_SERVER_EVENT, function (data) {
            $.proxy(that.onGuessPeerIncomingQuery(data), that);
        });

        that.socket.on(consts.events.GUESS_PEER_NUMBER_RESPONSE_EVENT, function (data) {
            $.proxy(that.onGuessPeerNumberResponse(data), that);
        });
    }

    Peer2PeerViewModel.prototype.onGuessPeerIncomingQuery = function (data) {
        var that = this;

        var bullscows = { bulls: 0, cows: 0 };

        that.socket.emit(consts.events.GUESS_PEER_NUMBER_CLIENT_RESPONSE_EVENT, {
            gameId: that.gameId,
            playerToken: that.playerToken,
            nickname: that.nickname(),
            success: true,
            number: data.number,
            bulls: bullscows.bulls,
            cows: bullscows.cows
        });
    }

    Peer2PeerViewModel.prototype.onGuessPeerNumberResponse = function (data) {
        var that = this;
    }

    return Peer2PeerViewModel;
});