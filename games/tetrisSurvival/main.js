(function() {
var game = "tetrisSurvival";

var theme1 = "#36393F";
var theme2 = "#DCDDDE";
var theme3 = "#72767E";
var theme4 = "#303136";
var theme5 = "#303136";
var theme6 = "#3B97E0";

var COLS = 10, ROWS = 20;
var board = [];
var lose = false;
var interval;
var intervalRender;
var current; // current moving shape
var currentX, currentY; // position of current shape
var freezed; // is current shape settled on the board?
var shapeRotation = [
    [
        [
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,0,1,0],
            [0,0,1,0],
            [0,0,1,0],
            [0,0,1,0]
        ],
        [
            [0,0,0,0],
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0]
        ],
        [
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0]
        ]
    ],

    [
        [
            [0,0,0,0],
            [0,0,2,0],
            [2,2,2,0],
            [0,0,0,0]
        ],
        [
            [0,0,0,0],
            [0,2,0,0],
            [0,2,0,0],
            [0,2,2,0]
        ],
        [
            [0,0,0,0],
            [0,0,0,0],
            [2,2,2,0],
            [2,0,0,0]
        ],
        [
            [0,0,0,0],
            [2,2,0,0],
            [0,2,0,0],
            [0,2,0,0]
        ]
    ],
    [
        [
            [0,0,0,0],
            [3,0,0,0],
            [3,3,3,0],
            [0,0,0,0]
        ],
        [
            [0,0,0,0],
            [0,3,3,0],
            [0,3,0,0],
            [0,3,0,0]
        ],
        [
            [0,0,0,0],
            [0,0,0,0],
            [3,3,3,0],
            [0,0,3,0]
        ],
        [
            [0,0,0,0],
            [0,3,0,0],
            [0,3,0,0],
            [3,3,0,0]
        ]
    ],
    undefined,
    [
        [
            [0,0,0,0],
            [5,5,0,0],
            [0,5,5,0],
            [0,0,0,0]
        ],
        [
            [0,0,0,0],
            [0,0,5,0],
            [0,5,5,0],
            [0,5,0,0]
        ],
        [
            [0,0,0,0],
            [0,0,0,0],
            [5,5,0,0],
            [0,5,5,0]
        ],
        [
            [0,0,0,0],
            [0,5,0,0],
            [5,5,0,0],
            [5,0,0,0]
        ]
    ],
    [
        [
            [0,0,0,0],
            [0,6,6,0],
            [6,6,0,0],
            [0,0,0,0]
        ],
        [
            [0,0,0,0],
            [0,6,0,0],
            [0,6,6,0],
            [0,0,6,0]
        ],
        [
            [0,0,0,0],
            [0,0,0,0],
            [0,6,6,0],
            [6,6,0,0]
        ],
        [
            [0,0,0,0],
            [6,0,0,0],
            [6,6,0,0],
            [0,6,0,0]
        ]
    ],
    [
        [
            [0,0,0,0],
            [0,7,0,0],
            [7,7,7,0],
            [0,0,0,0]
        ],
        [
            [0,0,0,0],
            [0,7,0,0],
            [0,7,7,0],
            [0,7,0,0]
        ],
        [
            [0,0,0,0],
            [0,0,0,0],
            [7,7,7,0],
            [0,7,0,0]
        ],
        [
            [0,0,0,0],
            [0,7,0,0],
            [7,7,0,0],
            [0,7,0,0]
        ]
    ]
]
var testReg = {
    "0, 1": [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2]
    ],
    "1, 0": [
        [0, 0],
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2]
    ],
    "1, 2": [
        [0, 0],
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2]
    ],
    "2, 1": [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2]
    ],
    "2, 3": [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2]
    ],
    "3, 2": [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2]
    ],
    "3, 0": [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2]
    ],
    "0, 3": [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2]
    ]
}
var testI = {
    "0, 1": [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, -2],
        [1, 2]
    ],
    "1, 0": [
        [0, 0],
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2]
    ],
    "1, 2": [
        [0, 0],
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1]
    ],
    "2, 1": [
        [0, 0],
        [1, 0],
        [-2, 0],
        [1, -2],
        [-2, 1]
    ],
    "2, 3": [
        [0, 0],
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2]
    ],
    "3, 2": [
        [0, 0],
        [-2, 0],
        [1, 0],
        [-2, -1],
        [1, 2]
    ],
    "3, 0": [
        [0, 0],
        [1, 0],
        [-2, 0],
        [1, -2],
        [-2, 1]
    ],
    "0, 3": [
        [0, 0],
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1]
    ]
}
var shapes = [
    [0,0,0,0,
     1,1,1,1,
     0,0,0,0,
     0,0,0,0],

    [0,0,0,0,
     0,0,1,0,
     1,1,1,0,
     0,0,0,0],

    [0,0,0,0,
     1,0,0,0,
     1,1,1,0,
     0,0,0,0],

    [0,0,0,0,
     0,1,1,0,
     0,1,1,0,
     0,0,0,0],

    [0,0,0,0,
     1,1,0,0,
     0,1,1,0,
     0,0,0,0],

    [0,0,0,0,
     0,1,1,0,
     1,1,0,0,
     0,0,0,0],

    [0,0,0,0,
     0,1,0,0,
     1,1,1,0,
     0,0,0,0]
];
var smallShapes = [
    [[0,1],
     [0,1],
     [0,1],
     [0,1]],

    [[1,1],
     [0,1],
     [0,1],
     [0,0]],

    [[1,1],
     [1,0],
     [1,0],
     [0,0]],

    [[0,0],
     [1,1],
     [1,1],
     [0,0]],

    [[0,1],
     [1,1],
     [1,0],
     [0,0]],

    [[1,0],
     [1,1],
     [0,1],
     [0,0]],

    [[1,0],
     [1,1],
     [1,0],
     [0,0]]
];
var shapeBag = [];
var heldShapeId;
var currentId;
var canHoldShape = true;
var timeInt = 0;
var lockDelayInt = 0;
var failed = true;

