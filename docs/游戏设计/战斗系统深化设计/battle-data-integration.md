# 战斗系统数据整合层设计方案

> 版本：1.0
> 日期：2026年4月24日
> 游戏：《苍穹劫·摸金传人》
> 状态：深化设计文档

---

## 一、文档概述

### 1.1 目的与范围

本文档定义战斗系统数据整合层的完整设计方案，包括配置数据结构设计、数据加载器设计、战斗初始化流程和数据验证机制。本层是战斗系统的数据基础，为技能效果系统、战斗状态系统、战斗AI系统和关卡流程系统提供统一的数据访问接口。

### 1.2 设计原则

- **类型安全**：所有数据结构使用强类型定义
- **配置驱动**：战斗逻辑与配置数据分离
- **懒加载**：按需加载，非一次性全量加载
- **缓存机制**：热点数据内存缓存
- **版本兼容**：配置热更新支持

---

## 二、数据结构设计

### 2.1 配置数据结构总览

```
ConfigManager
├── HeroConfigManager      # 英雄配置管理
├── EnemyConfigManager     # 敌人配置管理
├── LevelConfigManager     # 关卡配置管理
├── SkillConfigManager     # 技能配置管理
├── BuffConfigManager      # Buff配置管理
└── DropConfigManager      # 掉落配置管理
```

### 2.2 英雄配置数据结构

```typescript
// 英雄基础属性
interface HeroBaseConfig {
  heroId: string;              // 唯一标识：HERO_XW_001
  name: string;                 // 名称：摸金手
  quality: Quality;              // 品质：N/R/SR/SSR/UR
  tradition: Tradition;         // 传承：星纹摸金/璇玑搬山/辰宿卸岭/天枢发丘
  position: HeroPosition;        // 定位：刺客/法师/坦克/辅助等
  maxHp: number;                // 最大生命值
  attack: number;               // 攻击力
  defense: number;              // 防御力
  speed: number;                // 速度
  critRate: number;             // 暴击率 (0-1)
  critDamage: number;           // 暴击伤害倍率 (1.0-2.5)
  resist: number;               // 抗性
  levelGrowth: LevelGrowth;     // 等级成长参数
}

// 技能配置
interface HeroSkillConfig {
  heroId: string;
  normalAttack: NormalAttackConfig;    // 普攻配置
  ultimateSkill: UltimateSkillConfig;  // 怒攻(大招)配置
  passiveSkills: PassiveSkillConfig[]; // 被动技能配置
}

// 普攻配置
interface NormalAttackConfig {
  skillId: string;              // 技能ID
  name: string;                 // 技能名称
  description: string;         // 技能描述
  damageCoeff: number;          // 伤害系数 (1.0 = 100%)
  damageType: DamageType;      // 伤害类型：物理/法术/真实
  targetType: TargetType;      // 目标类型：单体/群体/自身
  angerGain: number;            // 怒气获取
  effects: SkillEffect[];      // 附加效果
}

// 怒攻配置
interface UltimateSkillConfig {
  skillId: string;              // 技能ID
  name: string;                 // 技能名称
  description: string;         // 技能描述
  angerCost: number;            // 怒气消耗
  damageCoeff: number;          // 伤害系数
  damageType: DamageType;      // 伤害类型
  targetType: TargetType;      // 目标类型
  targetFilter: TargetFilter;   // 目标筛选条件
  effects: SkillEffect[];      // 附加效果
  animation: AnimationConfig;  // 动画配置
}

// 被动技能配置
interface PassiveSkillConfig {
  skillId: string;              // 技能ID
  name: string;                 // 技能名称
  triggerType: PassiveTriggerType; // 触发类型
  triggerCondition: TriggerCondition; // 触发条件
  effect: SkillEffect;          // 效果
  priority: number;            // 优先级
}
```

### 2.3 敌人配置数据结构

