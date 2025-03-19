document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const scoreElement = document.getElementById('score');
    const movesElement = document.getElementById('moves');
    const finalScoreElement = document.getElementById('final-score');
    const gameOverModal = document.getElementById('game-over');
    const helpModal = document.getElementById('help-modal');

    // 游戏配置
    const config = {
        rows: 8,
        cols: 8,
        types: ['🍎', '🍇', '🍊', '🍓', '🍉', '🍋'],
        maxMoves: 30
    };

    // 游戏状态
    let gameState = {
        board: [],
        score: 0,
        moves: config.maxMoves,
        selected: null,
        isSwapping: false,
        isChecking: false
    };

    // 初始化游戏
    function initGame() {
        gameState = {
            board: [],
            score: 0,
            moves: config.maxMoves,
            selected: null,
            isSwapping: false,
            isChecking: false
        };

        updateUI();
        createBoard();

        // 确保初始棋盘没有匹配项
        while (hasMatches()) {
            createBoard();
        }

        renderBoard();
    }

    // 创建棋盘数据
    function createBoard() {
        gameState.board = [];
        for (let row = 0; row < config.rows; row++) {
            const rowArray = [];
            for (let col = 0; col < config.cols; col++) {
                rowArray.push(getRandomCandy());
            }
            gameState.board.push(rowArray);
        }
    }

    // 获取随机糖果
    function getRandomCandy() {
        const randomIndex = Math.floor(Math.random() * config.types.length);
        return config.types[randomIndex];
    }

    // 渲染棋盘
    function renderBoard() {
        board.innerHTML = '';

        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                const candy = document.createElement('div');
                candy.classList.add('candy');
                candy.dataset.row = row;
                candy.dataset.col = col;
                candy.textContent = gameState.board[row][col];

                // 随机背景色
                const hue = getColorHue(gameState.board[row][col]);
                candy.style.backgroundColor = `hsl(${hue}, 80%, 75%)`;

                candy.addEventListener('click', handleCandyClick);
                board.appendChild(candy);
            }
        }
    }

    // 根据糖果类型获取颜色
    function getColorHue(candyType) {
        const typeIndex = config.types.indexOf(candyType);
        return (typeIndex * 60) % 360;
    }

    // 处理糖果点击
    function handleCandyClick(e) {
        if (gameState.isSwapping || gameState.isChecking) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        if (gameState.selected === null) {
            // 第一次选择
            gameState.selected = { row, col };
            e.target.classList.add('selected');
        } else {
            const selectedRow = gameState.selected.row;
            const selectedCol = gameState.selected.col;

            // 移除之前的选择样式
            document.querySelector('.candy.selected')?.classList.remove('selected');

            // 检查是否相邻
            if (isAdjacent(selectedRow, selectedCol, row, col)) {
                // 交换糖果
                swapCandies(selectedRow, selectedCol, row, col);
            } else {
                // 不相邻，作为新的选择
                gameState.selected = { row, col };
                e.target.classList.add('selected');
            }
        }
    }

    // 检查是否相邻
    function isAdjacent(row1, col1, row2, col2) {
        return (
            (Math.abs(row1 - row2) === 1 && col1 === col2) ||
            (Math.abs(col1 - col2) === 1 && row1 === row2)
        );
    }

    // 交换糖果
    function swapCandies(row1, col1, row2, col2) {
        gameState.isSwapping = true;

        // 交换数据
        const temp = gameState.board[row1][col1];
        gameState.board[row1][col1] = gameState.board[row2][col2];
        gameState.board[row2][col2] = temp;

        // 渲染变化
        renderBoard();

        // 检查是否有匹配
        setTimeout(() => {
            if (checkMatches()) {
                // 减少步数并更新UI
                gameState.moves--;
                updateUI();

                // 检查游戏是否结束
                if (gameState.moves <= 0) {
                    setTimeout(endGame, 1000);
                }
            } else {
                // 没有匹配，交换回来
                const temp = gameState.board[row1][col1];
                gameState.board[row1][col1] = gameState.board[row2][col2];
                gameState.board[row2][col2] = temp;
                renderBoard();
            }

            gameState.selected = null;
            gameState.isSwapping = false;
        }, 300);
    }

    // 检查是否有匹配并处理
    function checkMatches() {
        gameState.isChecking = true;
        let hasMatches = false;

        // 标记所有匹配项
        const matchedCandies = findMatches();

        if (matchedCandies.length > 0) {
            hasMatches = true;

            // 添加匹配动画
            for (const { row, col } of matchedCandies) {
                const index = row * config.cols + col;
                const candyElement = board.children[index];
                candyElement.classList.add('matched');

                // 计分：每个匹配的糖果得10分
                gameState.score += 10;
            }

            // 更新UI
            updateUI();

            // 等待动画完成
            setTimeout(() => {
                // 移除匹配的糖果
                for (const { row, col } of matchedCandies) {
                    gameState.board[row][col] = null;
                }

                // 下落糖果填补空缺
                dropCandies();

                // 继续检查新的匹配项
                setTimeout(() => {
                    if (checkMatches()) {
                        // 有连锁反应，给额外奖励
                        gameState.score += 50;
                        updateUI();
                    } else {
                        gameState.isChecking = false;
                    }
                }, 500);
            }, 500);
        } else {
            gameState.isChecking = false;
        }

        return hasMatches;
    }

    // 查找所有匹配项
    function findMatches() {
        const matches = [];

        // 检查行匹配
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols - 2; col++) {
                const candy = gameState.board[row][col];
                if (candy &&
                    candy === gameState.board[row][col + 1] &&
                    candy === gameState.board[row][col + 2]) {

                    // 添加匹配的三个或更多糖果
                    matches.push({ row, col });
                    matches.push({ row, col: col + 1 });
                    matches.push({ row, col: col + 2 });

                    // 检查是否有更多相同糖果
                    let nextCol = col + 3;
                    while (nextCol < config.cols && gameState.board[row][nextCol] === candy) {
                        matches.push({ row, col: nextCol });
                        nextCol++;
                    }
                }
            }
        }

        // 检查列匹配
        for (let col = 0; col < config.cols; col++) {
            for (let row = 0; row < config.rows - 2; row++) {
                const candy = gameState.board[row][col];
                if (candy &&
                    candy === gameState.board[row + 1][col] &&
                    candy === gameState.board[row + 2][col]) {

                    matches.push({ row, col });
                    matches.push({ row: row + 1, col });
                    matches.push({ row: row + 2, col });

                    let nextRow = row + 3;
                    while (nextRow < config.rows && gameState.board[nextRow][col] === candy) {
                        matches.push({ row: nextRow, col });
                        nextRow++;
                    }
                }
            }
        }

        // 去重
        return matches.filter((match, index, self) =>
            index === self.findIndex((m) => m.row === match.row && m.col === match.col)
        );
    }

    // 下落糖果填补空缺
    function dropCandies() {
        // 从底部向上处理每一列
        for (let col = 0; col < config.cols; col++) {
            // 计算每列中的空缺数量
            let emptySpaces = 0;

            for (let row = config.rows - 1; row >= 0; row--) {
                if (gameState.board[row][col] === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    // 有空缺，下移糖果
                    gameState.board[row + emptySpaces][col] = gameState.board[row][col];
                }
            }

            // 在顶部添加新的糖果
            for (let i = 0; i < emptySpaces; i++) {
                gameState.board[i][col] = getRandomCandy();
            }
        }

        // 重新渲染棋盘
        renderBoard();
    }

    // 检查是否有匹配项(不处理，仅检查)
    function hasMatches() {
        // 检查行匹配
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols - 2; col++) {
                const candy = gameState.board[row][col];
                if (candy &&
                    candy === gameState.board[row][col + 1] &&
                    candy === gameState.board[row][col + 2]) {
                    return true;
                }
            }
        }

        // 检查列匹配
        for (let col = 0; col < config.cols; col++) {
            for (let row = 0; row < config.rows - 2; row++) {
                const candy = gameState.board[row][col];
                if (candy &&
                    candy === gameState.board[row + 1][col] &&
                    candy === gameState.board[row + 2][col]) {
                    return true;
                }
            }
        }

        return false;
    }

    // 更新界面显示
    function updateUI() {
        scoreElement.textContent = gameState.score;
        movesElement.textContent = gameState.moves;
    }

    // 游戏结束
    function endGame() {
        finalScoreElement.textContent = gameState.score;
        gameOverModal.style.display = 'flex';
    }

    // 事件监听
    document.getElementById('new-game').addEventListener('click', () => {
        initGame();
    });

    document.getElementById('restart').addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        initGame();
    });

    document.getElementById('help').addEventListener('click', () => {
        helpModal.style.display = 'flex';
    });

    document.getElementById('close-help').addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    // 初始化游戏
    initGame();
});