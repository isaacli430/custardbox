(function() {
// Snake Game
var game = "snake";

var theme1 = "#36393F";
var theme2 = "#DCDDDE";
var theme3 = "#72767E";
var theme4 = "#303136";
var theme5 = "#303136";
var theme6 = "#3B97E0";

var snakeInterval = false;

let BLOCK_SIZE = 14;
let ADD_LENGTH = 4;

var snake;

let GAME_SPEED = 100;
let score = 0;
let changingDirection = false;
let ateFoodTickLeft = 0;
let foodX;
let foodY;
let dx = BLOCK_SIZE;
let dy = 0;
//added variables
let isE = false;
let hitWall = false;
let wallsOn = false;
//survival mode variables
let survival = false;
let growthspeed = 5;
let timer = growthspeed;
let SHORTEN_LENGTH = 1;
let rest = false;

var gameCanvas = document.getElementById("snakeCanvas");
var ctx = gameCanvas.getContext("2d");

window.openSnakeTab = function(){
    if(snakeInterval){
        clearInterval(snakeInterval);
        snakeInterval = false;
    }
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

//todo:        chrome.storage.local.remove(["survivalSnake"]);
        
        document.addEventListener("keydown", restartSnake);
        ctx.fillStyle = theme1;
        ctx.strokeStyle = theme3;
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.fillStyle = theme2;
        ctx.textAlign="center"; 
        ctx.font="15px Verdana";
        ctx.fillText("For different speeds,",175,100);
        ctx.fillText("press 1, 2, or 3",175,120);
        ctx.fillText("More importantly, don't press E",175,140);
        ctx.fillText("For survival mode press S",175,160);
        ctx.fillText("To toggle walls, press W",175,180);
        ctx.fillText("Move around using arrow keys",175,200);
    });
}

function startSnake(){
    snake = [
        {x: 168, y: 140},
        {x: 154, y: 140},
        {x: 140, y: 140},
        {x: 126, y: 140},
        {x: 112, y: 140}
    ];

    if(isE){
        snake = [
        //back of ballsac
        {x: 0, y: 168},
        {x: 0, y: 154},
        {x: 14, y: 140},
        {x: 0, y: 126},
        {x: 0, y: 112},
        //right ball
        {x: 14, y: 182},
        {x: 28, y: 194},
        {x: 42, y: 194},
        {x: 56, y: 182},
        {x: 70, y: 168},
        //right shaft wall
        {x: 84, y: 154},
        {x: 98, y: 154},
        {x: 112, y: 154},
        {x: 126, y: 154},
        {x: 140, y: 154},
        {x: 154, y: 154},
        {x: 168, y: 154},
        //left ball
        {x: 14, y: 98},
        {x: 28, y: 84},
        {x: 42, y: 84},
        {x: 56, y: 98},
        {x: 70, y: 112},
        //left shaft wall
        {x: 84, y: 126},
        {x: 98, y: 126},
        {x: 112, y: 126},
        {x: 126, y: 126},
        {x: 140, y: 126},
        {x: 154, y: 126},
        {x: 168, y: 126},
        //bellend
        {x: 154, y: 140},
        {x: 182, y: 140},
        ]
    }


    createFood();
    runSnake();
    if(!snakeInterval){
        snakeInterval = setInterval(runSnake, GAME_SPEED);
    }
    document.removeEventListener("keydown", restartSnake);
    document.addEventListener("keydown", changeDirection);
}

function restartSnake(){
//reset everything
    survival = false;
    ateFoodTickLeft = 0;
    BLOCK_SIZE = 14;
    ADD_LENGTH = 4;
    isE = false;
    growthspeed = 5;
    timer = growthspeed;
    SHORTEN_LENGTH = 1;
    rest = false;
    score = 0;
    dx = BLOCK_SIZE;
    dy = 0;
    hitWall = false;
    if($('a[data-toggle="tab"].active').attr("href")!="#snake"){
        document.removeEventListener("keydown", restartSnake);
        return
    }

    if(event.code==="Digit1"){
        GAME_SPEED = 100;
        startSnake();
    }
    else if(event.code==="Digit2"){
        GAME_SPEED = 75;
        startSnake();
    }
    else if(event.code==="Digit3"){
        if(wallsOn){
        	BLOCK_SIZE = 7;
        	GAME_SPEED = 30;
        }
        else{
        	GAME_SPEED = 50;
        }
        startSnake();
    }
    else if(event.code==="KeyE"){
    GAME_SPEED = 100;
    isE = true;
    score = -6969420;
    startSnake();

    }

    else if(event.code==="KeyS"){
        ateFoodTickLeft = 10;
        GAME_SPEED = 75;
        ADD_LENGTH = 15;
        survival = true;
        startSnake();
    }

    if(event.code==="KeyW"){
        if(wallsOn){
            wallsOn = false;
            document.getElementById("snakeCanvasDiv").style.borderColor = theme1;

        }
        else{
            wallsOn = true;
            document.getElementById("snakeCanvasDiv").style.borderColor = "#ff0000";

        }
    }

    if(event.code==="Enter"){
        getGameHighScores(game);
    }
}