//moving left & right
var holdLeft = false;
var holdRight = false;
var keypress = false;
const holdDelay = 6;
var keydownTime = holdDelay;

//[i,l,j,o,z,s,t]
var blockColors = ['#6CF8FC','#F5A432','#224AFB','#FDF734','#ED4630','#75F013','#AE58FD'];
var ghostColors;

//ultra variables
var score = 0;
var b2b = false;
var comboLength = 0;
var tspin = false;
var prevMoveWasRotate = false;
var move = "";
var debbieDelay = 0;
var b2bBonus = 1;
const corners = [[3,2],[1,2],[3,0],[1,0]];

//survival variables
var redBar = [];
var powerup = $("#powerups").val();
var powerupName = $("#powerups :selected").text();
//[clone,clear,shield,x2 score]
var powerupCosts = [3000,1500,2000,1000];

//basic variables
var renderInterval = 30;
var tickInterval = 500;
var canvas = document.getElementById("tetrisSurvivalCanvas");
var ctx = canvas.getContext('2d');
var menu = document.getElementById("tetrisSurvivalMenu");


// On games tab close
$('#games-tab').on('hide.bs.tab', goBack);

// On leaving game
$("#backButton").on("click", goBack);

function goBack() {
    clearAllIntervals();
    document.removeEventListener("keydown", keydownFunction);
    document.removeEventListener("keyup", stopHold);
    document.removeEventListener("keydown", restartTetris);
}

var Stopwatch = function(changeVar, options) {
    var offset,
        interval;
  
    // default options
    options = options || {};
    options.delay = options.delay || 1;
  
    // initialize
    reset();
  
  
    function start() {
      if (!interval) {
        offset   = Date.now();
        interval = setInterval(update, options.delay);
      }
    }
  
    function stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  
    function reset() {
        if (changeVar == 'timeInt') {
            timeInt = 0;
        } else if (changeVar == 'lockDelayInt') {
            lockDelayInt = 0;
        }
        else if (changeVar == 'debbieDelay') {
            debbieDelay = 0;
        }
    }
  
    function update() {
        if (changeVar == 'timeInt') {
            ++timeInt;
            runSurvivalTetris();
        } else if (changeVar == 'lockDelayInt') {
            lockDelayInt += delta();
        }
        else if (changeVar == 'debbieDelay') {
            debbieDelay += delta();
        }
      
    }
  
    function delta() {
      var now = Date.now(),
          d   = now - offset;
  
      offset = now;
      return d;
    }
  
    // public Methods
    this.start  = start;
    this.stop   = stop;
    this.reset  = reset;
};

var timer = new Stopwatch('timeInt', {delay: 1000});
var lockDelay = new Stopwatch('lockDelayInt', {delay: 100});
var defaultDebbie = new Stopwatch('debbieDelay', {delay: 30});

