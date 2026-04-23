# 配置分离设计说明

## 目录结构

```
config/
├── heroes.json      # 英雄数据（数值、技能）
├── enemies.json     # 怪物数据（数值、掉落）
├── levels.json      # 关卡配置（地图、目标、解锁条件）
├── scenes.json      # 场景配置（背景图、渐变）
├── battle.json      # 战斗参数（怒气、伤害公式）
├── stories.md       # 剧情文本（对话、分支）
└── README.md        # 本文档
```

## 格式选择

| 文件 | 格式 | 选择原因 |
|------|------|----------|
| heroes.json | JSON | 数值数据，程序直接读取 |
| enemies.json | JSON | 数值数据，程序直接读取 |
| levels.json | JSON | 结构化配置，程序直接读取 |
| scenes.json | JSON | 简单键值对，程序直接读取 |
| battle.json | JSON | 数值参数，程序直接读取 |
| stories.md | Markdown | 长文本，Git可读性好，策划友好 |

## JSON 配置规范

### 通用字段

所有配置文件包含以下元信息：

```json
{
  "version": "1.0.0",
  "description": "配置表描述",
  ...
}
```

### 数据字段

- 使用语义化的键名
- 数值字段明确单位（如 `actionInterval: 800` 毫秒）
- 百分比用小数表示（如 `criticalChance: 0.15` 表示 15%）

## 代码加载方式

### 方式一：同步加载（开发阶段）

将 JSON 转为 JS 模块，直接引入：

```html
<script src="config/heroes.config.js"></script>
<script src="config/enemies.config.js"></script>
```

### 方式二：异步加载（正式版本）

```javascript
async function loadConfig(name) {
  const response = await fetch(`config/${name}.json`);
  return response.json();
}

const heroes = await loadConfig('heroes');
```

### 方式三：打包时内联

构建时将 JSON 内联到代码中，减少网络请求。

## Markdown 剧情解析

`stories.md` 需要解析为 JSON 格式供程序使用。

解析工具：`scripts/parse-stories.js`（待开发）

输出格式：
```json
{
  "levelIntro": {
    "1": [
      { "speaker": "旁白", "text": "...", "position": "center" }
    ]
  },
  "bossIntro": { ... },
  "victory": [ ... ],
  "defeat": [ ... ]
}
```

## 配置修改流程

1. 修改 `config/` 目录下的配置文件
2. 提交到 Git（版本控制）
3. 如修改 Markdown 文件，运行解析工具生成 JSON
4. 重新部署游戏

## 后续扩展

- [ ] 配置校验工具（检查必填字段、数值范围）
- [ ] 配置热更新支持
- [ ] 可视化配置编辑器
- [ ] 配置版本兼容性检查
