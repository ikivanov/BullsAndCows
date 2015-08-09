var App = App || {};

(function () {
    var consts = {
        SERVER_ADDRESS: "localhost:1337",
        MISSING_HOST_ELEMENT_MESSAGE: "Host element cannot be null, undentified or an empty string!",
        INVALID_HOST_ELEMENT_MESSAGE: "Invalid host element! A valid html element identifier or jquery html object should be provided!",
        INVALID_PLAYER_MODE_MESSAGE: "Invalid player mode!"
    };

    App.playerModes = {
        HUMAN_VS_COMPUTER: 0,
        COMPUTER_VS_COMPUTER: 1,
        MULTIPLAYER: 2,
        PEER_2_PEER: 3
    }

    App.Run = function (hostElement, mode) {
        if (!hostElement) {
            throw new Error(consts.MISSING_HOST_ELEMENT_MESSAGE);
        }

        var el = typeof hostElement === "string" ? $("#" + hostElement) : hostElement;

        if (el.length === 0) {
            throw new Error(consts.INVALID_HOST_ELEMENT_MESSAGE);
        }

        var playerMode = PlayerModeFactory.Create(mode);
        if (!playerMode) throw new Error(consts.INVALID_PLAYER_MODE_MESSAGE);

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

    PlayerModeFactory.Create = function (mode) {
        if (!PlayerModeFactory.modes[mode]) {
            return null;
        }

        return PlayerModeFactory.modes[mode];
    }
})();