```typescript
// 敌人基础属性
interface EnemyBaseConfig {
  enemyId: string;              // 唯一标识：ENEMY_001 / BOSS_001
  name: string;                 // 名称
  type: EnemyType;              // 类型：小怪/精英/Boss/四象守护
  theme: EnemyTheme;            // 主题：墓穴幽魂/秦陵地宫等
  level: number;                // 等级
  difficulty: number;           // 难度等级 (1-10)
  
  // 战斗属性
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  
  // 特殊属性
  abilities: Ability[];          // 能力列表
  specialMechanic?: SpecialMechanic; // 特殊机制
  
  // AI配置
  aiConfig: EnemyAIConfig;
  
  // 掉落配置
  dropTable: DropTableConfig;
}

// AI配置
interface EnemyAIConfig {
  behaviorType: BehaviorType;    // 行为类型
  aggressionLevel: number;       // 攻击性等级 (0-1)
  targetPriority: TargetPriority[]; // 目标优先级
  
  // 技能使用AI
  skillUsageRules: SkillUsageRule[];
  
  // 阶段切换配置
  phaseTransitions?: PhaseTransition[];
}

// 精英/Boss扩展配置
interface EliteEnemyConfig extends EnemyBaseConfig {
  eliteMultiplier: number;       // 精英加成倍率 (1.5)
  eliteSkills: EliteSkillConfig[]; // 精英专属技能
  eliteMechanic: EliteMechanic;  // 精英特殊机制
}

// Boss扩展配置
interface BossEnemyConfig extends EliteEnemyConfig {
  bossMultiplier: number;        // Boss加成倍率 (3.0)
  phaseCount: number;            // 阶段数量
  phases: BossPhase[];           // 各阶段配置
  summonConfig: SummonConfig;    // 召唤配置
  enrageConfig: EnrageConfig;   // 狂暴配置
}

// 四象守护配置
interface FourSymbolsBossConfig extends BossEnemyConfig {
  fourSymbolsType: FourSymbolsType; // 青龙/白虎/朱雀/玄武
  fourSymbolsMultiplier: number;    // 四象加成倍率 (4.0)
  uniqueMechanic: FourSymbolsUniqueMechanic; // 独有机制
}
```

### 2.4 关卡配置数据结构

```typescript
// 关卡配置
interface LevelConfig {
  levelId: string;               // 关卡ID：LEVEL_1_1
  name: string;                  // 关卡名称
  chapter: number;               // 章节号
  type: LevelType;               // 类型：普通/精英/Boss
  difficulty: number;            // 难度
  
  // 地图配置
  mapConfig: MapConfig;
  
  // 战斗配置
  battleConfig: LevelBattleConfig;
  
  // 奖励配置
  rewardConfig: LevelRewardConfig;
  
  // 星级条件
  starConditions: StarCondition[];
  
  // 剧情配置
  storyConfig?: StoryConfig;
}

// 地图配置
interface MapConfig {
  width: number;                 // 地图宽度
  height: number;                // 地图高度
  tileSize: number;              // 格子大小
  terrain: TerrainType[][];      // 地形数据
  obstacles: Position[];        // 障碍物位置
  spawnPoints: SpawnPoint[];     // 出生点
}

// 战斗配置
interface LevelBattleConfig {
  actionPoints: number;          // 行动点数
  angerInit: number;             // 初始怒气
  turnLimit: number;             // 回合限制
  difficultyMultiplier: number; // 难度倍率
  
  // 敌人波次
  waves: BattleWave[];
  
  // 特殊规则
  specialRules?: SpecialBattleRule[];
}

// 战斗波次
interface BattleWave {
  waveId: number;                // 波次ID
  enemies: WaveEnemy[];          // 敌人配置
  spawnCondition: SpawnCondition; // 生成条件
  triggerCondition: TriggerCondition; // 触发条件
}

// 星级条件
interface StarCondition {
  star: 1 | 2 | 3;              // 星级
  conditionType: ConditionType; // 条件类型
  params: Record<string, any>;  // 条件参数
}
```

### 2.5 Buff/状态配置数据结构

```typescript
// Buff配置
interface BuffConfig {
  buffId: string;                // Buff ID
  name: string;                 // 名称
  type: BuffType;                // Buff类型
  
  // 叠加规则
  stackType: StackType;          // 叠加类型：无/叠加/刷新/互斥
  maxStack: number;              // 最大叠加层数
  
  // 持续时间
  durationType: DurationType;     // 持续类型
  duration: number;              // 持续时间(回合)
  durationTag?: string;          // 持续时间标签
  
  // 效果配置
  effects: BuffEffect[];
  
  // 显示配置
  icon: string;                  // 图标资源
  color: string;                 // 颜色
  priority: number;              // 显示优先级
  
  // 清除条件
  clearConditions: ClearCondition[];
}

// Buff效果
interface BuffEffect {
  effectType: BuffEffectType;   // 效果类型
  value: number;                 // 效果值
  target: BuffTarget;            // 效果目标：自己/敌人/全体
  calculation: CalculationType;  // 计算方式：固定值/百分比/加成
  formula?: string;              // 自定义公式
}

// Buff类型枚举
enum BuffType {
  BUFF = 'buff',                // 增益Buff
  DEBUFF = 'debuff',            // 减益Buff
  CONTROL = 'control',          // 控制Buff
  SHIELD = 'shield',            // 护盾Buff
  DOT = 'dot',                  // 持续伤害
  HOT = 'hot'                   // 持续治疗
}
```

