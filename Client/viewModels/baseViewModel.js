var BaseViewModel = (function () {
    function BaseViewModel() {
        var that = this;

        that.isRunning = ko.observable(false);
        that.isGameOver = ko.observable(false);

        that.number1 = ko.observable(1);
        that.number2 = ko.observable(2);
        that.number3 = ko.observable(3);
        that.number4 = ko.observable(4);

        that.gameId = "";
        that.playerToken = "";

        that.isValidInput = ko.observable(true);
        that.guesses = ko.observableArray();

        that.socket = null;
    }

    BaseViewModel.prototype.initSocket = function () {
        var that = this;

        that.socket = io.connect(App.config.SERVER_ADDRESS, { 'forceNew': true });
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
})();