// On game start
chrome.storage.local.get(["theme"], function(result) {
    if(result["theme"] === "light"){
        theme1 = "#FFFFFF";
        theme2 = "#000000";
        theme3 = "#495057";
        theme4 = "#CED4DA";
        theme5 = "#CED4DA";
        theme6 = "#3B97E0";
    }
    else if(result["theme"] === "dark"){
        theme1 = "#36393F";
        theme2 = "#DCDDDE";
        theme3 = "#72767E";
        theme4 = "#303136";
        theme5 = "#303136";
        theme6 = "#3B97E0";
    }
    else if(result["theme"] != null){
        var shortThemeName = result["theme"];
        chrome.storage.local.get(["customThemes"], function(result) {
            var themeName = shortThemeName+"-customTheme";

            theme1 = result["customThemes"][themeName]["theme1"];
            theme2 = result["customThemes"][themeName]["theme2"];
            theme3 = result["customThemes"][themeName]["theme3"];
            theme4 = result["customThemes"][themeName]["theme4"];
            theme5 = result["customThemes"][themeName]["theme5"];
            theme6 = result["customThemes"][themeName]["theme6"];
        });
    }
    ghostColors = [theme2, theme2, theme2, theme2, theme2, theme2, theme2];
    chrome.storage.local.get(["tetrisSurvivalGameBoard"], function(result) {
        if(Object.keys(result).length != 0 && Object.keys(result.tetrisSurvivalGameBoard).length != 0){
            board = result.tetrisSurvivalGameBoard.board;
            currentX = result.tetrisSurvivalGameBoard.currentX;
            currentY = result.tetrisSurvivalGameBoard.currentY;
            current = result.tetrisSurvivalGameBoard.current;
            heldShapeId = result.tetrisSurvivalGameBoard.heldShapeId;
            currentId = result.tetrisSurvivalGameBoard.currentId;
            canHoldShape = result.tetrisSurvivalGameBoard.canHoldShape;
            shapeBag = result.tetrisSurvivalGameBoard.shapeBag;
            timeInt = result.tetrisSurvivalGameBoard.time;
            score = result.tetrisSurvivalGameBoard.score;
            lockDelayInt = result.tetrisSurvivalGameBoard.lockDelay;
            b2b = result.tetrisSurvivalGameBoard.b2b;
            comboLength = result.tetrisSurvivalGameBoard.comboLength;
            tspin = result.tetrisSurvivalGameBoard.tspin;
            prevMoveWasRotate = result.tetrisSurvivalGameBoard.prevMoveWasRotate;
            move = result.tetrisSurvivalGameBoard.move;
            debbieDelay = result.tetrisSurvivalGameBoard.debbieDelay;
            b2bBonus = result.tetrisSurvivalGameBoard.b2bBonus;
            redBar = result.tetrisSurvivalGameBoard.redBar;
            powerup = result.tetrisSurvivalGameBoard.powerup;

            if(board == undefined){
                board = result.tetrisSurvivalGameBoard[0];
                newShape();
            }
            else if(current == undefined){
                newShape();
            }
            timer.start();
        }
        else{
            init();
        }
        canvas.style.display = 'none';
        //resume btn
        var resumeBtn = document.createElement("button");
        resumeBtn.innerHTML = 'Resume';
        resumeBtn.style.backgroundColor = 'green';
        resumeBtn.onclick = function(){
            $("body").css("overflow", "hidden");
            menu.style.display = 'none';
            canvas.style.display = 'initial';
            newGame();
        };
        document.getElementById('resume/restart').appendChild(resumeBtn);

        //restart btn
        var restartBtn = document.createElement("button");
        restartBtn.innerHTML = 'Start/Restart';
        restartBtn.style.backgroundColor = 'red';
        restartBtn.onclick = function(){
            $("body").css("overflow", "hidden");
            menu.style.display = 'none';
            canvas.style.display = 'initial';
            init();
            newGame();
        };
        document.getElementById('resume/restart').appendChild(restartBtn);
    });
});

function activatePowerup(powerup){
    if(powerup == 0){
        //next 5 blocks is the same as the current one
        shapeBag.push(currentId, currentId, currentId, currentId, currentId);
    }
    else if(powerup == 1){
        //clear 4 lines
        for (var y = ROWS - 1; y >= 4; y--) {
            for (var x = COLS - 1; x >= 0; x--) {
                board[y][x]=board[y-4][x];
            }
        }
        for(var y = 4; y >= 0; y--){
            for (var x = COLS - 1; x >= 0; x--) {
                board[y][x]=0;
            }
        }
    }
    else if(powerup == 2){
        //don't increase the red bar & dont send garbage for 20s
    }
    else if(powerup == 3){
        //x2 score for 30s
    }
}