---

## 三、数据加载器设计

### 3.1 加载器架构

```typescript
// 数据加载器管理器
class ConfigLoaderManager {
  private loaders: Map<string, BaseConfigLoader>;
  private cache: Map<string, any>;
  private loadingState: Map<string, LoadingState>;
  
  constructor() {
    this.loaders = new Map();
    this.cache = new Map();
    this.loadingState = new Map();
  }
  
  // 注册加载器
  registerLoader(type: string, loader: BaseConfigLoader) {
    this.loaders.set(type, loader);
  }
  
  // 加载配置
  async load(type: string, id?: string): Promise<any> {
    const cacheKey = id ? `${type}:${id}` : type;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 检查加载中
    if (this.loadingState.get(cacheKey) === 'loading') {
      return this.waitForLoading(cacheKey);
    }
    
    // 执行加载
    this.loadingState.set(cacheKey, 'loading');
    try {
      const loader = this.loaders.get(type);
      if (!loader) throw new Error(`Loader not found: ${type}`);
      
      const data = id ? await loader.loadById(id) : await loader.loadAll();
      this.cache.set(cacheKey, data);
      return data;
    } finally {
      this.loadingState.set(cacheKey, 'loaded');
    }
  }
  
  // 预加载相关配置
  async preloadRelated(type: string, id: string): Promise<void> {
    const loader = this.loaders.get(type);
    if (loader && 'preloadRelated' in loader) {
      const related = await loader.preloadRelated(id);
      for (const { type, id } of related) {
        await this.load(type, id);
      }
    }
  }
  
  // 清理缓存
  clearCache(type?: string) {
    if (type) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${type}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

// 基础加载器接口
interface BaseConfigLoader {
  loadAll(): Promise<any>;
  loadById(id: string): Promise<any>;
  validate?(data: any): boolean;
}

// 英雄加载器
class HeroConfigLoader implements BaseConfigLoader {
  private basePath = 'data/heroes/';
  private heroes: Map<string, HeroBaseConfig>;
  
  async loadAll(): Promise<Map<string, HeroBaseConfig>> {
    if (this.heroes) return this.heroes;
    
    // 加载所有英雄基础配置
    const heroIds = await this.loadHeroIndex();
    const promises = heroIds.map(id => this.loadById(id));
    const configs = await Promise.all(promises);
    
    this.heroes = new Map(configs.map(c => [c.heroId, c]));
    return this.heroes;
  }
  
  async loadById(heroId: string): Promise<HeroBaseConfig> {
    const filePath = `${this.basePath}${heroId}.json`;
    const data = await this.fetchConfig(filePath);
    return this.parseHeroConfig(data);
  }
  
  async preloadRelated(heroId: string): Promise<RelatedConfig[]> {
    const hero = await this.loadById(heroId);
    const related: RelatedConfig[] = [];
    
    // 预加载技能配置
    if (hero.skills) {
      for (const skill of hero.skills) {
        related.push({ type: 'skill', id: skill.skillId });
      }
    }
    
    return related;
  }
}
```

### 3.2 异步加载策略

