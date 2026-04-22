# 《苍穹劫》地宫探索游戏

## 项目简介
这是一款挂机放置角色养成手机游戏，关卡内为策略探索玩法。

## 在线体验
- [主游戏Demo](https://zhang244667.github.io/cangqiongjie-demo/)
- [战斗系统Demo](https://zhang244667.github.io/cangqiongjie-demo/prototypes/战斗系统Demo.html)

## 项目结构

```
cangqiongjie-demo/
├── index.html              # 主游戏入口（在线版本）
├── README.md               # 项目说明
├── docs/                   # 设计文档
│   ├── IP核心设定.md
│   ├── 项目说明.md
│   └── 游戏设计/
│       ├── 游戏设计总览.md
│       ├── 战斗系统设计.md
│       ├── 机关解谜系统设计.md
│       └── 英雄特性分阶段设计.md
└── prototypes/             # 原型文件
    ├── 地宫探索demo_v9.html
    └── 战斗系统Demo.html
```

## 本地开发指南

### 1. 克隆仓库
```bash
git clone https://github.com/zhang244667/cangqiongjie-demo.git
cd cangqiongjie-demo
```

### 2. 本地运行
直接用浏览器打开 `index.html` 或 `prototypes/战斗系统Demo.html` 即可运行。

### 3. 使用 Trae 继续开发
1. 安装 [Trae](https://trae.ai/) 编辑器
2. 打开克隆下来的项目文件夹
3. 在 Trae 中打开 HTML 文件，直接编辑即可

## 游戏特性
- 🎮 策略探索：手动翻格子，机关解谜
- ⚔️ 战斗系统：英雄独立血条、行动条、怒气技能
- 📖 剧情叙事：环境碎片、故事发现
- 🎨 暗黑国风：写实国漫风格

## 技术栈
- 纯 HTML/CSS/JavaScript
- 无框架依赖，可直接在浏览器运行
- 适合微信小游戏移植

## 开发状态
- [x] 地宫探索核心玩法
- [x] 机关解谜系统
- [x] 战斗系统原型
- [ ] 完整关卡设计
- [ ] 角色养成系统
- [ ] 微信小游戏适配

---
© 2026 《苍穹劫》IP