//add garbage lines
function addGarbage(holeLocation, lines){
    for (var i = 0; i < lines; i++) {
        for ( var y = 0; y <= ROWS-2; ++y ) {
            for ( var x = 0; x < COLS; ++x ) {
                board[y][x] = board[y + 1][x];
            }
        }
        for ( var x = 0; x < COLS; ++x ) {
            if(x != holeLocation){
                board[ROWS-1][x] = 1;
            }
            else{
                board[ROWS-1][x] = 0;
            }
        }
    }
}
function runSurvivalTetris(){
    var garbageSchedule = []; //[[interval, lines],[interval,lines],etc]
    //0:00-2:30
    if (timeInt <= 150){
        garbageSchedule = [[15, 2]];
    }
    //2:31-5:00
    else if (timeInt <= 300){
        garbageSchedule = [[15, 2],[50,4]];
    }
    //5:01-7:30
    else if (timeInt <= 450){
        garbageSchedule = [[15, 3],[50,4]];
    }
    //7:31-10:00
    else if (timeInt <= 600){
        garbageSchedule = [[15, 3],[50,4],[25,1]];
    }
    //10:01-12:30
    else if (timeInt <= 750){
        garbageSchedule = [[10, 3],[50,4],[25,1]];
    }
    //12:31-15:00
    else if (timeInt <= 900){
        garbageSchedule = [[10, 3],[50,4],[25,1],[75,6]];
    }
    //15:01-17:30
    else if (timeInt <= 1050){
        garbageSchedule = [[10, 3],[50,4],[25,1],[75,10]];
    }
    //17:30-20:00
    else if (timeInt <= 1200){
        garbageSchedule = [[10, 3],[50,4],[15,1],[75,10]];
    }
    for (var i = garbageSchedule.length - 1; i >= 0; i--) {
        if(timeInt % garbageSchedule[i][0] == 0){
            redBar.push(garbageSchedule[i][1]);
        }
    }


}

function barHeight(redBar){
	var result = 0;
	for (var i = redBar.length - 1; i >= 0; i--) {
		result += redBar[i];
	}
	return result;
}

// create a new 4x4 shape in global variable 'current'
// 4x4 so as to cover the size when the shape is rotated
function newShape(shapeId) {
    if(shapeId == null){
        // If shape bag is empty
        if(shapeBag.length == 0){
            shapeBag = shuffle([0, 1, 2, 3, 4, 5, 6]);
            shapeBag = shapeBag.concat(shuffle([0, 1, 2, 3, 4, 5, 6]));
        }

        currentId = shapeBag[shapeBag.length-1]; // Get last element from list
        shapeBag.pop(); // remove last element from list
    } else {
        currentId = shapeId;
        
    }
    var shape = shapes[currentId]; // maintain id for color filling
    current = [];
    for ( var y = 0; y < 4; ++y ) {
        current[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            var i = 4 * y + x;
            if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                current[ y ][ x ] = currentId + 1;
            }
            else {
                current[ y ][ x ] = 0;
            }
        }
    }
    
    // new shape starts to move
    freezed = false;
    // position where the shape will evolve
    currentX = 3;
    currentY = 0;
}

// clears the board
function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
    timer.reset();
    timer.start();
    lockDelay.stop();
    lockDelay.reset();
    shapeBag = [];
    score = 0;
    failed = true;
    heldShapeId = undefined;
    currentId = undefined;
    canHoldShape = true;
    b2b = false;
    b2bBonus = 1;
    comboLength = 0;
    tspin = false;
    move = "";
    debbieDelay = 0;
    redBar = [];
    powerup = $("#powerups").val();
    newShape();
}

function loadSave(){
    //set board to saved board & all variables to saved variables
}

// keep the element moving down, creating new shapes and clearing lines
function tick(key) {
    if(!$("#tetrisSurvivalCanvas").is(":visible")){
        goBack();
    }

    if ( valid( 0, 1 ) ) {
        ++currentY;
    }
    // if the element settled
    else {
        lockDelay.start();
        if (lockDelayInt >= 1000 || key == 'drop') {
            freeze();
            valid(0, 1);
            clearLines();
            if (lose) {
                chrome.storage.local.set({tetrisSurvivalGameBoard: undefined});
                clearAllIntervals();
                timer.stop();
                setTimeout(gameEnded, 30);
                return false;
            }
            newShape();
            canHoldShape = true;
            lockDelay.stop();
            lockDelay.reset();
        }
    }

    chrome.storage.local.set({tetrisSurvivalGameBoard: {board: board, 
                                                    currentX: currentX, 
                                                    currentY: currentY, 
                                                    current: current,
                                                    heldShapeId: heldShapeId,
                                                    currentId: currentId,
                                                    canHoldShape: canHoldShape,
                                                    shapeBag: shapeBag,
                                                    time: timeInt,
                                                    score: score,
                                                    lockDelay: lockDelayInt,
                                                    redBar: redBar,
                                                    b2b: b2b,
                                                    comboLength: comboLength,
                                                    tspin: tspin,
                                                    prevMoveWasRotate: prevMoveWasRotate,
                                                    move: move,
                                                    debbieDelay: debbieDelay,
                                                    b2bBonus: b2bBonus,
                                                    powerup: powerup
                                                    }});
}