```typescript
// 配置加载策略
class ConfigLoadStrategy {
  
  // 启动时预加载
  static async preloadCriticalConfigs(): Promise<void> {
    const criticalConfigs = [
      'heroes',      // 英雄配置
      'enemies',     // 敌人配置
      'skills',      // 技能配置
      'buffs',       // Buff配置
    ];
    
    await Promise.all(
      criticalConfigs.map(type => 
        ConfigLoader.load(type).catch(err => {
          console.error(`Failed to preload ${type}:`, err);
        })
      )
    );
  }
  
  // 战斗前按需加载
  static async preloadForBattle(levelId: string): Promise<BattlePreloadResult> {
    const results = {
      heroes: true,
      enemies: true,
      level: true,
      skills: true,
      buffs: true,
      drops: true
    };
    
    try {
      // 1. 加载关卡配置
      const levelConfig = await ConfigLoader.load('level', levelId);
      
      // 2. 提取需要的敌人ID
      const enemyIds = this.extractEnemyIds(levelConfig);
      
      // 3. 提取需要的英雄ID (从玩家编队)
      const heroIds = GameData.player.team;
      
      // 4. 并行加载
      await Promise.all([
        ConfigLoader.load('hero', heroIds),
        ConfigLoader.load('enemy', enemyIds),
        ConfigLoader.preloadRelated('skill', enemyIds),
        ConfigLoader.preloadRelated('buff', enemyIds),
        ConfigLoader.load('drop', levelConfig.rewards)
      ]);
      
      return { success: true, results };
    } catch (error) {
      return { success: false, results, error };
    }
  }
  
  // 延迟加载 (按需)
  static async lazyLoad(path: string): Promise<any> {
    const [type, id] = path.split(':');
    return ConfigLoader.load(type, id);
  }
}
```

### 3.3 配置版本管理

```typescript
// 配置版本管理器
class ConfigVersionManager {
  private versions: Map<string, ConfigVersion>;
  private currentVersion: string;
  
  async checkUpdate(): Promise<UpdateInfo | null> {
    const remoteVersion = await this.fetchRemoteVersion();
    const localVersion = this.getLocalVersion();
    
    if (remoteVersion.build > localVersion.build) {
      return {
        hasUpdate: true,
        currentVersion: localVersion.build,
        latestVersion: remoteVersion.build,
        changelog: remoteVersion.changelog,
        forceUpdate: remoteVersion.forceUpdate
      };
    }
    return null;
  }
  
  async downloadUpdate(info: UpdateInfo): Promise<void> {
    const patches = await this.getRequiredPatches(info);
    
    for (const patch of patches) {
      await this.downloadPatch(patch);
      await this.applyPatch(patch);
    }
    
    await this.updateLocalVersion(info.latestVersion);
  }
  
  // 热更新 (无需重启)
  async hotReload(type: string): Promise<void> {
    const patch = await this.fetchPatch(type);
    await this.applyPatch(patch);
    ConfigLoader.clearCache(type);
  }
}

// 配置版本信息
interface ConfigVersion {
  build: number;
  timestamp: number;
  hash: string;
  configHashes: Record<string, string>;
}
```

---

## 四、战斗初始化流程

### 4.1 初始化流程图

```
初始化流程:

1. 接收战斗请求
   ├── 验证战斗参数
   │     └── levelId, team, difficulty
   │
   ├── 加载战斗配置
   │     ├── 加载关卡配置 (levelConfig)
   │     ├── 加载敌人配置 (enemyConfigs)
   │     ├── 加载英雄配置 (heroConfigs)
   │     ├── 加载技能配置 (skillConfigs)
   │     └── 加载Buff配置 (buffConfigs)
   │
   ├── 创建战斗上下文
   │     ├── BattleContext
   │     │     ├── battleId
   │     │     ├── levelConfig
   │     │     ├── startTime
   │     │     └── difficulty
   │     │
   │     ├── CombatUnits (Map<UnitId, CombatUnit>)
   │     │     ├── heroes: CombatUnit[]
   │     │     │     └── 计算最终属性
   │     │     │         ├── 基础属性 + 装备加成
   │     │     │         ├── 羁绊加成
   │     │     │         └── 阵法加成
   │     │     │
   │     │     └── enemies: CombatUnit[]
   │     │           └── 计算难度加成
   │     │               └── 基础属性 × 难度倍率
   │     │
   │     └── BattleState
   │           ├── turn
   │           ├── actionPoints
   │           ├── phase
   │           └── wave
   │
   ├── 初始化战斗系统
   │     ├── 初始化行动条 (ActionBar)
   │     │     └── 按速度排序，所有单位加入行动条
   │     │
   │     ├── 初始化Buff容器 (BuffManager)
   │     │     └── 创建Buff实例Map
   │     │
   │     ├── 初始化AI系统 (AIManager)
   │     │     └── 为敌人设置AI配置
   │     │
   │     └── 初始化战斗事件系统 (BattleEventSystem)
   │           └── 订阅战斗事件
   │
   ├── 执行战斗前效果
   │     ├── 触发战斗开始Buff
   │     │     └── 如：星尘的星光护盾
   │     │
   │     ├── 执行阵法和羁绊效果
   │     │
   │     └── 执行特殊关卡效果
   │
   └── 初始化完成，开始战斗回合
```

