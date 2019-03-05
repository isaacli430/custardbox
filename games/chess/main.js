(function() {
    var clickedGame = {};
    var board;
    var game;
    
    $("#chessGameArea").hide();
    
    // Settings button press
    $("#chessGameSettings").on("click", function() {
        $("#chessGameSettingsModal").modal("show");
    
        $("#chessRestartGame").on("click", function() {
            socket.emit("chessGame", {request: "updateBoard", pgn: "", opponentId: clickedGame.opponentId, id: discordId, token: validator});
            $("#chessGameSettingsModal").modal("hide");
            getGameData(clickedGame.opponentId, clickedGame.opponentName);
        });
    
        $("#chessDeleteGame").on("click", function() {
            socket.emit("chessGame", {request: "deleteGame", opponentId: clickedGame.opponentId, id: discordId, token: validator});
            $("#chessGameSettingsModal").modal("hide");
            $("#chessGameArea").hide();
            $("#chessSelectGame").show();
        });
    });
    
    // Get games
    socket.emit("chessGame", {request: "getGames", token: validator, id: discordId});
    
    $("#chessNewGameBtn").on("click", function() {
        socket.emit("chessRefreshFriends", { token: validator });
    });

    socket.on("chessRefreshedFriends", function (reply) {
        $("#chessGroupNewGameTable").empty();
        for (var i = 0; i < reply.friends.length; i++) {
    
            var chatIcon = document.createElement("i");
            chatIcon.setAttribute("class", "far fa-plus-square fa-fw");
    
            var button = document.createElement("button");
            button.classList.add("textLink");
            button.classList.add("chessNewGameWithFriendBtn");
            button.setAttribute("data-friendId", reply.friends[i].userId);
            button.setAttribute("data-userName", reply.friends[i].userName);
            button.appendChild(chatIcon);
            button.innerHTML += " " + reply.friends[i].userName;
    
            var buttonTd = document.createElement("td");
            buttonTd.appendChild(button);
    
            var tr = document.createElement("tr");
            tr.appendChild(buttonTd);
            tr.setAttribute("data-friendId", reply.friends[i].userId);
            button.setAttribute("data-userName", reply.friends[i].userName);
    
            document.getElementById("chessGroupNewGameTable").appendChild(tr);
        }
        $(".chessNewGameWithFriendBtn").on("click", function () {
            var friendId = $(this).attr("data-friendId");
            var userName = $(this).attr("data-userName");
            clickedGame = {opponentId: friendId, opponentName: userName, stepPosition: 0};
            socket.emit("chessGame", {request: "newGame", opponentId: clickedGame.opponentId, id: discordId, token: validator});
            $("#chessGroupNewGameModal").modal("hide");
        });
        $("#chessGroupNewGameModal").modal("show");
    });
    
    $("#backButton").on("click", function() {
        goBack();
    });
    
    $("#chessStepFastForwardBtn").on("click", function() {
        // Step position is how far back from beginning of game. 
        // eg. 0 is most recient and 1 is one step back
    
        // Subtract one to step position
        clickedGame.stepPosition = 0;
    
        var stepPosition = clickedGame.stepPosition;
        var pgn = clickedGame.pgn;
    
        // Load pgn
        var tempChess = new Chess();
        tempChess.load_pgn(pgn);
        var history = tempChess.history();
    
        // Undo the required number of times
        for (var i = 0; i < stepPosition; i++) {
            tempChess.undo();
        }
    
        // Render board at this new position
        board.position(tempChess.fen());
    });
    
    $("#chessStepForwardBtn").on("click", function() {
        // Step position is how far back from beginning of game. 
        // eg. 0 is most recient and 1 is one step back
    
        // Subtract one to step position
        if(clickedGame.stepPosition > 0){
            clickedGame.stepPosition = clickedGame.stepPosition - 1;
        }
    
        var stepPosition = clickedGame.stepPosition;
        var pgn = clickedGame.pgn;
    
        // Load pgn
        var tempChess = new Chess();
        tempChess.load_pgn(pgn);
        var history = tempChess.history();
    
        // Undo the required number of times
        for (var i = 0; i < stepPosition; i++) {
            tempChess.undo();
        }
    
        // Render board at this new position
        board.position(tempChess.fen());
    });
    
    $("#chessStepBackwardBtn").on("click", function() {
        // Step position is how far back from beginning of game. 
        // eg. 0 is most recient and 1 is one step back
    
        // Add one to step position
        clickedGame.stepPosition = clickedGame.stepPosition + 1;
    
        var stepPosition = clickedGame.stepPosition;
        var pgn = clickedGame.pgn;
    
        // Load pgn
        var tempChess = new Chess();
        tempChess.load_pgn(pgn);
        var history = tempChess.history();
    
        // Undo the required number of times
        for (var i = 0; i < stepPosition; i++) {
            // If move is unsuccessful step forwards one, else just go back
            if(!tempChess.undo()){ 
                clickedGame.stepPosition = clickedGame.stepPosition - 1;
            }
        }
    
        // Render board at this new position
        board.position(tempChess.fen());
    });
    
    $(document).keydown(function(e){
        if(e.which == 27){
            goBack();
        }
    });
    
    function refreshGames(data){
            $("#chessGamesTable tr").not(':first').remove();
    
            for (var i = 0; i < data.length; i++) {
                var opponentId = data[i].opponentId;
                var opponentName = data[i].opponentName;

                var button = document.createElement("button");
                button.classList.add("textLink");
                button.classList.add("addFriendToGroupBtn");
                button.setAttribute("data-userId", opponentId);
                button.setAttribute("data-name", opponentName);
                button.onclick = function() {getGameData(this.getAttribute("data-userId"), this.getAttribute("data-name"))};
                game = new Chess();
                game.load_pgn(data[i].pgn);
                turn = game.turn();
                if (data[i].playerColor == turn) {
                    button.innerHTML = '<i class="fas fa-exclamation"></i>';
                } else {
                    button.innerHTML = '<i class="fas fa-arrow-right"></i>';
                }
                button.innerHTML += " "+opponentName;

                var buttonTd = document.createElement("td");
                buttonTd.appendChild(button);
    
                var tr = document.createElement("tr");
                tr.appendChild(buttonTd);
    
                document.getElementById("chessGamesTable").appendChild(tr);
            }
    }
    
    function getGameData(opponentId, opponentName){
        socket.emit("chessGame", {request: "getGameData", opponentId: opponentId, id: discordId, token: validator});
        clickedGame = {opponentId: opponentId, opponentName: opponentName, stepPosition: 0};
    }
    
    socket.on("chessGame", function(reply) {
        var response = reply.response;
        var data = reply.data;
    
        if(response === "gameData"){
            var playerColor = data.playerColor;
            var pgn = data.pgn;
    
            clickedGame.pgn = pgn;
            startGame(playerColor, pgn);
        }
        else if(response === "games"){
            refreshGames(data);
        }
        else if(response === "newMove"){
            if(data.opponentId == clickedGame.opponentId){
                startGame(data.playerColor, data.pgn);
            }
        } else if (response === "deleteGame") {
            socket.emit("chessGame", {request: "getGames", token: validator, id: discordId});
        }
    });
    
    function startGame(playerColor, pgn){
        $("#chessOpponentName").text(clickedGame.opponentName);
    
        $("#chessGameArea").show();
        $("#chessSelectGame").hide();
    
        game = new Chess();
    
        game.load_pgn(pgn);
    
        var opponentId = clickedGame.opponentId;
    
        var removeGreySquares = function() {
            $('#chessBoard .square-55d63').css('background', '');
        };
    
        var greySquare = function(square) {
            var squareEl = $('#chessBoard .square-' + square);
    
            var background = '#a9a9a9';
    
            if (squareEl.hasClass('black-3c85d') === true) {
                background = '#696969';
            }
    
            squareEl.css('background', background);
        };
    
        // do not pick up pieces if the game is over
        // only pick up pieces for the side to move
        var onDragStart = function(source, piece, position, orientation) {
            if(playerColor === "w"){
                if (game.game_over() === true  || game.turn() === 'b' || piece.search(/^b/) !== -1) {
                    return false;
                }
            }
            else if(playerColor === "b"){
                if (game.game_over() === true || game.turn() === 'w' || piece.search(/^w/) !== -1) {
                    return false;
                }
            }
    
            // If the user is not at the most receint position
            if(clickedGame.stepPosition != 0){
                $("#chessStepFastForwardBtn").fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500);
                return false;
            }
        };
    
        var onDrop = function(source, target) {
            removeGreySquares();
    
            // see if the move is legal
            var move = game.move({
                    from: source,
                    to: target,
                    promotion: 'q' // NOTE: always promote to a queen for example simplicity
                }
    
            );
    
            // illegal move
            if (move === null) return 'snapback';
    
            updateStatus();
            socket.emit("chessGame", {request: "updateBoard", pgn: game.pgn(), opponentId: opponentId, id: discordId, token: validator});
        };
    
        var onMouseoverSquare = function(square, piece) {
            // If the user is not at the most receint position
            if(clickedGame.stepPosition != 0){
                return;
            }
    
            if(game.game_over() === true  || game.turn() != playerColor){
                return;
            }
    
            // get list of possible moves for this square
            var moves = game.moves({
                    square: square,
                    verbose: true
                }
    
            );
    
            // exit if there are no moves available for this square
            if (moves.length === 0) return;
    
            // highlight the square they moused over
            greySquare(square);
    
            // highlight the possible squares for this piece
            for (var i = 0; i < moves.length;
    
                i++) {
                greySquare(moves[i].to);
            }
        };
    
        var onMouseoutSquare = function(square, piece) {
            removeGreySquares();
        };
    
        // update the board position after the piece snap 
        // for castling, en passant, pawn promotion
        var onSnapEnd = function() {
            board.position(game.fen());
        };
    
        var cfg = {
            orientation: 'white',
            draggable: true,
            position: game.fen(),
            onDragStart: onDragStart,
            onDrop: onDrop,
            onMouseoutSquare: onMouseoutSquare,
            onMouseoverSquare: onMouseoverSquare,
            onSnapEnd: onSnapEnd,
            pieceTheme: "vendors/chessboardjs-0.3.0/chesspieces/wikipedia/{piece}.png",
            moveSpeed: 150,
        };
        if(playerColor === "b"){
            cfg.orientation = "black";
        }
    
        board = ChessBoard('chessBoard', cfg);
        updateStatus();
    }
    
    function updateBoard(data){
        game.load_pgn(data.pgn);
        board.position(game.fen(), true);
        clickedGame.pgn = data.pgn;
        updateStatus();
    }
    
    $(".table-search").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(this).closest("table").find("tbody > tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
    
    function calcLastOnline(lastOnline) {
        var unixTime = Math.round(+new Date()/1000);
        var seconds = unixTime - lastOnline;
    
        if(seconds <= 5){
            return "now";
        }
    
        var days = Math.floor(seconds / (3600*24));
        seconds -= days*3600*24;
        var hrs  = Math.floor(seconds / 3600);
        seconds -= hrs*3600;
        var mnts = Math.floor(seconds / 60);
        seconds -= mnts*60;
    
        if(mnts == 0 && hrs == 0 && days == 0){
            return seconds+"s";
        }
        else if(hrs == 0 && days == 0){
            return mnts+"m";
        }
        else if(days == 0){
            return hrs+"h";
        }
        else if(days > 0){
            return days+"d";
        }
        else if(days > 360){
            return "&infin;";
        }
    }
    
    function updateStatus() {
        var statusEl = $('#chessStatus');
        var status = '';
    
        var moveColor = 'White';
    
        if (game.turn() === 'b') {
            moveColor = 'Black';
        }
    
        // checkmate?
        if (game.in_checkmate() === true) {
            status = 'Game over, ' + moveColor + ' is in checkmate.';
        }
    
        // draw?
        else if (game.in_draw() === true) {
            status = 'Game over, drawn position';
        }
    
        // game still on
        else {
            status = moveColor + "'s Turn";
    
            // check?
            if (game.in_check() === true) {
                status += ', ' + moveColor + ' is in check';
            }
        }
    
        statusEl.html(status);
    }
    
    })();