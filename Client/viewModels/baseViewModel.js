define(["knockout", "socket.io", "js/consts"], function (ko, io, consts) {
    function BaseViewModel() {
        var that = this;

        that.isRunning = ko.observable(false);
        that.isGameOver = ko.observable(false);

        that.number1 = ko.observable(1);
        that.number2 = ko.observable(2);
        that.number3 = ko.observable(3);
        that.number4 = ko.observable(4);

        that.nickname = ko.observable("");
        that.gameName = ko.observable("");
        that.gameType = ko.observable(null);

        that.gameId = "";
        that.playerToken = "";

        that.isValidInput = ko.observable(true);
        that.guesses = ko.observableArray();

        that.socket = null;
    }

    BaseViewModel.prototype.initSocket = function () {
        var that = this;

        that.socket = io.connect(consts.config.SERVER_ADDRESS, { 'forceNew': true });

        that.socket.on(consts.events.GAME_OVER_EVENT, function (data) {
            $.proxy(that.onGameOver(data), that);
        });
    }

    BaseViewModel.prototype.CreateGame = function () {
        var that = this;

        if (!that.gameName()) throw new Error(consts.consts.MISSING_GAME_NAME_MESSAGE);
        if (!that.nickname()) throw new Error(consts.consts.MISSING_NICKNAME_MESSAGE);
        if (that.gameType() == null) throw new Error(consts.consts.MISSING_GAME_TYPE_MESSAGE);

        if (!that.socket) {
            that.initSocket();
        }

        that.socket.emit(consts.events.CREATE_GAME_EVENT,
            {
                name: that.gameName(),
                nickname: that.nickname(),
                type: that.gameType()
            },
            function (data) {
                that.onGameCreated.call(that, data);
        });
    }

    BaseViewModel.prototype.onGameCreated = function (data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.gameId = data.gameId;
        that.playerToken = data.playerToken;
    }

    BaseViewModel.prototype.onGameStarted = function (data) {
        var that = this;

        var success = data.success;
        if (!success) {
            alert(data.msg);
            return;
        }

        that.isRunning(true);
        that.guesses.removeAll();

        that.number1(1);
        that.number2(2);
        that.number3(3);
        that.number4(4);
    }

    BaseViewModel.prototype.onGuessResponse = function (data) {
        var that = this;

        var bulls = data.bulls, cows = data.cows;
        var number = data.number;

        that.guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
    }

    BaseViewModel.prototype.onGameOver = function (data) {
        var that = this;

        that.isGameOver(true);
        that.isRunning(false);
        var winStr = data.win ? "win" : "lose";
        var result = "Game over! You " + winStr + "! Number is: " + data.number.join('');
        that.guesses.push(result);

        that.gameId = "";

        that.socket.removeAllListeners();
        that.socket.disconnect();
        that.socket = null;
    }

    BaseViewModel.prototype.onValidate = function () {
        var that = this;

        that.isValidInput(that.isValidNumber());
    }

    BaseViewModel.prototype.isValidNumber = function () {
        var that = this;

        if (that.number1() == 0) {
            return false;
        }

        var nums = [that.number1(), that.number2(), that.number3(), that.number4()];

        //are numbers different from each other?
        for (var i = 0; i < nums.length; i++) {
            for (var j = nums.length - 1; j > i; j--) {
                if (nums[i] == nums[j])
                    return false;
            }
        }

        return true;
    }

    return BaseViewModel;
});