### 4.2 初始化核心代码

```typescript
// 战斗管理器
class BattleManager {
  private context: BattleContext;
  private state: BattleState;
  private systems: BattleSystems;
  
  async initialize(request: BattleRequest): Promise<InitializeResult> {
    const startTime = Date.now();
    
    try {
      // 1. 验证战斗参数
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // 2. 加载战斗配置
      const configs = await this.loadBattleConfigs(request);
      
      // 3. 创建战斗上下文
      this.context = this.createBattleContext(request, configs);
      
      // 4. 创建战斗单位
      const units = this.createCombatUnits(configs);
      
      // 5. 初始化战斗系统
      this.systems = this.initializeBattleSystems(units);
      
      // 6. 执行战斗前效果
      await this.executePreBattleEffects(units);
      
      // 7. 生成战斗UI
      await this.createBattleUI(units);
      
      // 8. 开始战斗
      this.startBattleLoop();
      
      const loadTime = Date.now() - startTime;
      return { 
        success: true, 
        battleId: this.context.battleId,
        loadTime,
        units: units.summary
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // 创建战斗单位
  private createCombatUnits(configs: BattleConfigs): CombatUnits {
    const heroes: CombatUnit[] = [];
    const enemies: CombatUnit[] = [];
    
    // 创建英雄单位
    for (const heroData of configs.heroes) {
      const baseConfig = configs.heroConfigs.get(heroData.heroId);
      const unit = this.createHeroUnit(heroData, baseConfig);
      
      // 计算最终属性
      this.calculateFinalAttributes(unit, heroData, baseConfig);
      
      heroes.push(unit);
    }
    
    // 创建敌人单位
    for (const enemyData of configs.enemies) {
      const baseConfig = configs.enemyConfigs.get(enemyData.enemyId);
      const unit = this.createEnemyUnit(enemyData, baseConfig, configs.levelConfig);
      
      // 应用难度加成
      this.applyDifficultyBonus(unit, configs.levelConfig.difficulty);
      
      enemies.push(unit);
    }
    
    return { heroes, enemies };
  }
  
  // 计算最终属性
  private calculateFinalAttributes(
    unit: CombatUnit, 
    heroData: HeroData, 
    baseConfig: HeroBaseConfig
  ): void {
    // 1. 基础属性
    const level = heroData.level;
    const baseGrowth = baseConfig.levelGrowth;
    
    unit.maxHp = Math.floor(baseConfig.maxHp * (1 + baseGrowth.hp * (level - 1) / 100));
    unit.attack = Math.floor(baseConfig.attack * (1 + baseGrowth.atk * (level - 1) / 100));
    unit.defense = Math.floor(baseConfig.defense * (1 + baseGrowth.def * (level - 1) / 100));
    unit.speed = baseConfig.speed + baseGrowth.speed * (level - 1);
    
    // 2. 装备加成
    for (const equip of heroData.equipments) {
      const equipConfig = ConfigLoader.get('equipment', equip.id);
      unit.attack += equipConfig.atkBonus;
      unit.defense += equipConfig.defBonus;
      unit.maxHp += equipConfig.hpBonus;
    }
    
    // 3. 羁绊加成
    const bonds = this.getActiveBonds(heroData.heroId);
    for (const bond of bonds) {
      unit.attack *= (1 + bond.atkBonus);
      unit.defense *= (1 + bond.defBonus);
      unit.maxHp *= (1 + bond.hpBonus);
    }
    
    // 4. 阵法加成
    const formation = this.getFormationBonus(heroData.position);
    unit.attack *= (1 + formation.atkBonus);
    unit.defense *= (1 + formation.defBonus);
    
    // 5. 当前值初始化
    unit.currentHp = unit.maxHp;
    unit.currentAnger = heroData.initialAnger || configs.levelConfig.angerInit;
  }
  
  // 初始化战斗系统
  private initializeBattleSystems(units: CombatUnits): BattleSystems {
    return {
      actionBar: new ActionBarSystem(units),
      buffManager: new BuffManager(),
      aiManager: new AIManager(units.enemies),
      damageCalculator: new DamageCalculator(),
      skillExecutor: new SkillExecutor(),
      eventSystem: new BattleEventSystem(),
      stateManager: new BattleStateManager()
    };
  }
}
```

