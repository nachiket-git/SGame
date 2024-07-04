import { LightningElement } from 'lwc';

export default class SnakeGame extends LightningElement {
    canvas;
    ctx;
    snake = [{ x: 150, y: 150 }];
    dx = 10;
    dy = 0;
    foodX;
    foodY;
    obstacles = [];
    changingDirection = false;
    gameSpeed = 100;
    gameOver = false;
    gameStarted = false;
    intervalId;
    eatSound;

    renderedCallback() {
        if (this.canvas) {
            return;
        }
        this.canvas = this.template.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.eatSound = this.template.querySelector('.eat-sound');
    }

    startGame() {
        if (this.gameStarted) return;
        this.gameStarted = true;
        document.addEventListener('keydown', this.changeDirection.bind(this));
        this.resetGame();
        this.generateObstacles();
        this.generateFood();
        this.main();
    }

    resetGame() {
        if (this.intervalId) {
            clearTimeout(this.intervalId);
        }
        this.snake = [{ x: 150, y: 150 }];
        this.dx = 10;
        this.dy = 0;
        this.gameOver = false;
        this.changingDirection = false;
        this.obstacles = [];
        this.clearCanvas();
        this.drawSnake();
        this.drawObstacles();
        this.generateFood();
        this.gameStarted = false;
        const gameOverMessage = this.template.querySelector('.game-over-message');
        if (gameOverMessage) {
            gameOverMessage.style.display = 'none';
        }
    }

    main() {
        if (this.gameOver) {
            this.displayGameOver();
            this.gameStarted = false;
            return;
        }
        this.changingDirection = false;
        this.intervalId = setTimeout(() => {
            this.clearCanvas();
            this.drawFood();
            this.advanceSnake();
            this.drawSnake();
            this.drawObstacles();
            this.main();
        }, this.gameSpeed);
    }

    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawSnake() {
        this.snake.forEach(part => this.drawSnakePart(part));
    }

    drawSnakePart(snakePart) {
        this.ctx.fillStyle = 'lightgreen';
        this.ctx.strokeStyle = 'darkgreen';
        this.ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
        this.ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
    }

    advanceSnake() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        this.snake.unshift(head);

        // Wrap snake position on edge
        if (this.snake[0].x >= this.canvas.width) {
            this.snake[0].x = 0;
        } else if (this.snake[0].x < 0) {
            this.snake[0].x = this.canvas.width - 10;
        } else if (this.snake[0].y >= this.canvas.height) {
            this.snake[0].y = 0;
        } else if (this.snake[0].y < 0) {
            this.snake[0].y = this.canvas.height - 10;
        }

        if (this.snake[0].x === this.foodX && this.snake[0].y === this.foodY) {
            this.generateFood();
            this.eatSound.play();
        } else {
            this.snake.pop();
        }

        this.checkCollision();
    }

    changeDirection(event) {
        if (this.changingDirection) return;
        this.changingDirection = true;

        const keyPressed = event.keyCode;
        const goingUp = this.dy === -10;
        const goingDown = this.dy === 10;
        const goingRight = this.dx === 10;
        const goingLeft = this.dx === -10;

        if (keyPressed === 37 && !goingRight) {
            this.dx = -10;
            this.dy = 0;
        }

        if (keyPressed === 38 && !goingDown) {
            this.dx = 0;
            this.dy = -10;
        }

        if (keyPressed === 39 && !goingLeft) {
            this.dx = 10;
            this.dy = 0;
        }

        if (keyPressed === 40 && !goingUp) {
            this.dx = 0;
            this.dy = 10;
        }
    }

    generateFood() {
        this.foodX = Math.round((Math.random() * (this.canvas.width - 10)) / 10) * 10;
        this.foodY = Math.round((Math.random() * (this.canvas.height - 10)) / 10) * 10;

        this.snake.forEach(part => {
            const foodIsOnSnake = part.x === this.foodX && part.y === this.foodY;
            if (foodIsOnSnake) this.generateFood();
        });

        this.obstacles.forEach(part => {
            const foodIsOnObstacle = part.x === this.foodX && part.y === this.foodY;
            if (foodIsOnObstacle) this.generateFood();
        });
    }

    drawFood() {
        this.ctx.fillStyle = 'red';
        this.ctx.strokeStyle = 'darkred';
        this.ctx.fillRect(this.foodX, this.foodY, 10, 10);
        this.ctx.strokeRect(this.foodX, this.foodY, 10, 10);
    }

    generateObstacles() {
        for (let i = 0; i < 10; i++) {
            let obstacleX = Math.round((Math.random() * (this.canvas.width - 10)) / 10) * 10;
            let obstacleY = Math.round((Math.random() * (this.canvas.height - 10)) / 10) * 10;

            // Ensure obstacle is not on the snake or food
            this.snake.forEach(part => {
                if (part.x === obstacleX && part.y === obstacleY) {
                    obstacleX = Math.round((Math.random() * (this.canvas.width - 10)) / 10) * 10;
                    obstacleY = Math.round((Math.random() * (this.canvas.height - 10)) / 10) * 10;
                }
            });

            this.obstacles.push({ x: obstacleX, y: obstacleY });
        }
    }

    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = 'grey';
            this.ctx.strokeStyle = 'black';
            this.ctx.fillRect(obstacle.x, obstacle.y, 10, 10);
            this.ctx.strokeRect(obstacle.x, obstacle.y, 10, 10);
        });
    }

    checkCollision() {
        for (let i = 4; i < this.snake.length; i++) {
            if (this.snake[i].x === this.snake[0].x && this.snake[i].y === this.snake[0].y) {
                this.gameOver = true;
            }
        }

        this.obstacles.forEach(obstacle => {
            if (this.snake[0].x === obstacle.x && this.snake[0].y === obstacle.y) {
                this.gameOver = true;
            }
        });
    }

    displayGameOver() {
        const gameOverMessage = this.template.querySelector('.game-over-message');
        if (gameOverMessage) {
            gameOverMessage.style.display = 'flex';
        }
    }
}
