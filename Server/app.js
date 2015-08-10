var http = require('http');
var GameServer = require('./server').Server;

var port = process.env.port || 1337;

var app = http.createServer(function (req, res) {
    console.log('Bulls and Cows server is listening on port ' + port);
    
    res.end();
});

var io = require('socket.io')(app);

var server = new GameServer(io);

app.listen(port);