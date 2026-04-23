// 这个脚本用于修复game.html中的关卡系统

const fs = require('fs');
let html = fs.readFileSync('game.html', 'utf-8');

// 1. 给关卡3添加hasCombat属性
html = html.replace(
    /3:\s*{\s*name:\s*'星陨古墓',\s*type:\s*'structured',\s*mapSize:\s*16,/,
    `3: {
                name: '星陨古墓',
                type: 'structured',
                mapSize: 16,
                hasCombat: true,`
);

// 2. 替换generateMap函数，添加结构化关卡支持
const oldGenerateMap = `function generateMap(levelId) {
            const size = gameState.mapSize;
            gameState.map = [];
            
            for (let y = 0; y < size; y++) {
                gameState.map[y] = [];
                for (let x = 0; x < size; x++) {
                    const cell = { x, y, type: 'floor', revealed: false };
                    if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
                        cell.type = 'wall';
                    } else if (x === 1 && y === 1) {
                        cell.type = 'player';
                        cell.revealed = true;
                    } else {
                        const rand = Math.random();
                        if (levelId === 3) {
                            if (rand < 0.06) { cell.type = 'enemy'; gameState.totalEnemies++; }
                            else if (rand < 0.08) { cell.type = 'boss'; gameState.totalEnemies++; }
                            else if (rand < 0.11) { cell.type = 'mechanism-luck'; gameState.mechanismTotal++; }
                            else if (rand < 0.13) { cell.type = 'mechanism-knowledge'; gameState.mechanismTotal++; }
                            else if (rand < 0.15) { cell.type = 'mechanism-hero'; gameState.mechanismTotal++; }
                            else if (rand < 0.17) cell.type = 'coffin';
                        } else {
                            if (rand < 0.05) cell.type = 'enemy';
                            else if (rand < 0.09) cell.type = 'chest';
                            else if (rand < 0.13) { cell.type = 'mechanism-luck'; gameState.mechanismTotal++; }
                            else if (rand < 0.17) { cell.type = 'mechanism-knowledge'; gameState.mechanismTotal++; }
                            else if (rand < 0.21) { cell.type = 'mechanism-hero'; gameState.mechanismTotal++; }
                        }
                    }
                    gameState.map[y][x] = cell;
                }
            }
            
            // 放置出口
            for (let attempts = 0; attempts < 100; attempts++) {
                const ex = Math.floor(Math.random() * (size - 4)) + 2;
                const ey = Math.floor(Math.random() * (size - 4)) + 2;
                if (gameState.map[ey][ex].type === 'floor' && 
                    (Math.abs(ex - 1) + Math.abs(ey - 1)) > size / 2) {
                    gameState.map[ey][ex].type = 'stairs';
                    break;
                }
            }
        }`;

const newGenerateMap = `function generateMap(levelId) {
            const level = LEVELS[levelId];
            if (level && level.type === 'structured') {
                generateStructuredMap(levelId);
            } else {
                generateRandomMap(levelId);
            }
        }
        
        function generateRandomMap(levelId) {
            const size = gameState.mapSize;
            gameState.map = [];
            
            for (let y = 0; y < size; y++) {
                gameState.map[y] = [];
                for (let x = 0; x < size; x++) {
                    const cell = { x, y, type: 'floor', revealed: false };
                    if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
                        cell.type = 'wall';
                    } else if (x === 1 && y === 1) {
                        cell.type = 'player';
                        cell.revealed = true;
                    } else {
                        const rand = Math.random();
                        if (rand < 0.05) cell.type = 'enemy';
                        else if (rand < 0.09) cell.type = 'chest';
                        else if (rand < 0.13) { cell.type = 'mechanism-luck'; gameState.mechanismTotal++; }
                        else if (rand < 0.17) { cell.type = 'mechanism-knowledge'; gameState.mechanismTotal++; }
                        else if (rand < 0.21) { cell.type = 'mechanism-hero'; gameState.mechanismTotal++; }
                    }
                    gameState.map[y][x] = cell;
                }
            }
            
            // 放置出口
            for (let attempts = 0; attempts < 100; attempts++) {
                const ex = Math.floor(Math.random() * (size - 4)) + 2;
                const ey = Math.floor(Math.random() * (size - 4)) + 2;
                if (gameState.map[ey][ex].type === 'floor' && 
                    (Math.abs(ex - 1) + Math.abs(ey - 1)) > size / 2) {
                    gameState.map[ey][ex].type = 'stairs';
                    break;
                }
            }
        }
        
        function generateStructuredMap(levelId) {
            const size = gameState.mapSize;
            gameState.map = [];
            
            // 初始化空地图
            for (let y = 0; y < size; y++) {
                gameState.map[y] = [];
                for (let x = 0; x < size; x++) {
                    gameState.map[y][x] = { x, y, type: 'wall', revealed: false };
                }
            }
            
            // 第3关：星陨古墓 - 固定线性Boss关卡
            if (levelId === 3) {
                // 入口区 (1,1)-(2,2)
                for (let y = 1; y <= 2; y++) {
                    for (let x = 1; x <= 2; x++) {
                        gameState.map[y][x].type = 'floor';
                    }
                }
                gameState.map[1][1].type = 'player';
                gameState.map[1][1].revealed = true;
                
                // 走廊A (3,1)-(7,3) - 敌人x2
                for (let y = 1; y <= 3; y++) {
                    for (let x = 3; x <= 7; x++) {
                        gameState.map[y][x].type = 'floor';
                    }
                }
                gameState.map[2][4].type = 'enemy';
                gameState.map[2][6].type = 'enemy';
                gameState.totalEnemies = 2;
                
                // 前厅 (8,1)-(12,4) - 运气机关
                for (let y = 1; y <= 4; y++) {
                    for (let x = 8; x <= 12; x++) {
                        gameState.map[y][x].type = 'floor';
                    }
                }
                gameState.map[2][10].type = 'mechanism-luck';
                gameState.mechanismTotal = 1;
                
                // 通道B (8,5)-(12,9) - 敌人x2
                for (let y = 5; y <= 9; y++) {
                    for (let x = 8; x <= 12; x++) {
                        gameState.map[y][x].type = 'floor';
                    }
                }
                gameState.map[6][9].type = 'enemy';
                gameState.map[6][11].type = 'enemy';
                gameState.totalEnemies += 2;
                
                // Boss前厅 (8,10)-(11,12)
                for (let y = 10; y <= 12; y++) {
                    for (let x = 8; x <= 11; x++) {
                        gameState.map[y][x].type = 'floor';
                    }
                }
                
                // Boss房 (6,13)-(11,15) - 星棺守卫
                for (let y = 13; y <= 15; y++) {
                    for (let x = 6; x <= 11; x++) {
                        gameState.map[y][x].type = 'floor';
                    }
                }
                gameState.map[14][8].type = 'boss';
                gameState.totalEnemies += 1;
                
                // 休息点 (12,14)-(13,15)
                for (let y = 14; y <= 15; y++) {
                    for (let x = 12; x <= 13; x++) {
                        gameState.map[y][x].type = 'buff-fatigue';
                    }
                }
                
                // 出口走廊
                for (let y = 14; y <= 15; y++) {
                    gameState.map[y][14].type = 'floor';
                }
                gameState.map[14][15].type = 'stairs';
            }
            // 第2关：沉银地宫 - 半结构化
            else if (levelId === 2) {
                // 入口区
                for (let y = 1; y <= 2; y++) {
                    for (let x = 1; x <= 2; x++) {
                        gameState.map[y][x].type = 'floor';
                    }
                }
                gameState.map[1][1].type = 'player';
                gameState.map[1][1].revealed = true;
                
                // 主通道
                for (let x = 3; x <= 14; x++) {
                    gameState.map[1][x].type = 'floor';
                    gameState.map[2][x].type = 'floor';
                }
                
                // 侧室区域
                for (let y = 3; y <= 8; y++) {
                    for (let x = 3; x <= 14; x++) {
                        gameState.map[y][x].type = 'floor';
                    }
                }
                
                // 放置机关和宝箱
                gameState.map[3][5].type = 'mechanism-knowledge';
                gameState.map[3][10].type = 'mechanism-luck';
                gameState.map[5][7].type = 'chest';
                gameState.map[6][12].type = 'mechanism-hero';
                gameState.mechanismTotal = 3;
                
                // 出口
                gameState.map[1][14].type = 'stairs';
            }
        }`;

html = html.replace(oldGenerateMap, newGenerateMap);

fs.writeFileSync('game.html', html);
console.log('修复完成！');