### 4.3 配置数据验证

```typescript
// 数据验证器
class ConfigValidator {
  private rules: Map<string, ValidationRule[]>;
  
  constructor() {
    this.rules = new Map();
    this.initRules();
  }
  
  // 初始化验证规则
  private initRules() {
    // 英雄配置验证
    this.rules.set('hero', [
      { field: 'heroId', check: 'required', message: '英雄ID不能为空' },
      { field: 'heroId', check: 'pattern', value: /^HERO_[A-Z]+_\d{3}$/, message: '英雄ID格式错误' },
      { field: 'maxHp', check: 'min', value: 100, message: '生命值最小100' },
      { field: 'attack', check: 'min', value: 1, message: '攻击力最小1' },
      { field: 'speed', check: 'range', min: 1, max: 200, message: '速度范围1-200' },
      { field: 'critRate', check: 'range', min: 0, max: 1, message: '暴击率范围0-1' }
    ]);
    
    // 技能配置验证
    this.rules.set('skill', [
      { field: 'skillId', check: 'required', message: '技能ID不能为空' },
      { field: 'damageCoeff', check: 'min', value: 0, message: '伤害系数不能为负' },
      { field: 'angerCost', check: 'min', value: 0, message: '怒气消耗不能为负' },
      { field: 'targetType', check: 'enum', value: ['self', 'single', 'row', 'column', 'all'], message: '目标类型错误' }
    ]);
    
    // 关卡配置验证
    this.rules.set('level', [
      { field: 'levelId', check: 'pattern', value: /^LEVEL_\d+_\d+$/, message: '关卡ID格式错误' },
      { field: 'turnLimit', check: 'min', value: 1, message: '回合限制最小1' },
      { field: 'enemies', check: 'minLength', value: 1, message: '至少需要1个敌人' }
    ]);
  }
  
  // 验证配置
  validate(type: string, config: any): ValidationResult {
    const rules = this.rules.get(type) || [];
    const errors: ValidationError[] = [];
    
    for (const rule of rules) {
      const error = this.validateRule(config, rule);
      if (error) errors.push(error);
    }
    
    // 特殊验证
    if (type === 'level') {
      errors.push(...this.validateLevelSpecial(config));
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // 层级验证
  private validateLevelSpecial(config: LevelConfig): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 验证星级条件
    const stars = new Set(config.starConditions.map(s => s.star));
    if (stars.size !== 3) {
      errors.push({
        field: 'starConditions',
        message: '必须包含1-3星所有条件'
      });
    }
    
    // 验证敌人波次
    for (const wave of config.battleConfig.waves) {
      if (wave.enemies.length === 0) {
        errors.push({
          field: `waves.${wave.waveId}`,
          message: `波次${wave.waveId}不能为空`
        });
      }
    }
    
    return errors;
  }
}

// 验证规则
interface ValidationRule {
  field: string;
  check: 'required' | 'pattern' | 'min' | 'max' | 'range' | 'enum' | 'minLength';
  value?: any;
  min?: number;
  max?: number;
  message: string;
}
```

---

## 五、内存数据管理

### 5.1 数据缓存策略

