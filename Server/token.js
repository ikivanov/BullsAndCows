var Token = (function () {
    
    var Token = function (key, expiresOn) {
        this.key = key;
        this.expiresOn = expiresOn;
    };
    
    Token.prototype = {
        constructor: Token
    };
    
    return Token;
})();

exports.Token = Token;