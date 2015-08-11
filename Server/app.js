var http = require('http');
var GameServer = require('./server').Server;

var consts = require('././consts.js').consts;

var port = consts.SERVER_PORT;

var app = http.createServer(function (req, res) {
    console.log('Bulls and Cows server is listening on port ' + port);
    
    res.end();
});

var io = require('socket.io')(app);

var server = new GameServer(io);

app.listen(port);