/**
 * Main function of the game
 * called repeatedly to advance the game
 */
function runSnake() {
    // If the game ended return early to stop game
    if (didGameEnd()){
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = theme1;
        ctx.strokeStyle = theme3;
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.globalAlpha = 1;
        highscore();
        document.removeEventListener("keydown", changeDirection);
        document.addEventListener("keydown", restartSnake);
        ctx.fillStyle = theme2;
        ctx.textAlign="center";        
        ctx.font="14px Verdana";
        ctx.fillText("1,2,3, S or E to play again, w to toggle walls.",175,190);
        ctx.fillText("Press Enter To View Leaderboard",175,206);
        clearInterval(snakeInterval);
        snakeInterval = false;
        return
    };
    changingDirection = false;
    clearCanvas();
    drawFood();
    advanceSnake();
    drawSnake();
    if(survival){runSnakeSurvival();}
}

function highscore(){
    chrome.storage.local.get(["gameHighScore"], function(result) {
        ctx.fillStyle = theme2;
        ctx.textAlign="center";
        if(Object.keys(result).length === 0){
            if(survival){
                chrome.storage.local.set({gameHighScore: {"survivalSnake": score}});
            }
            else{
                chrome.storage.local.set({gameHighScore: {"snake": score}});
                gameHighScore(game, score);
            }
            ctx.font="20px Verdana";
            ctx.fillText("New High Score!: "+score,175,130);
        }
        else if(survival){
            var highscore = result["gameHighScore"]["survivalSnake"];
            if(!("survivalSnake" in result["gameHighScore"]) || result["gameHighScore"]["survivalSnake"] < score){ 
                chrome.storage.local.set({gameHighScore: {"survivalSnake": score}});
                highscore = score;
                ctx.font="20px Verdana";
                ctx.fillText("New High Score!",175,100);
            }
            ctx.fillText("Score: "+score,175,130);
            ctx.font="14px Verdana";
            ctx.fillText("Highscore: "+ highscore,175,152);
        }
        else if(!result["gameHighScore"].hasOwnProperty(game)){
            var gameHighscore = result["gameHighScore"];
            gameHighscore[game] = score;
            chrome.storage.local.set({gameHighScore: gameHighscore});
            ctx.font="20px Verdana";
            ctx.fillText("New High Score!: "+score,175,130);
            gameHighScore(game, score);

        }
        else if(result["gameHighScore"][game] < score){
            var gameHighScores = result["gameHighScore"];  
            gameHighScores[game] = score;
            chrome.storage.local.set({gameHighScore: gameHighScores});
            gameHighScore(game, score);
            ctx.font="20px Verdana";
            ctx.fillText("New High Score!: "+score,175,130);
        }
        else{
            var gameHighscore = result["gameHighScore"][game];
            ctx.font="20px Verdana";
            ctx.fillText("Score: "+score,175,130);
            ctx.font="14px Verdana";
            ctx.fillText("Highscore: "+gameHighscore,175,152);
            gameHighScore(game, gameHighscore);
        }
    });

}

function runSnakeSurvival(){
    score += 1;
        if (score <= 400 && score % 100 == 0){
            growthspeed -= 1;
        }
        else if (score % 500 == 0){
            rest = true;
            growthspeed += 1;
            ADD_LENGTH += 5;
        }
        else if (score <= 1000 && score % 100 == 0){
            rest = false;
            SHORTEN_LENGTH += 1;
        }
        else if (score <= 2000 && score % 100 == 0){
            rest = false;
            growthspeed = 0;
            SHORTEN_LENGTH += 1;
        }
        if (timer == 0 && !rest) {
            snake.splice(snake.length - SHORTEN_LENGTH,SHORTEN_LENGTH);
            timer = growthspeed;
        }
        else if (timer >0){
            timer -= 1;
        }
}

/**
 * Change the background colour of the canvas to theme1 and
 * draw a border around it
 */
function clearCanvas() {
    // Select the colour to fill the drawing
    ctx.fillStyle = theme1;
    // Select the colour for the border of the canvas
    ctx.strokeStyle = theme3;
    // Draw a "filled" rectangle to cover the entire canvas
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    // Draw a "border" around the entire canvas
    ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.fillStyle = theme2;
    ctx.font="15px Verdana";
    ctx.fillText(score,320,15);
}
/**
 * Draw the food on the canvas
 */
