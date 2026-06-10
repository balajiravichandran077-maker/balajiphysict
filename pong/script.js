// Game Constants
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 400;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 4;
const MAX_BALL_SPEED = 8;
const WIN_SCORE = 11;

// Game State
const gameState = {
    playerScore: 0,
    computerScore: 0,
    gameActive: true,
    gameOver: false
};

// Ball Object
const ball = {
    x: BOARD_WIDTH / 2,
    y: BOARD_HEIGHT / 2,
    vx: INITIAL_BALL_SPEED,
    vy: INITIAL_BALL_SPEED,
    speed: INITIAL_BALL_SPEED
};

// Player Paddle
const playerPaddle = {
    x: 20,
    y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Computer Paddle
const computerPaddle = {
    x: BOARD_WIDTH - 20 - PADDLE_WIDTH,
    y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 4.5
};

// Input Handling
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keys[e.key] = false;
    }
});

// Mouse tracking for paddle control
const gameBoard = document.getElementById('gameBoard');
gameBoard.addEventListener('mousemove', (e) => {
    const rect = gameBoard.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const targetY = Math.max(0, Math.min(mouseY - PADDLE_HEIGHT / 2, BOARD_HEIGHT - PADDLE_HEIGHT));
    
    // Smooth paddle movement towards mouse position
    const diff = targetY - playerPaddle.y;
    playerPaddle.dy = Math.max(-PADDLE_SPEED, Math.min(diff * 0.15, PADDLE_SPEED));
});

// Update player paddle with keyboard input
function updatePlayerPaddle() {
    if (keys.ArrowUp) {
        playerPaddle.dy = -PADDLE_SPEED;
    } else if (keys.ArrowDown) {
        playerPaddle.dy = PADDLE_SPEED;
    }
    
    playerPaddle.y += playerPaddle.dy;
    
    // Boundary collision for player paddle
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + playerPaddle.height > BOARD_HEIGHT) {
        playerPaddle.y = BOARD_HEIGHT - playerPaddle.height;
    }
}

// Update computer paddle with AI
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const paddleCenter = ball.y;
    
    // AI difficulty: follow the ball with some delay
    const difficulty = 0.7; // 0.5 = easy, 1.0 = hard
    
    if (computerCenter < paddleCenter - 10) {
        computerPaddle.y += computerPaddle.speed * difficulty;
    } else if (computerCenter > paddleCenter + 10) {
        computerPaddle.y -= computerPaddle.speed * difficulty;
    }
    
    // Boundary collision for computer paddle
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > BOARD_HEIGHT) {
        computerPaddle.y = BOARD_HEIGHT - computerPaddle.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Top and bottom wall collision
    if (ball.y - BALL_SIZE / 2 <= 0 || ball.y + BALL_SIZE / 2 >= BOARD_HEIGHT) {
        ball.vy *= -1;
        ball.y = Math.max(BALL_SIZE / 2, Math.min(ball.y, BOARD_HEIGHT - BALL_SIZE / 2));
    }
}

// Check collision between ball and paddle
function checkPaddleCollision(paddle) {
    if (
        ball.x - BALL_SIZE / 2 < paddle.x + paddle.width &&
        ball.x + BALL_SIZE / 2 > paddle.x &&
        ball.y - BALL_SIZE / 2 < paddle.y + paddle.height &&
        ball.y + BALL_SIZE / 2 > paddle.y
    ) {
        // Ball hit the paddle
        const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        const angle = (Math.PI / 4) * hitPos;
        
        ball.speed = Math.min(ball.speed + 0.5, MAX_BALL_SPEED);
        ball.vx = ball.speed * Math.cos(angle) * (ball.vx > 0 ? 1 : -1);
        ball.vy = ball.speed * Math.sin(angle);
        
        // Prevent ball from getting stuck
        ball.x = paddle === playerPaddle 
            ? paddle.x + paddle.width + BALL_SIZE / 2 
            : paddle.x - BALL_SIZE / 2;
        
        return true;
    }
    return false;
}

// Reset ball to center
function resetBall() {
    ball.x = BOARD_WIDTH / 2;
    ball.y = BOARD_HEIGHT / 2;
    ball.speed = INITIAL_BALL_SPEED;
    ball.vx = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = INITIAL_BALL_SPEED * (Math.random() * 2 - 1);
}

// Check win condition
function checkWinCondition() {
    if (gameState.playerScore >= WIN_SCORE) {
        gameState.gameOver = true;
        showGameOver('You Won! 🎉');
        return true;
    }
    if (gameState.computerScore >= WIN_SCORE) {
        gameState.gameOver = true;
        showGameOver('Computer Won! 🤖');
        return true;
    }
    return false;
}

// Show game over message
function showGameOver(message) {
    const gameInfo = document.getElementById('gameInfo');
    gameInfo.textContent = message + ' - Press F5 to play again';
    gameInfo.style.color = '#00ff00';
}

// Update display
function updateDisplay() {
    document.getElementById('playerScore').textContent = gameState.playerScore;
    document.getElementById('computerScore').textContent = gameState.computerScore;
    
    const playerPaddleEl = document.getElementById('playerPaddle');
    playerPaddleEl.style.top = playerPaddle.y + 'px';
    
    const computerPaddleEl = document.getElementById('computerPaddle');
    computerPaddleEl.style.top = computerPaddle.y + 'px';
    
    const ballEl = document.getElementById('ball');
    ballEl.style.left = ball.x + 'px';
    ballEl.style.top = ball.y + 'px';
}

// Game loop
function gameLoop() {
    if (!gameState.gameOver) {
        // Update game state
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
        
        // Check paddle collisions
        checkPaddleCollision(playerPaddle);
        checkPaddleCollision(computerPaddle);
        
        // Check scoring
        if (ball.x < 0) {
            gameState.computerScore++;
            if (!checkWinCondition()) {
                resetBall();
            }
        }
        if (ball.x > BOARD_WIDTH) {
            gameState.playerScore++;
            if (!checkWinCondition()) {
                resetBall();
            }
        }
        
        // Update display
        updateDisplay();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
updateDisplay();
gameLoop();