// stop shape at its position and fix it to board
function freeze() {
    //check for 3 corner t spin
    tspin = false;
    var filledCorners = 0;
    if(currentId == 6){
        for (var i = 0; i < 4; i++) {
            if(board.length - 1 < currentY + corners[i][0] || board[currentY + corners[i][0]].length - 1 < currentX + corners[i][1]){
                filledCorners += 1;
            }
            else if(board[currentY + corners[i][0]][currentX + corners[i][1]] != 0){
                filledCorners += 1;
            }
        }
        if(filledCorners >= 3 && prevMoveWasRotate){
        	tspin = true;
        }

    }

    for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
            if (current[y][x]) {
                board[y + currentY][x + currentX] = current[y][x];
            }
        }
    }
    freezed = true;
}

// returns rotates the rotated shape 'current' perpendicularly anticlockwise
function rotate( current, type ) {
    newCurrent = [];
    rotSet = shapeRotation[currentId];
    if (type == 'normal') {
        if (rotSet.indexOf(current) == 3) {
            newCurrent = rotSet[0];
            origPos = 3;
            newPos = 0;
        } else if (rotSet.indexOf(current) == -1) {
            newCurrent = rotSet[1];
            origPos = 0;
            newPos = 1;
        } else {
            newCurrent = rotSet[rotSet.indexOf(current)+1];
            origPos = rotSet.indexOf(current);
            newPos = rotSet.indexOf(current)+1;
        }
    } else {
        if (rotSet.indexOf(current) == 0) {
            newCurrent = rotSet[3];
            origPos = 0;
            newPos = 3;
        } else if (rotSet.indexOf(current) == -1) {
            newCurrent = rotSet[3];
            origPos = 0;
            newPos = 3;
        } else {
            newCurrent = rotSet[rotSet.indexOf(current)-1];
            origPos = rotSet.indexOf(current);
            newPos = rotSet.indexOf(current)-1;
        }
    }
    return [newCurrent, origPos, newPos];

}

// check if any lines are filled and clear them
function clearLines() {
    var rowsCleared = 0;
    for ( var y = ROWS - 1; y >= 0; --y ) {
        var rowFilled = true;
        for ( var x = 0; x < COLS; ++x ) {
            if ( board[ y ][ x ] == 0 ) {
                rowFilled = false;
                break;
            }
        }
        if ( rowFilled ) {
            rowsCleared++;
            for ( var yy = y; yy > 0; --yy ) {
                for ( var x = 0; x < COLS; ++x ) {
                    board[ yy ][ x ] = board[ yy - 1 ][ x ];
                }
            }
            ++y;
        }
    }

    var pointsAwarded = 0;
    b2bBonus = 1;

    //increase score
    if(b2b){
        b2bBonus = 1.5;
    }
    if(rowsCleared == 0){
        comboLength = 0;
        for (var i = redBar.length - 1; i >= 0; i--) {
        	var holeLocation = Math.floor(Math.random()*COLS);
        	addGarbage(holeLocation, redBar[i]);
        }
        redBar = [];
    }
    else{
        b2b = false;
        comboLength += 1;
        defaultDebbie.stop();
        defaultDebbie.reset();
        var pc = true;
        for ( var y = ROWS - 1; y >= 0; --y ) {
            if(!pc){break;}
            for ( var x = 0; x < COLS; ++x ) {
                if ( board[ y ][ x ] != 0 ) {
                    pc = false;
                    break;
                }
            }
        }
        if(!pc){
            if (rowsCleared == 1){
                if(tspin){
                    pointsAwarded = 400*b2bBonus;
                    b2b = true;
                    move = "TSPIN SINGLE";
                }
                else{
                    pointsAwarded = 100;
                    move = "SINGLE";
                    b2bBonus = 1;
                }
            }
            else if(rowsCleared == 2){
                if(tspin){
                    pointsAwarded = 800*b2bBonus;
                    b2b = true;
                    move = "TSPIN DOUBLE";
                }
                else{
                    pointsAwarded = 300;
                    move = "DOUBLE";
                    b2bBonus = 1;
                }
            }
            else if(rowsCleared == 3){
                if(tspin){
                    pointsAwarded = 1600*b2bBonus;
                    b2b = true;
                    move = "TSPIN TRIPLE";
                }
                else{
                    pointsAwarded = 500
                    move = "Triple";
                    b2bBonus = 1;
                }
            }
            else if(rowsCleared == 4){
                pointsAwarded = 800*b2bBonus;
                b2b = true;
                move = "TETRIS";
            }
            pointsAwarded += (comboLength*50 - 50);
        }
        else{
            move = "PERFECT CLEAR";
            pointsAwarded = 2500;
        }

        //200pts per line
        var garbageSubtracted = Math.ceil(pointsAwarded/200);

        if(barHeight(redBar) < garbageSubtracted){
            redBar = [];
            score += 200*(garbageSubtracted-barHeight(redBar));
        }
        else{
            while(garbageSubtracted != 0){
                if(garbageSubtracted >= redBar[redBar.length - 1]){
                    garbageSubtracted -= redBar[redBar.length - 1];
                    redBar.pop();
                }
                else{
                    redBar[redBar.length - 1] -= garbageSubtracted;
                    garbageSubtracted = 0;
                }
            score += garbageSubtracted * 200;

        }
        }

        
    }

}