function drawFood() {
    ctx.fillStyle = theme6;
    ctx.strokeStyle = theme1;
    ctx.fillRect(foodX, foodY, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeRect(foodX, foodY, BLOCK_SIZE, BLOCK_SIZE);
}
/**
 * Advances the snake by changing the x-coordinates of its parts
 * according to the horizontal velocity and the y-coordinates of its parts
 * according to the vertical veolocity
 */
function advanceSnake() {
    // Create the new Snake's head
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    // Add the new head to the beginning of snake body
    if(isE){
        for (var i = 0; i < snake.length; i++){
            snake[i].x += dx;
            snake[i].y += dy;
        }
    }
    else{
    	snake.unshift(head);
    }

    for (var i = 0; i < snake.length; i++) {
        if(snake[i].x < 0){
            hitWall = true;
            if(wallsOn){return}
            snake[i].x += gameCanvas.width;
        }
        if(snake[i].x > gameCanvas.width - BLOCK_SIZE){
            hitWall = true;
            if(wallsOn){return}
            snake[i].x -= gameCanvas.width;
        }
        if(snake[i].y < 0){
            hitWall = true;
            if(wallsOn){return}
            snake[i].y += gameCanvas.height;
        }
        if(snake[i].y > gameCanvas.height - BLOCK_SIZE){
            hitWall = true;
            if(wallsOn){return}
            snake[i].y -= gameCanvas.height;
            
        }
    }

    const didEatFood = snake[0].x === foodX && snake[0].y === foodY;
    if(isE){
    	for (var i = 0; i < snake.length; i++){
    		if(snake[i].x === foodX && snake[i].y === foodY){
    			score += 1;
    			createFood();
    		}
    	}
    }
    else if (didEatFood) {
        // Increase score
        score += 1;
        // Generate new food location
        createFood();
        ateFoodTickLeft+=ADD_LENGTH;
    }
    else if(ateFoodTickLeft==0){
        snake.pop();
    }
    else{
        ateFoodTickLeft-=1;
    }
}
/**
 * Returns true if the head of the snake touched another part of the game
 * or any of the walls, or for survival mode, if the snake became nonexistent
 */
function didGameEnd() {
    if (snake.length == 0)return true
    if (hitWall && wallsOn) return true
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y ) return true
    }
    return false
}
/**
 * Generates a random number that is a multiple of BLOCK_SIZE given a minumum
 * and a maximum number
 * @param { number } min - The minimum number the random number can be
 * @param { number } max - The maximum number the random number can be
 */
function randomTen(min, max) {
    return Math.ceil((Math.random() * (max-min) + min) / BLOCK_SIZE) * BLOCK_SIZE;
}
/**
 * Creates random set of coordinates for the snake food.
 */
function createFood() {
    // Generate a random number the food x-coordinate
    foodX = randomTen(0, gameCanvas.width - BLOCK_SIZE);
    // Generate a random number for the food y-coordinate
    foodY = randomTen(0, gameCanvas.height - BLOCK_SIZE);
    // if the new food location is where the snake currently is, generate a new food location
    snake.forEach(function isFoodOnSnake(part) {
        const foodIsoNsnake = part.x == foodX && part.y == foodY;
        if (foodIsoNsnake) createFood();
    });
}
/**
 * Draws the snake on the canvas
 */
function drawSnake() {
    // loop through the snake parts drawing each part on the canvas
    snake.forEach(drawSnakePart)
}
/**
 * Draws a part of the snake on the canvas
 * @param { object } snakePart - The coordinates where the part should be drawn
 */
function drawSnakePart(snakePart) {
    // Set the colour of the snake part
    ctx.fillStyle = theme2;
    // Set the border colour of the snake part
    ctx.strokeStyle = theme1;
    ctx.lineWidth=2;
    // Draw a "filled" rectangle to represent the snake part at the coordinates
    // the part is located
    ctx.fillRect(snakePart.x, snakePart.y, BLOCK_SIZE, BLOCK_SIZE);
    // Draw a border around the snake part
    ctx.strokeRect(snakePart.x, snakePart.y, BLOCK_SIZE, BLOCK_SIZE);
}
/**
 * Changes the vertical and horizontal velocity of the snake according to the
 * key that was pressed.
 * The direction cannot be switched to the opposite direction, to prevent the snake
 * from reversing
 * For example if the the direction is 'right' it cannot become 'left'
 * @param { object } event - The keydown event
 */
function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    /**
     * Prevent the snake from reversing
     * Example scenario:
     * Snake is moving to the right. User presses down and immediately left
     * and the snake immediately changes direction without taking a step down first
     */
    if (changingDirection) return;
    changingDirection = true;
    
    const keyPressed = event.keyCode;
    const goingUp = dy === -BLOCK_SIZE;
    const goingDown = dy === BLOCK_SIZE;
    const goingRight = dx === BLOCK_SIZE;
    const goingLeft = dx === -BLOCK_SIZE;
    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -BLOCK_SIZE;
        dy = 0;
    }
    
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -BLOCK_SIZE;
    }
    
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = BLOCK_SIZE;
        dy = 0;
    }
    
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = BLOCK_SIZE;
    }
}
})();

