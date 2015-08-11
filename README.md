Bulls and Cows, Ivan Ivanov

Contents
1. Installation
2. How to play
3. Implementation Details
4. Future Improvements


===== 1. Installation========

1. clone BullsAndCows repo locally
2. host the client project (BullsAndCows/Client) in a web server (IIS, Apache)
3. go to BullsAndCows/Server and execute 
	npm install
from the command line, which will install all required modules 
4. run the server: node app.js
5. the server is configure to listen on port 8080, if you want to change it go to BullsAndCows/Server/consts.js and edit the SERVER_PORT
6. open your browser (developed and tested against Chrome) and enter
	Task 1) http://[appRoot]/humanVscomputer.html
	Task 2) http://[appRoot]/computerVscomputer.html
	Task 3) http://[appRoot]/multiplayer.html
	Task 4) http://[appRoot]/peer2peer.html
	
Task 4 is partly implemented!!!

Alternatively, you can open the solution by Visual Studio 2013 Community Edition with Node.js Tools for Visual Studio installed (https://www.visualstudio.com/en-us/features/node-js-vs.aspx)
To do so, find the BullsAndCows.sln file in the root of the solution folder and open it. Right-click on the solution and select properties. In the Properties dialog select "Multiple Startup projects and for "Server" and "Client" projects in the list below select Start. Set as Start Page one of the above described home pages and hit F5. Enjoy!
	
========== 2. How to Play =======

Task 1) humanVscomputer

After Start New Game button is pressed, a new game is being started. Select a number and make your guess. After 10 incorrect guesses the game is over.

Task 2) computerVscomputer

Press Start New Game button and watch how the computer is playing.

Task 3) multiplayer

First you should create a new game. To do so, enter your nickname and game name and click Create Game button. On the following screen you will see and empty list with players who joined the game. You can add a bot player at this step if you want. 
Then open a new browser tab and start the multiplayer page again. Enter a new nickname, select the game you created on the previous step and press Join. At the next dialog you will see the actual dialog for playing the game waiting for the game to begin. At this time, go back to the first browser and notice that the second player who joined the game is displayed in the list. Press Start Game.

Task 4) peer to peer

This player mode not fully implemented. You can only create a game/join a game and register each peer's secret number.

=========== 3. Implementation details =================

Front-end

The client is implemented by using knockout.js and socket.io. Each game mode has a view and a viewModel. For example: humanVscomputer mode stores its view in views/humanVsComputerView.html and its viewModel in viewModels/humanVsComputerViewModel.js

Backend

The backend is separated on several abstractions:

Server
This class performs all the comunication among the clients. It also stores the state for all running games.

Game
This class stores the state of one game - id, name, collection of players, secret number and more.

Player
This class stores information for a Player. It does not matter if the player is a human or a bot.

Token
When a player joins a game, the server generates for him a token. The player uses this token for authentication.

Currently, the server doesn't make a difference if a single or multiplayer game is being played - it runs the same code base.

========== 4. future improvements==============

front-end
1. require.js should be introduced in the front-end
2. a base viewModel class should be created to avoid some duplicated login among the viewModels.

backend
1. Currently the server is stateful. It should become stateless by storing its state in some fast external storage.
2. New Peer2Peer game class should be introduced. It will handle some peer2peer specific business logic like having exactly two players
3. Unit test should be written for each server's endpoint method. They will help a lot to catch regression bugs while further developing.

Variaous improvements for user input, exceptional conditions, timeout conditions, etc should be implemented.