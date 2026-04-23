# 《苍穹劫》剧情演出系统

## 功能概述

为《苍穹劫》地宫探索游戏添加了完整的视觉小说式剧情演出系统，包含：
- AI生成的场景背景图
- 对话框+打字机效果
- 淡入淡出过渡
- 震动/闪烁特效
- 选择分支系统
- 胜利/失败结算剧情

---

## 场景图片

位置：`./苍穹劫IP企划/场景/`

| 文件名 | 用途 | 描述 |
|--------|------|------|
| `boss_room.jpg` | Boss房 | 星棺悬浮，宇宙星云背景 |
| `ancient_corridor.jpg` | 古老走廊 | 青苔石壁，神秘氛围 |
| `tomb_entrance.jpg` | 墓道入口 | 陨石碎片，星云漩涡 |
| `starlight_hall.jpg` | 星光大厅 | 银色装饰，星象图案 |
| `victory_scene.jpg` | 胜利场景 | 宝藏光芒，胜利氛围 |

**规格**：2848×1600px (16:9)

---

## 剧情演出系统 JS

位置：`./苍穹劫IP企划/游戏原型/剧情演出系统.js`

### 核心类

#### StoryScene - 单个场景演出
```javascript
const scene = new StoryScene({
    background: 'boss_room',      // 场景图片键名
    music: 'tense',               // 音乐（可选）
    dialogues: [                 // 对话列表
        { speaker: '铁柱', text: '小心...', position: 'left' },
        { speaker: '星祭司', text: '有东西来了！', position: 'right' },
        { speaker: 'Boss', text: '愚蠢的凡人...', position: 'center', isBoss: true }
    ],
    effects: ['shake', 'flash'], // 特效列表
    choices: [                   // 选择分支（可选）
        { text: '准备战斗！', action: 'startBattle' },
        { text: '试图谈判', action: 'dialogue', nextScene: 2 }
    ],
    onNext: () => {}             // 完成后回调
});
scene.render();
scene.play();
```

#### StoryPlayer - 剧情流程管理
```javascript
const story = new StoryPlayer({
    scenes: [scene1, scene2, scene3],
    onComplete: () => {
        // 剧情结束后执行
        startBattle();
    }
});
story.play();        // 开始播放
story.jumpTo(2);     // 跳转到指定场景
story.stop();        // 停止播放
```

### 快捷函数

| 函数 | 用途 |
|------|------|
| `playStory(scenes, onComplete)` | 播放自定义剧情 |
| `playLevelIntro(levelId, onComplete)` | 播放关卡开场剧情 |
| `playBossIntro(levelId, onComplete)` | 播放Boss出场剧情 |
| `playVictoryStory(onComplete)` | 播放胜利结算剧情 |
| `playDefeatStory(onComplete)` | 播放失败结算剧情 |

---

## 集成游戏 Demo

位置：`./苍穹劫IP企划/游戏原型/地宫探索demo_v10_剧情版.html`

### 集成点

1. **进入关卡时** → 播放 `playLevelIntro(levelId)`
2. **Boss战前** → 播放 `playBossIntro(levelId)`
3. **战斗胜利后** → 播放 `playVictoryStory()`
4. **战斗失败后** → 播放 `playDefeatStory()`

### 预设剧情

| 关卡 | 开场剧情 | Boss出场 |
|------|----------|----------|
| 第1关：古老墓穴 | 墓道入口介绍 | 石棺守卫觉醒 |
| 第2关：沉银地宫 | 银色走廊探索 | 守财奴出现 |
| 第3关：星陨古墓 | 星陨入口警告 | 星主降临 |

---

## 使用方法

### 在新项目中引用

```html
<!-- 1. 引用剧情系统 -->
<script src="./剧情演出系统.js"></script>

<!-- 2. 在游戏入口调用 -->
<script>
    // 进入关卡前播放剧情
    playLevelIntro(1, function() {
        // 剧情结束后初始化游戏
        initGame(1);
    });
</script>
```

### 自定义剧情

```javascript
// 定义新剧情
const myStory = [{
    background: 'tomb_entrance',
    dialogues: [
        { speaker: '旁白', text: '新的冒险开始了...', position: 'center' },
        { speaker: '主角', text: '我来探索这座古墓！', position: 'left' }
    ],
    effects: ['flash'],
    choices: [
        { text: '继续前进', action: 'dialogue', nextScene: 1 },
        { text: '返回', action: 'startBattle' }
    ]
}];

// 播放
playStory(myStory, function() {
    console.log('剧情结束');
});
```

---

## 特效说明

| 特效 | 效果 |
|------|------|
| `shake` | 屏幕震动 |
| `flash` | 白光闪烁 |

---

## 场景图片配置

场景图片路径在 `SCENE_IMAGES` 对象中配置：

```javascript
const SCENE_IMAGES = {
    boss_room: './场景/boss_room.jpg',
    ancient_corridor: './场景/ancient_corridor.jpg',
    tomb_entrance: './场景/tomb_entrance.jpg',
    starlight_hall: './场景/starlight_hall.jpg',
    victory_scene: './场景/victory_scene.jpg'
};
```

**注意**：实际部署时需要根据服务器路径调整图片URL。
