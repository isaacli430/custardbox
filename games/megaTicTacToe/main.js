var board;
var game;

$("#mtttTable").hide();

// Get games
socket.emit("mtttGame", { request: "getGames", token: validator, id: discordId });

$("#mtttNewGameBtn").on("click", function () {
    socket.emit("mtttRefreshFriends", { token: validator });
});

socket.on("mtttRefreshedFriends", function (reply) {
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
        tr.setAttribute("data-userName", reply.friends[i].userName);

        document.getElementById("groupNewGameTable").appendChild(tr);
    }
    $(".mtttNewGameWithFriendBtn").on("click", function () {
        var friendId = $(this).attr("data-friendId");
        var userName = $(this).attr("data-userName");
        socket.emit("mtttGame", { request: "newGame", opponentId: friendId, id: discordId, token: validator });
        clickedGame = { opponentId: friendId, opponentName: userName };
        $("#groupNewGameModal").modal("hide");
    });
    $("#groupNewGameModal").modal("show");
});

$("#backButton").on("click", function () {
    goBack();
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
    else if (response === "refreshBoard") {
        if (data.opponentId = clickedGame.opponentId) {
            openBoardPage(data);
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
            $("#" + x + "-" + y).addClass("mtttPossible");
        }
    }
    $(".mtttPossible").on("click", makeMove);
}

function openBoardPage(data) {
    clickedGame = { opponentId: data.opponentId, opponentName: data.opponentName }
    $("#mtttOpponentName").text(clickedGame.opponentName);

    $("#mtttTable").show();
    $("#mtttSelectGame").hide();
    $("#mtttName").html(clickedGame.opponentName);

    if (data.finished) {
        if (data.victory == null) {
            $("#mtttStatus").html("Draw");
        } else {
            string = data.victory + " Wins!";
            $("#mtttStatus").html(string);
        }
    }
    for (var x = 0; x < 9; x++) {
        for (var y = 0; y < 9; y++) {
            if (data.board[x][y] == "X") {
                $("#" + x + "-" + y).removeClass("mtttPossible");
                $("#" + x + "-" + y).html('<i class="fas fa-times"></i>');
            } else if (data.board[x][y] == "O") {
                $("#" + x + "-" + y).removeClass("mtttPossible");
                $("#" + x + "-" + y).html('<i class="fas fa-circle-notch"></i>');
            } else if (((data.any && data.turn == discordId) || (data.turn == discordId && x == data.prevMove)) && !data.finished) {
                $("#" + x + "-" + y).html("");
                $("#" + x + "-" + y).addClass("mtttPossible");
            } else {
                $("#" + x + "-" + y).html("");
                $("#" + x + "-" + y).removeClass("mtttPossible");
            }
        }
    }
    $(".mtttPossible").on("click", makeMove);
}

function makeMove() {
    if ($(this).attr('class').split(' ').includes("mtttPossible")) {
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                $("#" + x + "-" + y).removeClass("mtttPossible");
            }
        }
        x = parseInt($(this).attr('id').split("-")[0]);
        y = parseInt($(this).attr('id').split("-")[1]);
        socket.emit("mtttGame", {request: "makeMove", x: x, y: y, token: validator, opponentId: clickedGame.opponentId, id: discordId});
    }
}

$(".table-search").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $(this).closest("table").find("tbody > tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
});