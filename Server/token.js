//Token class is used to assure system's security
//some of the server methods are private and requires from playes to authenticate themselves with a token
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