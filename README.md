# 开心消消乐（网页版）

## 一、项目概述

本项目是一个基于 HTML、CSS 和 JavaScript 实现的 “开心消消乐” 前端小游戏。玩家通过交换相邻的糖果，使三个或更多相同的糖果连成一条线来得分，在规定的步数内尽可能获得更高的分数。

## 二、设计思路

### 1.整体架构

- **HTML（index.html）**：负责构建游戏的页面结构，包括游戏标题、分数板、游戏棋盘、控制按钮以及游戏结束和帮助模态框。
- **CSS（style.css）**：对 HTML 元素进行样式设计，实现游戏界面的美化和布局，同时添加了动画效果和响应式布局，以适应不同设备的屏幕尺寸。
- **JavaScript（script.js）**：实现游戏的核心逻辑，包括游戏初始化、棋盘创建、糖果交换、匹配检查、更新棋盘、计分和游戏结束判断等功能。

### 2.代码逻辑

#### 游戏初始化

- 重置游戏状态，清空棋盘数据、分数和步数。
- 创建初始棋盘，并确保初始棋盘没有匹配项。
- 渲染棋盘到页面上。

#### 棋盘创建

- 使用二维数组表示棋盘，每个元素代表一个糖果。
- 随机生成糖果类型填充棋盘。

#### 棋盘渲染

- 根据游戏状态的棋盘数据，动态创建 HTML 元素表示每个糖果。
- 为每个糖果添加点击事件监听器，并设置随机背景色。

#### 糖果交换

- 检查两个糖果是否相邻，如果相邻则交换它们在棋盘数据中的位置。
- 渲染交换后的棋盘，并检查是否有匹配项。
- 如果没有匹配项，将糖果交换回来。

#### 匹配检查

- 查找所有行和列上的匹配项，并标记它们。
- 为匹配的糖果添加动画效果，并计分。
- 移除匹配的糖果，下落糖果填补空缺，并继续检查新的匹配项。

#### 下落糖果

- 从底部向上处理每一列，将糖果下移填补空缺。
- 在顶部添加新的随机糖果。

#### 游戏结束判断

- 当剩余步数为 0 时，显示游戏结束模态框，并显示最终得分。

## 三、核心代码

1. **基础游戏设置**：创建一个对象用于保存棋盘的行数、列数、糖果的类型以及最大移动步数

	```javascript
	const config = {
	        rows: 8,
	        cols: 8,
	        types: ['🍎', '🍇', '🍊', '🍓', '🍉', '🍋'],
	        maxMoves: 30
	    };
	```

2. **记录游戏状态**：创建一个对象用于保存棋盘数据、游戏得分、当前步数、当前选中的糖果、是否正在进行交换位置、是否正在进行检查

	```javascript
	let gameState = {
	        board: [],//保存棋盘上的糖果的数组
	        score: 0,
	        moves: config.maxMoves,
	        selected: null,//标识糖果是否被选中
	        isSwapping: false,
	        isChecking: false
	    };
	```

3. **随机获取糖果**：使用随机函数获取随即索引，以此实现随机获取types数组上的糖果元素，返回随机获取的糖果

	```javascript
	function getRandomCandy() {
	        const randomIndex = Math.floor(Math.random() * config.types.length);
	        return config.types[randomIndex];
	    }
	```

4. **创建棋盘**：创建一个数组用于保存棋盘数据，元素为棋盘上每一行的糖果排列情况，为棋盘的每一行逐个添加随机糖果，再逐行添加到棋盘数组中

	```javascript
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
	```

5. **更新得分和步数**：

	```javascript
	function updateUI() {
	        scoreElement.textContent = gameState.score;
	        movesElement.textContent = gameState.moves;
	    }
	```

6. **初始化棋盘**：

	```javascript
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
	```

7. **根据糖果类型获取颜色**：根据糖果类型获取对应类型索引，根据不同索引返回不同的色相

	```javascript
	function getColorHue(candyType) {
	        const typeIndex = config.types.indexOf(candyType);
	        return (typeIndex * 60) % 360;
	    }
	```

