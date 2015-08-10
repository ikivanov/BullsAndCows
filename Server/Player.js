var Player = (function () {
    
    var Player = function (nickname, token, isGameCreator) {
        this.nickname = nickname;
        this.token = token;
        this.isGameCreator = isGameCreator;
    };
    
    Player.prototype = {
        constructor: Player
    };
    
    return Player;
})();

exports.Player = Player;