function keyPress( key ) {
    switch ( key ) {
        case 'down':
            if ( valid( 0, 1 ) ) {
                ++currentY;
                prevMoveWasRotate = false;
            }
            break;
        case 'rotate':
            if (currentId != 3) {
                var rotated = rotate( current, 'normal' );
                if (currentId == 0) {
                    tests = testI[rotated[1].toString() + ", " + rotated[2].toString()]
                } else {
                    tests = testReg[rotated[1].toString() + ", " + rotated[2].toString()]
                }
                for (i = 0; i < tests.length; i++) {
                    if ( valid( tests[i][0], tests[i][1]*-1, rotated[0] ) ) {
                        current = rotated[0];
                        currentX += tests[i][0];
                        currentY -= tests[i][1];
                        prevMoveWasRotate = true;
                        break;
                    }
                }
            }
            break;
        case 'drop':
            while( valid(0, 1) ) {
                ++currentY;
                prevMoveWasRotate = false;
            }
            tick('drop');
            break;
        case 'hold':
            if(canHoldShape){
                var lastShapeId = currentId;
                newShape(heldShapeId);
                heldShapeId = lastShapeId;
                canHoldShape = false;
                prevMoveWasRotate = false;
            }
            break;
        case 'rotateOther':
            if (currentId != 3) {
                var rotated = rotate( current, 'other' );
                if (currentId == 0) {
                    tests = testI[rotated[1].toString() + ", " + rotated[2].toString()]
                } else {
                    tests = testReg[rotated[1].toString() + ", " + rotated[2].toString()]
                }
                for (i = 0; i < tests.length; i++) {
                    if ( valid( tests[i][0], tests[i][1]*-1, rotated[0] ) ) {
                        current = rotated[0];
                        currentX += tests[i][0];
                        currentY -= tests[i][1];
                        prevMoveWasRotate = true;
                        break;
                    }
                }
            }
            break;
        case 'powerup':
            if(score >= powerupCosts[powerup]){
                score -= powerupCosts[powerup];
                activatePowerup(powerup);
            }
    }
}

// checks if the resulting position of current shape will be feasible
function valid( offsetX, offsetY, newCurrent ) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;

    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( newCurrent[ y ][ x ] ) {
                if ( typeof board[ y + offsetY ] == 'undefined'
                  || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                  || board[ y + offsetY ][ x + offsetX ]
                  || x + offsetX < 0
                  || y + offsetY >= ROWS
                  || x + offsetX >= COLS ) {
                    if (offsetY == 1 && freezed) {
                        lose = true; // lose if the current shape is settled at the top most row
                    }
                    return false;
                }
            }
        }
    }
    return true;
}

function newGame() {
    document.addEventListener("keydown", keydownFunction);
    document.addEventListener("keyup", stopHold);
    clearAllIntervals();
    intervalRender = setInterval(render, renderInterval);
    interval = setInterval( tick, tickInterval);
}

function clearAllIntervals(){
    clearInterval(interval);
    clearInterval(intervalRender);
}

function refreshIntervals(){
    clearInterval(interval);
    clearInterval(intervalRender);
    interval = setInterval( tick, tickInterval);
    intervalRender = setInterval(render, renderInterval);
}

function keydownFunction(e) {
    var keys = {
        37: 'left',
        39: 'right',
        40: 'down',
        38: 'rotate',
        32: 'drop',
        16: 'hold',
        91: 'rotateOther',
        81: 'powerup'
    };
    if (typeof keys[ e.keyCode ] != 'undefined') {
        if (e.keyCode == 37){
            keypress = true;
            holdLeft = true;
        }
        else if (e.keyCode == 39){
            keypress = true;
            holdRight = true;
        }
        keyPress( keys[ e.keyCode ] );
        render();
    }
};
function stopHold(e){
    if (e.keyCode == 37){
        holdLeft = false;
        keypress = false;
        keydownTime = holdDelay;
    }
    else if (e.keyCode == 39){
        holdRight = false;
        keypress = false;
        keydownTime = holdDelay;
    }
}


var W = 250, H = 500;
var BLOCK_W = W / COLS, BLOCK_H = H / ROWS;
var SMALL_BLOCK_W = 16;
var SMALL_BLOCK_H = 16;

// draw a single square at (x, y)
function drawBlock(x, y, color) { // if there is a connecting block on each side
    ctx.fillStyle = color;
    ctx.fillRect( BLOCK_W * x + 50, BLOCK_H * y, BLOCK_W, BLOCK_H);
    ctx.strokeRect( BLOCK_W * x + 50, BLOCK_H * y, BLOCK_W, BLOCK_H);
}

