
var clickedGame = {};
var board;
var game;

$("#mtttTable").hide();

// Settings button press
$("#mtttGameSettings").on("click", function () {
    $("#mtttGameSettingsModal").modal("show");

    $("#mtttRestartGame").on("click", function () {
        socket.emit("mtttGame", { request: "updateBoard", data: { pgn: "", opponentId: clickedGame.opponentId } });
        $("#mtttGameSettingsModal").modal("hide");
        getGameData(clickedGame.opponentId, clickedGame.opponentName);
    });

    $("#mtttDeleteGame").on("click", function () {
        socket.emit("mtttGame", { request: "deleteGame", data: { opponentId: clickedGame.opponentId } });
        socket.emit("mtttGame", { request: "getGames" });
        $("#mtttGameSettingsModal").modal("hide");
        $("#mtttGameArea").hide();
        $("#mtttSelectGame").show();
    });
});

// Get games
socket.emit("mtttGame", { request: "getGames", token: validator, id: discordId });

$("#mtttNewGameBtn").on("click", function () {
    socket.emit("refreshFriends", { token: validator });
});

socket.on("refreshedFriends", function (reply) {
    $("#groupNewGameTable").empty();
    for (var i = 0; i < reply.friends.length; i++) {

        var chatIcon = document.createElement("i");
        chatIcon.setAttribute("class", "far fa-plus-square fa-fw");

        var button = document.createElement("button");
        button.classList.add("textLink");
        button.classList.add("mtttNewGameWithFriendBtn");
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

        document.getElementById("groupNewGameTable").appendChild(tr);
    }
    $(".mtttNewGameWithFriendBtn").on("click", function () {
        var friendId = $(this).attr("data-friendId");
        var userName = $(this).attr("data-UserName");

        socket.emit("mtttGame", { request: "newGame", opponentId: friendId, id: discordId, token: validator });
        clickedGame = {
            opponentId: friendId, opponentName: userName, xId: discordId, oId: friendId, prevMove: null, turn: discordId, any: true, board: [
                [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ],
                [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ],
                [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ],
                [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ],
                [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ],
                [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ],
                [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ],
                [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ],
                [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ]
            ]
        };
        $("#groupNewGameModal").modal("hide");
    });
    $("#groupNewGameModal").modal("show");
});

function goBack() {
    clickedGame = {};
    board = undefined;
    game = undefined;
    socket.emit("mtttGame", { request: "getGames" });
}

$("#backButton").on("click", function () {
    goBack();
});

$("#mtttStepFastForwardBtn").on("click", function () {
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

$("#mtttStepForwardBtn").on("click", function () {
    // Step position is how far back from beginning of game. 
    // eg. 0 is most recient and 1 is one step back

    // Subtract one to step position
    if (clickedGame.stepPosition > 0) {
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

$("#mtttStepBackwardBtn").on("click", function () {
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
        if (!tempChess.undo()) {
            clickedGame.stepPosition = clickedGame.stepPosition - 1;
        }
    }

    // Render board at this new position
    board.position(tempChess.fen());
});

$(document).keydown(function (e) {
    if (e.which == 27) {
        goBack();
    }
});

function refreshGames(data) {
    $("#mtttGamesTable").find("tr:gt(0)").remove();
    for (var i = 0; i < data.length; i++) {
        var opponentId = data[i].opponentId;
        var opponentName = data[i].opponentName;

        var button = document.createElement("button");
        button.classList.add("textLink");
        button.classList.add("addFriendToGroupBtn");
        button.setAttribute("data-userId", opponentId);
        if (data[i].turn == discordId) {
            button.innerHTML = '<i class="fas fa-exclamation"></i>';
        } else {
            button.innerHTML = '<i class="fas fa-arrow-right"></i>';
        }
        button.innerHTML += " " + opponentName;
        button.onclick = function () { getGameData(this.getAttribute("data-userId")) };

        var buttonTd = document.createElement("td");
        buttonTd.appendChild(button);

        var tr = document.createElement("tr");
        tr.appendChild(buttonTd);

        document.getElementById("mtttGamesTable").appendChild(tr);
    }
}

function getGameData(opponentId) {
    socket.emit("mtttGame", { request: "getGameData", opponentId: opponentId, id: discordId, token: validator });
}

socket.on("mtttGame", function (reply) {
    var response = reply.response;
    var data = reply.data;

    if (response === "gameData") {
        startGame();
    }
    else if (response === "games") {
        refreshGames(data);
    }
    else if (response === "existingGameData") {
        openBoardPage(data);
    }
    else if (response === "newMove") {
        if (data.opponentId = clickedGame.opponentId) {
            updateBoard(data);
        }
        else {
            socket.emit("mtttGame", { request: "getGames" });
        }
    }
});

function startGame() {
    $("#mtttOpponentName").text(clickedGame.opponentName);

    $("#mtttTable").show();
    $("#mtttSelectGame").hide();
    for (var x = 0; x < 9; x++) {
        for (var y = 0; y < 9; y++) {
            $("#" + x + "-" + y).text("");
            $("#" + x + "-" + y).removeClass("mtttX mtttO");
            $("#" + x + "-" + y).addClass("mtttPossible");
        }
    }
}

function openBoardPage(data) {
    clickedGame = { opponentId: data.opponentId, opponentName: data.opponentName, xId: data.xId, oId: data.oId, prevMove: data.prevMove, turn: data.turn, any: data.any, board: data.board }
    $("#mtttOpponentName").text(clickedGame.opponentName);

    $("#mtttTable").show();
    $("#mtttSelectGame").hide();
    for (var x = 0; x < 9; x++) {
        for (var y = 0; y < 9; y++) {
            if (data.board[x][y] == "X") {
                $("#" + x + "-" + y).text("");
                $("#" + x + "-" + y).removeClass("mtttPossible mtttO");
                $("#" + x + "-" + y).removeClass("mtttX");
            } else if (data.board[x][y] == "O") {
                $("#" + x + "-" + y).text("");
                $("#" + x + "-" + y).removeClass("mtttPossible mtttX");
                $("#" + x + "-" + y).removeClass("mtttO");
            } else if (data.any || (turn == discordId && x == data.prevMove)) {
                $("#" + x + "-" + y).text("");
                $("#" + x + "-" + y).removeClass("mtttX mtttO");
                $("#" + x + "-" + y).addClass("mtttPossible");
            } else {
                $("#" + x + "-" + y).text("");
                $("#" + x + "-" + y).removeClass("mtttX mtttO mtttPossible");
            }
        }
    }
}

// function openBoardPage()

function updateBoard(data) {
    game.load_pgn(data.pgn);
    board.position(game.fen(), true);
    clickedGame.pgn = data.pgn;
    updateStatus();
}

$(".table-search").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $(this).closest("table").find("tbody > tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
});

function calcLastOnline(lastOnline) {
    var unixTime = Math.round(+new Date() / 1000);
    var seconds = unixTime - lastOnline;

    if (seconds <= 5) {
        return "now";
    }

    var days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    var hrs = Math.floor(seconds / 3600);
    seconds -= hrs * 3600;
    var mnts = Math.floor(seconds / 60);
    seconds -= mnts * 60;

    if (mnts == 0 && hrs == 0 && days == 0) {
        return seconds + "s";
    }
    else if (hrs == 0 && days == 0) {
        return mnts + "m";
    }
    else if (days == 0) {
        return hrs + "h";
    }
    else if (days > 0) {
        return days + "d";
    }
    else if (days > 360) {
        return "&infin;";
    }
}

function updateStatus() {
    var statusEl = $('#mtttStatus');
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