```typescript
// 战斗数据缓存
class BattleDataCache {
  private cache: Map<string, CacheEntry>;
  private accessOrder: string[];  // LRU顺序
  
  constructor(
    private maxSize: number = 100,
    private ttl: number = 60000  // 60秒过期
  ) {
    this.cache = new Map();
    this.accessOrder = [];
  }
  
  // 设置缓存
  set(key: string, value: any, ttl?: number): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      expireAt: Date.now() + (ttl || this.ttl),
      lastAccess: Date.now()
    });
    
    this.accessOrder.push(key);
  }
  
  // 获取缓存
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // 检查过期
    if (Date.now() > entry.expireAt) {
      this.cache.delete(key);
      return null;
    }
    
    // 更新访问时间
    entry.lastAccess = Date.now();
    return entry.value;
  }
  
  // LRU淘汰
  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const oldest = this.accessOrder.shift();
      this.cache.delete(oldest);
    }
  }
}

// 战斗专用的缓存管理器
class BattleCacheManager {
  private static instance: BattleCacheManager;
  
  // 按类型分类缓存
  private heroCache: BattleDataCache;
  private enemyCache: BattleDataCache;
  private levelCache: BattleDataCache;
  private skillCache: BattleDataCache;
  
  private constructor() {
    // 英雄配置：大量数据，长TTL
    this.heroCache = new BattleDataCache(200, 300000);
    
    // 敌人配置：中等数据，中等TTL
    this.enemyCache = new BattleDataCache(100, 180000);
    
    // 关卡配置：数据量适中
    this.levelCache = new BattleDataCache(50, 120000);
    
    // 技能配置：数据量大，短TTL
    this.skillCache = new BattleDataCache(300, 60000);
  }
  
  static getInstance(): BattleCacheManager {
    if (!BattleCacheManager.instance) {
      BattleCacheManager.instance = new BattleCacheManager();
    }
    return BattleCacheManager.instance;
  }
  
  // 获取指定类型的缓存
  getCache(type: 'hero' | 'enemy' | 'level' | 'skill'): BattleDataCache {
    switch (type) {
      case 'hero': return this.heroCache;
      case 'enemy': return this.enemyCache;
      case 'level': return this.levelCache;
      case 'skill': return this.skillCache;
    }
  }
}
```

### 5.2 数据持久化接口

```typescript
// 战斗数据持久化
interface BattleDataPersistence {
  // 保存战斗进度
  saveBattleProgress(battleId: string, state: BattleState): Promise<void>;
  
  // 加载战斗进度
  loadBattleProgress(battleId: string): Promise<BattleState | null>;
  
  // 战斗重试数据
  saveRetryData(levelId: string, team: HeroData[]): Promise<void>;
  
  // 清除战斗缓存
  clearBattleCache(): Promise<void>;
}

// 本地存储实现
class LocalStoragePersistence implements BattleDataPersistence {
  private prefix = 'cqj_battle_';
  
  async saveBattleProgress(battleId: string, state: BattleState): Promise<void> {
    const key = `${this.prefix}progress_${battleId}`;
    const data = JSON.stringify({
      battleId,
      state,
      savedAt: Date.now()
    });
    
    try {
      localStorage.setItem(key, data);
    } catch (e) {
      // 存储满时清理旧数据
      await this.cleanOldData();
      localStorage.setItem(key, data);
    }
  }
  
  async loadBattleProgress(battleId: string): Promise<BattleState | null> {
    const key = `${this.prefix}progress_${battleId}`;
    const data = localStorage.getItem(key);
    
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    // 检查是否过期 (24小时)
    if (Date.now() - parsed.savedAt > 86400000) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.state;
  }
  
  async cleanOldData(): Promise<void> {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    
    // 按保存时间排序
    const sorted = keys
      .map(k => ({
        key: k,
        time: JSON.parse(localStorage.getItem(k) || '{}').savedAt || 0
      }))
      .sort((a, b) => a.time - b.time);
    
    // 删除最旧的50%
    const toDelete = sorted.slice(0, Math.floor(sorted.length / 2));
    for (const item of toDelete) {
      localStorage.removeItem(item.key);
    }
  }
}
```

---

## 六、实现要点总结

### 6.1 核心实现要求

| 模块 | 实现要点 | 优先级 |
|------|----------|--------|
| 数据结构 | 使用TypeScript强类型定义，确保编译期检查 | P0 |
| 加载器 | 实现懒加载和预加载策略，减少首屏加载时间 | P0 |
| 验证器 | 完善配置数据验证，防止非法数据导致崩溃 | P1 |
| 缓存 | 实现多级缓存策略，平衡内存和性能 | P1 |
| 版本管理 | 支持配置热更新，无需发版修复 | P2 |

### 6.2 性能优化建议

1. **加载优化**
   - 关键配置启动时预加载
   - 非关键配置按需懒加载
   - 批量加载使用Promise.all并行

2. **缓存优化**
   - 热点数据常驻内存
   - 冷数据使用LRU淘汰
   - 战斗中的临时数据不缓存

3. **验证优化**
   - 开发环境完整验证
   - 生产环境简化验证
   - 配置错误降级处理

### 6.3 扩展性设计

1. **配置扩展**
   - 支持自定义配置路径
   - 支持配置热插拔
   - 支持配置优先级

2. **系统扩展**
   - 预留系统注册接口
   - 支持系统依赖注入
   - 支持系统事件订阅

---

*文档版本：v1.0 | 最后更新：2026-04-24*