function drawSmallBlock(x, y, offsetX, offsetY, color) { // if there is a connecting block on each side
    ctx.fillStyle = color;
    ctx.fillRect(SMALL_BLOCK_W*x + offsetX, SMALL_BLOCK_W*y + offsetY, SMALL_BLOCK_W, SMALL_BLOCK_W);
    ctx.strokeRect(SMALL_BLOCK_H*x + offsetX, SMALL_BLOCK_H*y + offsetY, SMALL_BLOCK_H, SMALL_BLOCK_H);
}

function drawShadowBlock(x, y, color) { // if there is a connecting block on each side
    ctx.strokeStyle = color;
    ctx.strokeRect((BLOCK_W*x)+52, (BLOCK_H*y)+2, BLOCK_W-4, BLOCK_H-4);
}


// draws the board and the moving shape
function render() {
    //quick move left & right
    if (keypress){
        if(keydownTime == 0){
            if ( valid( -1 ) && holdLeft){
                --currentX;   
            }
            else if ( valid( 1 ) && holdRight){
                ++currentX;
            }
        }
        else if(keydownTime == holdDelay){
            if ( valid( -1 ) && holdLeft){
                --currentX;   
            }
            else if ( valid( 1 ) && holdRight){
                ++currentX;
            }
        }
        if(!(keydownTime == 0)){
            --keydownTime;
        }
    }
//reset board
    ctx.clearRect( 50, 0, W, H );

//draw settled blocks
    ctx.strokeStyle = theme1;
    for ( var x = 0; x < COLS; ++x ) {
        for ( var y = 0; y < ROWS; ++y ) {
            if ( board[ y ][ x ] ) {
                ctx.fillStyle = setColor(board[y][x] - 1);
                drawBlock(x, y, '#aaaaaa');
            }
        }
    }
//draw ghost block
    ctx.strokeStyle = theme2;
    ctx.lineWidth=0.5;
    yValid=0;
    while( valid(0, yValid) ) {
        ++yValid;
    }
    for (var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                drawShadowBlock(currentX + x, currentY + y + yValid - 1, ghostColors[currentId]);
            }
        }
    }
//draw current block
    ctx.strokeStyle = theme1;
    ctx.lineWidth=2;
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                ctx.fillStyle = setColor(current[y][x] - 1);
                drawBlock(currentX + x, currentY + y, blockColors[currentId]);
                
            }
        }
    }

    //draw timer
    ctx.fillStyle = theme2;
      ctx.font="Bold 15px Verdana";
      ctx.textBaseline="bottom"; 
      ctx.textAlign="left";
      ctx.fillText("Time: "+tetrisSurvivalFormatTime(timeInt),60,15);

    //draw score
      ctx.font="Bold 15px Verdana";
      ctx.textBaseline="bottom"; 
      ctx.textAlign="left";
      if(score>=powerupCosts[powerup]){
        ctx.fillStyle = 'green';
      }
      ctx.fillText("Score: "+score+"/"+powerupCosts[powerup],60,35);
      ctx.fillText(powerupName,60,55);

    // Draw hold and next piece
    ctx.fillStyle = theme5;
    ctx.fillRect(0, 0, 50, 500);
    ctx.fillRect(300, 0, 50, 500);
    ctx.fillStyle = theme2;
    ctx.font="10px Verdana";
    ctx.textAlign = "center";
    ctx.textBaseline="top"; 
    ctx.fillText("HOLD",24,8);

    var heldShape = smallShapes[heldShapeId]; // maintain id for color filling
    if(heldShape != null && heldShapeId == 0){
        ctx.strokeStyle = theme1;
        ctx.lineWidth=2;
        for(var y = 0; y < 4; ++y){
            for(var x = 0; x < 2; ++x){
                if(heldShape[y][x]) {
                    drawSmallBlock(x, y, 0.5, 23, blockColors[heldShapeId]);
                }
            }
        }
    } else if (heldShape != null) {
        ctx.strokeStyle = theme1;
        ctx.lineWidth=2;
        for(var y = 0; y < 4; ++y){
            for(var x = 0; x < 2; ++x){
                if(heldShape[y][x]) {
                    drawSmallBlock(x, y, 8, 23, blockColors[heldShapeId]);
                }
            }
        }
    }
    ctx.fillStyle = theme2;
    ctx.fillText("NEXT",326,8);
    // If shape bag is empty
    if(shapeBag.length == 0){
        shapeBag = shuffle([0, 1, 2, 3, 4, 5, 6]);
    } else if (shapeBag.length < 5) {
        tShapeBag = shuffle([0, 1, 2, 3, 4, 5, 6])
        shapeBag = tShapeBag.concat(shapeBag);
    }
    
    for (i = 0; i < 5; i++) {
        var id = shapeBag[shapeBag.length-1-i]; // Get last element from list
        var shape = smallShapes[id]; // maintain id for color filling
    
        ctx.strokeStyle = theme1;
        ctx.lineWidth=2;
        if (id == 0) {
            for(var y = 0; y < 4; ++y){
                for(var x = 0; x < 2; ++x){
                    if(shape[y][x]) {
                        drawSmallBlock(x, y, 302, 23 + i*70, blockColors[id]);
                    }
                }
            }
        } else if (id == 3) {
            for(var y = 0; y < 4; ++y){
                for(var x = 0; x < 2; ++x){
                    if(shape[y][x]) {
                        drawSmallBlock(x, y, 310, 17 + i*70, blockColors[id]);
                    }
                }
            }
        } else {
            for(var y = 0; y < 4; ++y){
                for(var x = 0; x < 2; ++x){
                    if(shape[y][x]) {
                        drawSmallBlock(x, y, 310, 23 + i*70, blockColors[id]);
                    }
                }
            }
        }
    }

    //default debbie
    ctx.fillStyle = theme2;
    if(move != "" && debbieDelay < 1000){
    	defaultDebbie.start();
        //print move, eg TSPIN SINGLE
        if(b2bBonus == 1.5){
            ctx.fillText("Back to Back",150,80)
        }
        ctx.font="Bold 25px Verdana";
        ctx.fillStyle = 'orange';
        ctx.fillText(move,150,100);
        //print combo length
        ctx.fillStyle = 'green';
        if(comboLength > 1){
            ctx.font="Bold 20px Verdana";
            ctx.fillText(comboLength - 1 + "Combo!",150,120);
        }
    }
    else{
    	move = "";
    	defaultDebbie.stop();
    	defaultDebbie.reset();
    }

    //draw red bar
	ctx.fillStyle = 'red';
    ctx.fillRect(10, 500, 30, -20*barHeight(redBar));
}

