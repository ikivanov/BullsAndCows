var App = App || {};

(function () {
    App.Run = function (hostElement, mode) {
        if (!hostElement) {
            throw new Error(App.consts.MISSING_HOST_ELEMENT_MESSAGE);
        }

        var el = typeof hostElement === "string" ? $("#" + hostElement) : hostElement;

        if (el.length === 0) {
            throw new Error(App.consts.INVALID_HOST_ELEMENT_MESSAGE);
        }

        var playerMode = PlayerModeFactory.Create(mode);
        if (!playerMode) throw new Error(App.consts.INVALID_PLAYER_MODE_MESSAGE);

        playerMode.render(el);
    }

    var PlayerMode = function (view, viewModel) {
        this.view = view,
        this.viewModel = viewModel,

        this.render = function (hostElement) {
            var that = this;
            hostElement.load(that.view, function () {
                ko.applyBindings(new that.viewModel());
            });
        }
    }

    var PlayerModeFactory = {}
    PlayerModeFactory.modes = {};
    PlayerModeFactory.modes[App.playerModes.HUMAN_VS_COMPUTER] = new PlayerMode("views\\humanVsComputerView.html", HumanVsComputerViewModel);
    PlayerModeFactory.modes[App.playerModes.COMPUTER_VS_COMPUTER] = new PlayerMode("views\\computerVsComputerView.html", ComputerVsComputerViewModel);
    PlayerModeFactory.modes[App.playerModes.MULTIPLAYER] = new PlayerMode("views\\multiplayerView.html", MultiplayerViewModel);
    PlayerModeFactory.modes[App.playerModes.PEER_2_PEER] = new PlayerMode("views\\peer2PeerView.html", Peer2PeerViewModel);

    PlayerModeFactory.Create = function (mode) {
        if (!PlayerModeFactory.modes[mode]) {
            return null;
        }

        return PlayerModeFactory.modes[mode];
    }
})();