8. **渲染棋盘**：先清空棋盘元素内容，然后逐个创建div元素并添加类名为‘candy’的CSS样式，为每个糖果div记录行数和列数（方便获取点击位置），将糖果div的文本内容设置为对应位置的糖果。根据糖果的类型为不同div设置背景色，维护颜色的一致性。为每个candy元素添加点击事件，将candy元素添加到棋盘中。

	```javascript
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
	                candy.style.backgroundColor = `hsl(${hue}, 80%, 75%)`;//维护颜色的一致性
	
	                candy.addEventListener('click', handleCandyClick);
	                board.appendChild(candy);
	            }
	        }
	    }
	```

9. **处理糖果点击**：若程序此时正在交换糖果或者检查是否有糖果匹配，则点击无响应；获取点击糖果的行数和列数，判断是否为第一个选择的糖果：若是，记录下该糖果的位置并添加被选择样式，否则，获取第二个糖果的行和列，移除第一个糖果的样式，然后检查两个糖果是否相邻，若是则交换位置，否则第二个糖果作为新的选择的第一个糖果。

	```javascript
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
	```

10. **检查两个糖果是否相邻**：同行（列数相差1）、同列（行数相差1）

	```javascript
	function isAdjacent(row1, col1, row2, col2) {
	        return (
	            (Math.abs(row1 - row2) === 1 && col1 === col2) ||
	            (Math.abs(col1 - col2) === 1 && row1 === row2)
	        );
	    }
	```

11. **交换糖果**：交换两个糖果的位置并重新渲染棋盘，渲染完成后检查是否有糖果匹配，若有，步数减1，更新得分，然后检查游戏是否结束，即步数是否为0；若无糖果匹配，则视为无效操作，步数不变，并将两个糖果的位置复原，重新渲染棋盘，更新游戏状态。（***<u>可改进：无糖果匹配也可视为有效操作，步数减1，增加游戏难度</u>***）

	```javascript
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
	```

12. **查找所有匹配的糖果**：先创建一个数组用于记录匹配的糖果，然后先检查同一行匹配的糖果，循环遍历每一行，将匹配的糖果加入数组matches中；同理，对棋盘进行逐列检查。最后，对数组中重复的糖果进行去重，返回包含所有匹配的糖果的数组。（***<u>不足：时间复杂度太高，此处应该可以进行算法改进</u>***）

	```javascript
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
	```

13. **检查是否有匹配，但不处理**：逐行逐列检查是否有匹配的糖果（满足三个相连即匹配）

	```javascript
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
	```

14. **检查是否有匹配并处理**：调用上面的findMatches()函数获取所有匹配的糖果，找出每个匹配的糖果对应的div元素，添加相应的匹配动画，并更新计分板的分数。随后移除匹配的糖果，并调用函数下落糖果填补空缺，填补完成之后，重新检查是否有匹配的糖果，若有，则递归处理匹配糖果，并给予额外加分奖励，并更新计分板，否则重置游戏状态。

	```javascript
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
	```

15. **糖果下落填补空缺**：从底部往上逐列处理，逐列遍历，检查每个单元格是否为空，若是，则更新空缺数量，否则，将该单元格的内容赋值给此时最下方的空缺单元格，实现糖果下落。然后，在顶部自上而下，给空缺单元格添加随机糖果。糖果填充完毕，重新渲染棋盘。（***<u>不足：并未实现糖果下落的动画，实际上只是改变了单元格中的内容，而非移动了单元格的位置。猜想可能需要使用弹性布局而非网格布局</u>***）

	```javascript
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
	```

## 四、运行效果

1. 游戏主界面：

	![](images/main.png "游戏主界面")

2. 游戏规则：

	![](images/rules.png "游戏规则")

3. 游戏结束：

	![](images/gameover.png "游戏结束")

## 注意

有极小概率出现无糖果可移动的情况，可以尝试添加检查代码解决（若无可交换糖果，则刷新棋盘），或者直接如前面所说，将所有操作都视为有效操作。