function tetrisSurvivalFormatTime(time){
    var minutes = Math.floor(time/60).toString();
    var seconds = (time % 60).toString();
    if(seconds.length == 1){
        seconds = '0'+seconds;
    }
    return minutes + ':' + seconds;
}

function gameEnded() {
    lose = false;
    document.removeEventListener("keydown", keydownFunction);
    document.removeEventListener("keyup", stopHold);
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = theme1;
    ctx.fillRect(0, 0, 350, H);
    ctx.globalAlpha = 1;
    chrome.storage.local.get(["gameHighScore"], function(result) {
        ctx.fillStyle = theme2;
        ctx.textAlign="center";

        if(Object.keys(result).length === 0){
            chrome.storage.local.set({gameHighScore: {"tetrisSurvival": timeInt}});
            ctx.font="20px Verdana";
            ctx.fillText("Time Alive: "+tetrisSurvivalFormatTime(timeInt),175,130);
            gameHighScore(game, timeInt);
        }
        else if(!result["gameHighScore"].hasOwnProperty(game)){
            var gameHighscore = result["gameHighScore"];
            gameHighscore[game] = timeInt;
            chrome.storage.local.set({gameHighScore: gameHighscore});
            ctx.font="20px Verdana";
            ctx.fillText("Time Alive: "+tetrisSurvivalFormatTime(timeInt),175,130);
            gameHighScore(game, timeInt);

        }
        else if(result["gameHighScore"][game] < timeInt){
            var gameHighScores = result["gameHighScore"];  
            gameHighScores[game] = timeInt;
            chrome.storage.local.set({gameHighScore: gameHighScores});
            gameHighScore(game, timeInt);
            ctx.font="20px Verdana";
            ctx.fillText("New High Score!: "+tetrisSurvivalFormatTime(timeInt),175,130);
        }
        else if (!failed) {
            var gameHighscore = result["gameHighScore"][game];
            ctx.font="20px Verdana";
            ctx.fillText("Time Alive: "+timeInt,175,130);
            ctx.font="14px Verdana";
            ctx.fillText("Highscore: "+tetrisSurvivalFormatTime(gameHighscore), 175, 152);
            gameHighScore(game, gameHighscore);
        }
        ctx.font="14px Verdana";
        ctx.fillText("Press R To Restart",175,190);
        ctx.fillText("Press Enter To View Leaderboard",175,206);

    });
}

function restartTetris(event){
    if(event.keyCode==82){
        init();
        newGame();
    }

    if(event.code==="Enter"){
        getGameHighScores(game, {reverse: false, formatter: "tetrisSurvivalFormatTime"});
    }
}

function setColor(number){
    return shadeColor(theme2, number/12);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function shadeColor(c0, p) {  
    c1 = theme4;
    var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
    return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
}
})();