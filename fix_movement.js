const fs = require('fs');
let html = fs.readFileSync('game.html', 'utf-8');

// 1. 修复 movePlayerTo - 保存原始格子类型
const oldMovePlayerTo = `function movePlayerTo(x, y) {
            const cell = gameState.map[y][x];
            const oldPos = gameState.playerPos;
            
            gameState.map[oldPos.y][oldPos.x].type = 'floor';
            gameState.map[oldPos.y][oldPos.x].revealed = true;
            gameState.playerPos = { x, y };
            cell.type = 'player';
            cell.revealed = true;
            
            revealArea(x, y, 2);
            renderMap();
            handleCellType(cell.type, x, y);
            saveGame();
        }`;

const newMovePlayerTo = `function movePlayerTo(x, y) {
            const cell = gameState.map[y][x];
            const oldPos = gameState.playerPos;
            
            // 保存原始格子类型（在修改前！）
            const originalCellType = cell.type;
            
            gameState.map[oldPos.y][oldPos.x].type = 'floor';
            gameState.map[oldPos.y][oldPos.x].revealed = true;
            gameState.playerPos = { x, y };
            cell.type = 'player';
            cell.revealed = true;
            
            revealArea(x, y, 2);
            renderMap();
            // 使用保存的原始类型触发事件
            handleCellType(originalCellType, x, y);
            saveGame();
        }`;

html = html.replace(oldMovePlayerTo, newMovePlayerTo);

// 2. 替换 handleCellClick - 添加A*自动寻路
const oldHandleCellClick = `function handleCellClick(x, y) {
            const cell = gameState.map[y][x];
            if (cell.type === 'wall' || cell.type === 'player') return;
            
            const dx = Math.abs(x - gameState.playerPos.x);
            const dy = Math.abs(y - gameState.playerPos.y);
            
            if (dx + dy === 1) {
                movePlayerTo(x, y);
            }
        }`;

const newHandleCellClick = `function handleCellClick(x, y) {
            const cell = gameState.map[y][x];
            if (cell.type === 'wall' || cell.type === 'player') return;
            
            const dx = Math.abs(x - gameState.playerPos.x);
            const dy = Math.abs(y - gameState.playerPos.y);
            
            // 相邻格直接移动
            if (dx + dy === 1) {
                movePlayerTo(x, y);
                return;
            }
            
            // 远处格子：A*自动寻路
            const path = findPath(gameState.playerPos.x, gameState.playerPos.y, x, y);
            if (path && path.length > 1) {
                moveAlongPath(path);
            }
        }
        
        // A*寻路算法
        function findPath(startX, startY, endX, endY) {
            const size = gameState.mapSize;
            const map = gameState.map;
            
            // 阻挡类型（不能穿过）
            const blocked = ['wall', 'enemy', 'boss', 'coffin'];
            
            // 节点类
            class Node {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.g = 0;
                    this.h = 0;
                    this.f = 0;
                    this.parent = null;
                }
            }
            
            // 启发式函数（曼哈顿距离）
            function heuristic(a, b) {
                return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
            }
            
            const start = new Node(startX, startY);
            const end = new Node(endX, endY);
            
            const openList = [start];
            const closedList = new Set();
            
            while (openList.length > 0) {
                // 找f值最小的节点
                let currentIndex = 0;
                for (let i = 1; i < openList.length; i++) {
                    if (openList[i].f < openList[currentIndex].f) {
                        currentIndex = i;
                    }
                }
                
                const current = openList[currentIndex];
                
                // 到达终点
                if (current.x === end.x && current.y === end.y) {
                    const path = [];
                    let node = current;
                    while (node) {
                        path.unshift({ x: node.x, y: node.y });
                        node = node.parent;
                    }
                    return path;
                }
                
                // 移到关闭列表
                openList.splice(currentIndex, 1);
                closedList.add(\`\${current.x},\${current.y}\`);
                
                // 检查相邻格子
                const neighbors = [
                    { x: current.x, y: current.y - 1 },
                    { x: current.x, y: current.y + 1 },
                    { x: current.x - 1, y: current.y },
                    { x: current.x + 1, y: current.y }
                ];
                
                for (const n of neighbors) {
                    // 边界检查
                    if (n.x < 0 || n.x >= size || n.y < 0 || n.y >= size) continue;
                    
                    // 阻挡检查
                    if (blocked.includes(map[n.y][n.x].type)) continue;
                    
                    // 已在关闭列表
                    if (closedList.has(\`\${n.x},\${n.y}\`)) continue;
                    
                    const neighbor = new Node(n.x, n.y);
                    neighbor.g = current.g + 1;
                    neighbor.h = heuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = current;
                    
                    // 检查是否已在开放列表
                    const existingIndex = openList.findIndex(n => n.x === neighbor.x && n.y === neighbor.y);
                    if (existingIndex === -1) {
                        openList.push(neighbor);
                    } else if (neighbor.g < openList[existingIndex].g) {
                        openList[existingIndex] = neighbor;
                    }
                }
            }
            
            return null; // 无路径
        }
        
        // 沿路径移动
        let pathMoveTimer = null;
        function moveAlongPath(path) {
            if (pathMoveTimer) {
                clearInterval(pathMoveTimer);
            }
            
            let index = 1; // 从第一个格子开始（跳过起点）
            pathMoveTimer = setInterval(() => {
                if (index >= path.length) {
                    clearInterval(pathMoveTimer);
                    pathMoveTimer = null;
                    return;
                }
                
                const pos = path[index];
                const cell = gameState.map[pos.y][pos.x];
                
                // 遇到敌人/Boss停止
                if (['enemy', 'boss', 'coffin'].includes(cell.type)) {
                    clearInterval(pathMoveTimer);
                    pathMoveTimer = null;
                    movePlayerTo(pos.x, pos.y);
                    return;
                }
                
                movePlayerTo(pos.x, pos.y);
                index++;
            }, 300);
        }`;

html = html.replace(oldHandleCellClick, newHandleCellClick);

// 3. 添加buff-fatigue的处理
const oldHandleCellType = `function handleCellType(type, x, y) {
            const level = LEVELS[currentLevel];
            
            switch (type) {
                case 'enemy':`;

const newHandleCellType = `function handleCellType(type, x, y) {
            const level = LEVELS[currentLevel];
            
            console.log('handleCellType:', type, 'at', x, y);
            
            switch (type) {
                case 'player':
                    // 玩家格子，不触发事件
                    break;
                case 'enemy':`;

html = html.replace(oldHandleCellType, newHandleCellType);

// 4. 在handleCellType的switch中添加buff处理
const oldStairsCase = `case 'stairs':
                    gameState.objectives.stairs = true;
                    addLog('发现出口！', 'success');
                    showSettlement();
                    break;`;

const newStairsCase = `case 'stairs':
                    gameState.objectives.stairs = true;
                    addLog('发现出口！', 'success');
                    showSettlement();
                    break;
                case 'buff-fatigue':
                    gameState.fatigue = Math.min(gameState.maxFatigue, gameState.fatigue + 30);
                    addLog('休息了一下，疲劳恢复+30', 'success');
                    updateStats();
                    break;
                case 'buff-attack':
                    if (!gameState.activeBuffs) gameState.activeBuffs = [];
                    gameState.activeBuffs.push({ id: 'attack', value: 1.2 });
                    addLog('攻击力提升20%！', 'success');
                    break;`;

html = html.replace(oldStairsCase, newStairsCase);

fs.writeFileSync('game.html', html);
console.log('修复完成！');
