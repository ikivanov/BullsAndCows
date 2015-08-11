var Player = (function () {
    
    var Player = function (nickname, token, isGameCreator) {
        var that = this;

        that.nickname = nickname;
        that.token = token;
        that.isGameCreator = isGameCreator;
    };
    
    Player.prototype = {
        constructor: Player
    };
    
    return Player;
})();

exports.Player = Player;