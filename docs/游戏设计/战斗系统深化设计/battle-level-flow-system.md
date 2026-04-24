# 关卡流程系统设计方案

> 版本：1.0
> 日期：2026年4月24日
> 游戏：《苍穹劫·摸金传人》
> 状态：深化设计文档

---

## 一、文档概述

### 1.1 目的与范围

本文档定义关卡流程系统的完整设计方案，包括探索→战斗触发流程、战斗初始化参数传递、战斗结算流程、星级评定算法、掉落奖励计算、多波次战斗处理和战斗失败处理。本系统是战斗系统与关卡系统的衔接模块。

### 1.2 设计原则

- **流程清晰**：各阶段流程明确无歧义
- **状态可控**：支持中断、恢复、重试
- **数据完整**：结算数据准确无误
- **体验流畅**：减少等待，优化反馈

---

## 二、探索→战斗触发流程

### 2.1 触发流程总览

```
探索阶段 → 遭遇敌人 → 战斗前置 → 战斗初始化 → 战斗循环

流程说明：
1. 探索阶段：玩家在地宫地图中移动
2. 遭遇敌人：触发战斗事件
3. 战斗前置：检查是否强制战斗/可逃跑
4. 战斗初始化：加载敌人、初始化战斗系统
5. 战斗循环：执行战斗直到结束
```

### 2.2 触发条件定义

```typescript
// 战斗触发类型
enum BattleTriggerType {
  FORCED = 'forced',             // 强制战斗（剧情/固定事件）
  ENCOUNTER = 'encounter',       // 随机遭遇
  ELITE_ENCOUNTER = 'elite_encounter', // 精英遭遇
  BOSS_ENCOUNTER = 'boss_encounter',   // Boss遭遇
  TRAP = 'trap',                 // 陷阱触发
  EVENT = 'event',              // 事件战斗
}

// 触发条件配置
interface BattleTriggerConfig {
  triggerType: BattleTriggerType;
  
  // 触发源
  source: {
    type: 'enemy_spawn' | 'trap_triggered' | 'story_event' | 'random';
    id?: string;
  };
  
  // 触发参数
  params: {
    enemyIds?: string[];          // 敌人ID列表
    waveCount?: number;           // 波次数量
    difficulty?: number;          // 难度
    canEscape?: boolean;          // 是否可逃跑
    escapeChance?: number;        // 逃跑成功率
    autoStart?: boolean;          // 是否自动开始战斗
  };
  
  // 战斗前置条件
  preConditions?: {
    requireItem?: string;         // 需要道具
    requireBuff?: string;         // 需要Buff
    requireProgress?: number;     // 需要剧情进度
  };
  
  // 前置/后置事件
  preEvents?: string[];          // 战斗前触发的事件
  postEvents?: string[];         // 战斗后触发的事件
}

// 触发配置示例
const BATTLE_TRIGGER_CONFIGS = {
  // 普通遭遇
  normal_encounter: {
    triggerType: BattleTriggerType.ENCOUNTER,
    source: { type: 'random' },
    params: {
      canEscape: true,
      escapeChance: 0.5,
      autoStart: false
    }
  },
  
  // Boss遭遇
  boss_encounter: {
    triggerType: BattleTriggerType.BOSS_ENCOUNTER,
    source: { type: 'story_event' },
    params: {
      canEscape: false,
      autoStart: true
    },
    preConditions: {
      requireProgress: 3
    },
    preEvents: ['BOSS_APPEAR_CINEMATIC'],
    postEvents: ['BOSS_DEFEATED_STORY']
  },
  
  // 陷阱触发
  trap_encounter: {
    triggerType: BattleTriggerType.TRAP,
    source: { type: 'trap_triggered' },
    params: {
      enemyIds: ['TRAP_GUARDIAN'],
      canEscape: true,
      escapeChance: 0.3
    }
  }
};
```

### 2.3 触发执行器

```typescript
// 战斗触发管理器
class BattleTriggerManager {
  private battleManager: BattleManager;
  private eventSystem: BattleEventSystem;
  
  // 触发战斗
  async triggerBattle(config: BattleTriggerConfig): Promise<BattleResult> {
    // 1. 检查前置条件
    const preCheck = await this.checkPreConditions(config);
    if (!preCheck.passed) {
      return { triggered: false, reason: preCheck.reason };
    }
    
    // 2. 执行前置事件
    if (config.preEvents) {
      await this.executePreEvents(config.preEvents);
    }
    
    // 3. 加载战斗配置
    const battleConfig = await this.prepareBattleConfig(config);
    
    // 4. 显示战斗前置UI
    if (!config.params.autoStart) {
      const userChoice = await this.showBattleEntryUI(config);
      if (userChoice.action === 'escape') {
        return await this.handleEscape(config, userChoice);
      }
      if (userChoice.action === 'cancel') {
        return { triggered: false, reason: 'canceled_by_user' };
      }
    }
    
    // 5. 初始化战斗
    const initResult = await this.battleManager.initialize(battleConfig);
    if (!initResult.success) {
      return { triggered: false, reason: initResult.error };
    }
    
    // 6. 开始战斗
    const battleResult = await this.battleManager.startBattle();
    
    // 7. 处理战斗结果
    const processedResult = await this.processBattleResult(battleResult, config);
    
    // 8. 执行后置事件
    if (config.postEvents) {
      await this.executePostEvents(config.postEvents, processedResult);
    }
    
    return processedResult;
  }
  
  // 检查前置条件
  private async checkPreConditions(config: BattleTriggerConfig): Promise<CheckResult> {
    if (!config.preConditions) {
      return { passed: true };
    }
    
    const { requireItem, requireBuff, requireProgress } = config.preConditions;
    
    if (requireItem && !this.player.hasItem(requireItem)) {
      return { passed: false, reason: `需要道具: ${requireItem}` };
    }
    
    if (requireBuff && !this.player.hasBuff(requireBuff)) {
      return { passed: false, reason: `需要Buff: ${requireBuff}` };
    }
    
    if (requireProgress && this.player.progress < requireProgress) {
      return { passed: false, reason: '剧情进度不足' };
    }
    
    return { passed: true };
  }
  
  // 准备战斗配置
  private async prepareBattleConfig(config: BattleTriggerConfig): Promise<BattleConfig> {
    return {
      levelId: config.source.id || this.generateTempLevelId(),
      triggerType: config.triggerType,
      
      // 敌人配置
      enemies: await this.loadEnemyConfigs(config.params.enemyIds || []),
      
      // 波次配置
      waves: this.generateWaves(config.params.waveCount || 1, config.params.enemyIds),
      
      // 难度配置
      difficulty: config.params.difficulty || this.getCurrentDifficulty(),
      
      // 战斗规则
      rules: {
        canEscape: config.params.canEscape || false,
        escapeChance: config.params.escapeChance || 0,
        turnLimit: this.getTurnLimit(config),
        fatigueCost: this.calculateFatigueCost(config)
      },
      
      // 奖励配置
      rewardConfig: await this.prepareRewardConfig(config)
    };
  }
  
  // 处理逃跑
  private async handleEscape(trigger: BattleTriggerConfig, choice: UserChoice): Promise<BattleResult> {
    const escapeChance = trigger.params.escapeChance || 0.5;
    
    // 逃跑判定
    if (Math.random() < escapeChance) {
      // 逃跑成功
      return {
        triggered: false,
        reason: 'escaped',
        escapeResult: 'success',
        postEvents: ['ESCAPE_SUCCESS_EVENT']
      };
    } else {
      // 逃跑失败，进入战斗
      // 消耗逃跑失败的惩罚（少量疲劳）
      this.player.reduceFatigue(10);
      
      return {
        triggered: true,
        reason: 'escape_failed',
        escapeResult: 'failed'
      };
    }
  }
}
```

---

## 三、战斗初始化参数传递

### 3.1 参数传递流程

```
关卡系统 → 战斗请求 → 战斗初始化 → 战斗上下文

参数传递内容：
1. 基础参数：关卡ID、敌人配置、玩家编队
2. 难度参数：难度等级、属性倍率
3. 规则参数：回合限制、逃跑规则、疲劳消耗
4. 奖励参数：基础奖励、额外奖励、掉落表
5. 特殊参数：剧情事件、特殊条件
```

### 3.2 参数数据结构

```typescript
// 战斗请求
interface BattleRequest {
  // 基础信息
  requestId: string;
  source: BattleSource;
  
  // 关卡信息
  levelId?: string;
  levelConfig?: LevelConfig;
  
  // 玩家信息
  playerId: string;
  team: HeroBattleData[];
  formations: FormationData[];
  
  // 敌人信息
  enemies: EnemyBattleData[];
  
  // 难度配置
  difficulty: DifficultyConfig;
  
  // 战斗规则
  rules: BattleRules;
  
  // 奖励配置
  rewards: RewardConfig;
  
  // 特殊配置
  specialConfig?: SpecialBattleConfig;
}

// 玩家编队数据
interface HeroBattleData {
  heroId: string;
  level: number;
  equipment: EquipmentData[];
  skills: SkillLevelData[];
  artifacts?: ArtifactData[];
  
  // 战斗状态
  currentHp: number;
  currentMp: number;
  currentAnger: number;
  
  // 继承状态（从上一场战斗）
  buffs?: BuffInstance[];
}

// 敌人战斗数据
interface EnemyBattleData {
  enemyId: string;
  templateId: string;
  
  // 战斗属性（已应用难度）
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  
  // 特殊属性
  abilities: AbilityData[];
  
  // 位置
  position: Position;
  
  // 波次信息
  waveId: number;
  spawnCondition: SpawnCondition;
}

// 战斗规则
interface BattleRules {
  // 回合限制
  turnLimit: number;
  
  // 逃跑规则
  canEscape: boolean;
  escapeChance: number;
  
  // 疲劳度
  fatigueEnabled: boolean;
  fatigueCost: number;
  
  // 时间限制
  timeLimit?: number;
  
  // 特殊规则
  specialRules?: SpecialRule[];
  
  // 暂停规则
  canPause: boolean;
  autoSpeed?: 1 | 2 | 3;
}

// 特殊战斗配置
interface SpecialBattleConfig {
  // 剧情配置
  storyEvents?: StoryEvent[];
  
  // 特殊条件
  winConditions?: WinCondition[];
  loseConditions?: LoseCondition[];
  
  // 环境效果
  environmentEffects?: EnvironmentEffect[];
  
  // 限制条件
  restrictions?: BattleRestriction[];
}
```

### 3.3 初始化参数验证

```typescript
// 参数验证器
class BattleRequestValidator {
  // 验证战斗请求
  validate(request: BattleRequest): ValidationResult {
    const errors: ValidationError[] = [];
    
    // 1. 验证队伍
    if (request.team.length === 0) {
      errors.push({ field: 'team', message: '队伍不能为空' });
    }
    if (request.team.length > 4) {
      errors.push({ field: 'team', message: '队伍最多4人' });
    }
    
    // 2. 验证敌人
    if (request.enemies.length === 0) {
      errors.push({ field: 'enemies', message: '敌人不能为空' });
    }
    
    // 3. 验证难度
    if (!this.isValidDifficulty(request.difficulty.level)) {
      errors.push({ field: 'difficulty', message: '难度等级无效' });
    }
    
    // 4. 验证回合限制
    if (request.rules.turnLimit < 1) {
      errors.push({ field: 'turnLimit', message: '回合限制至少1' });
    }
    
    // 5. 验证特殊条件
    if (request.specialConfig?.winConditions) {
      for (const condition of request.specialConfig.winConditions) {
        const conditionValid = this.validateWinCondition(condition);
        if (!conditionValid.valid) {
          errors.push(...conditionValid.errors);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // 验证并修复请求
  validateAndFix(request: BattleRequest): BattleRequest {
    const result = this.validate(request);
    
    if (result.errors.length > 0) {
      // 尝试修复
      const fixed = { ...request };
      
      // 修复队伍
      if (fixed.team.length > 4) {
        fixed.team = fixed.team.slice(0, 4);
      }
      
      // 修复回合限制
      if (fixed.rules.turnLimit < 1) {
        fixed.rules.turnLimit = 30;
      }
      
      return fixed;
    }
    
    return request;
  }
}
```

---

## 四、战斗结算流程

### 4.1 结算流程图

```
战斗结束判定
    │
    ├── 胜利条件检查
    │     ├── 敌人全灭
    │     ├── 特殊胜利条件
    │     └── 超时/逃跑
    │
    ├── 失败条件检查
    │     ├── 英雄全灭
    │     ├── 回合耗尽
    │     └── 特殊失败条件
    │
    ├── 结算数据收集
    │     ├── 战斗统计
    │     ├── 星级评定
    │     ├── 奖励计算
    │     └── 成就检查
    │
    ├── 结算UI展示
    │     ├── 结果展示
    │     ├── 星级展示
    │     ├── 奖励展示
    │     └── 统计展示
    │
    └── 结算后处理
          ├── 奖励发放
          ├── 状态重置
          ├── 剧情推进
          └── 导航处理
```

### 4.2 结算数据收集

```typescript
// 战斗统计
interface BattleStatistics {
  // 基础统计
  battleId: string;
  levelId: string;
  duration: number;                    // 战斗时长(ms)
  totalTurns: number;                  // 总回合数
  
  // 伤害统计
  totalDamageDealt: number;            // 总造成伤害
  totalDamageTaken: number;             // 总受到伤害
  heroDamageDealt: Record<string, number>; // 各英雄造成伤害
  highestSingleDamage: number;          // 最高单次伤害
  
  // 治疗统计
  totalHealing: number;                // 总治疗量
  heroHealing: Record<string, number>; // 各英雄治疗量
  
  // 击杀统计
  enemiesKilled: number;               // 击杀敌人数
  heroesLost: number;                   // 英雄阵亡数
  
  // 技能使用统计
  skillsUsed: Record<string, number>; // 技能使用次数
  ultimatesUsed: number;               // 大招使用次数
  
  // 怒气统计
  angerGained: number;                 // 总怒气获取
  angerSpent: number;                  // 总怒气消耗
  
  // 控制统计
  controlEffectsApplied: number;       // 控制效果施加
  controlEffectsReceived: number;      // 控制效果受到
  
  // 特殊统计
  critCount: number;                  // 暴击次数
  dodgeCount: number;                 // 闪避次数
  shieldValue: number;                 // 护盾总量
}

// 结算结果
interface BattleSettlement {
  result: BattleResult;                // 战斗结果
  
  // 星级评定
  stars: 0 | 1 | 2 | 3;
  starDetails: StarEvaluation[];
  
  // 奖励
  rewards: RewardList;
  
  // 统计
  statistics: BattleStatistics;
  
  // 成就
  achievements: AchievementUnlock[];
  
  // 下一关卡
  nextLevelId?: string;
}

// 收集战斗统计
class StatisticsCollector {
  private statistics: BattleStatistics;
  
  constructor(battleId: string, levelId: string) {
    this.statistics = {
      battleId,
      levelId,
      duration: 0,
      totalTurns: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      heroDamageDealt: {},
      highestSingleDamage: 0,
      totalHealing: 0,
      heroHealing: {},
      enemiesKilled: 0,
      heroesLost: 0,
      skillsUsed: {},
      ultimatesUsed: 0,
      angerGained: 0,
      angerSpent: 0,
      controlEffectsApplied: 0,
      controlEffectsReceived: 0,
      critCount: 0,
      dodgeCount: 0,
      shieldValue: 0
    };
  }
  
  // 记录伤害
  recordDamage(dealer: string, receiver: string, damage: number, isCrit: boolean): void {
    if (!this.statistics.heroDamageDealt[dealer]) {
      this.statistics.heroDamageDealt[dealer] = 0;
    }
    this.statistics.heroDamageDealt[dealer] += damage;
    this.statistics.totalDamageDealt += damage;
    
    if (damage > this.statistics.highestSingleDamage) {
      this.statistics.highestSingleDamage = damage;
    }
    
    if (isCrit) {
      this.statistics.critCount++;
    }
  }
  
  // 记录治疗
  recordHealing(healer: string, target: string, amount: number): void {
    if (!this.statistics.heroHealing[healer]) {
      this.statistics.heroHealing[healer] = 0;
    }
    this.statistics.heroHealing[healer] += amount;
    this.statistics.totalHealing += amount;
  }
  
  // 记录击杀
  recordKill(): void {
    this.statistics.enemiesKilled++;
  }
  
  // 记录英雄阵亡
  recordHeroDeath(): void {
    this.statistics.heroesLost++;
  }
  
  // 完成统计收集
  finalize(duration: number, totalTurns: number): BattleStatistics {
    this.statistics.duration = duration;
    this.statistics.totalTurns = totalTurns;
    return this.statistics;
  }
}
```

---

## 五、星级评定算法

### 5.1 星级条件定义

```typescript
// 星级条件配置
interface StarConditionConfig {
  star: 1 | 2 | 3;
  conditionType: ConditionType;
  params: ConditionParams;
  description: string;
}

// 条件类型
enum ConditionType {
  WIN = 'win',                       // 通关
  TURN_LIMIT = 'turn_limit',         // 回合限制
  HP_REMAIN = 'hp_remain',          // 剩余血量
  NO_DEATH = 'no_death',            // 无阵亡
  NO_ITEM = 'no_item',              // 不使用道具
  SKILL_LIMIT = 'skill_limit',      // 技能使用限制
  SPECIFIC_KILL = 'specific_kill',  // 特定击杀
  TIME_LIMIT = 'time_limit',        // 时间限制
  NO_BUFF_LOST = 'no_buff_lost',    // Buff不消失
  FATIGUE_LIMIT = 'fatigue_limit',  // 疲劳限制
}

// 星级条件配置示例
const STAR_CONDITIONS: StarConditionConfig[] = [
  // 1星：通关
  { star: 1, conditionType: 'win', params: {}, description: '击败所有敌人' },
  
  // 2星：回合数限制
  { 
    star: 2, 
    conditionType: 'turn_limit', 
    params: { maxTurns: 20 },
    description: '20回合内通关'
  },
  
  // 3星：剩余血量
  {
    star: 3,
    conditionType: 'hp_remain',
    params: { minHpPercent: 0.6 },
    description: '通关时全员血量60%以上'
  },
  
  // 额外3星：无阵亡
  {
    star: 3,
    conditionType: 'no_death',
    params: {},
    description: '无人阵亡'
  }
];
```

### 5.2 星级评定实现

```typescript
// 星级评定器
class StarEvaluator {
  private levelConfig: LevelConfig;
  private statistics: BattleStatistics;
  
  // 评定星级
  evaluate(heroTeam: CombatUnit[], result: BattleResult): StarEvaluation {
    if (result !== 'win') {
      return { stars: 0, details: [], maxPossibleStars: this.getMaxStars() };
    }
    
    const details: StarEvaluationDetail[] = [];
    let earnedStars = 0;
    
    // 获取星级条件
    const conditions = this.levelConfig.starConditions;
    
    for (const condition of conditions) {
      const passed = this.checkCondition(condition, heroTeam);
      
      details.push({
        star: condition.star,
        condition: condition.description,
        passed,
        value: this.getConditionValue(condition)
      });
      
      if (passed) {
        earnedStars = Math.max(earnedStars, condition.star);
      }
    }
    
    return {
      stars: earnedStars,
      details,
      maxPossibleStars: this.getMaxStars()
    };
  }
  
  // 检查单个条件
  private checkCondition(condition: StarConditionConfig, team: CombatUnit[]): boolean {
    switch (condition.conditionType) {
      case ConditionType.WIN:
        return true;
      
      case ConditionType.TURN_LIMIT:
        const maxTurns = condition.params.maxTurns;
        return this.statistics.totalTurns <= maxTurns;
      
      case ConditionType.HP_REMAIN:
        const minPercent = condition.params.minHpPercent || 0.5;
        // 计算平均血量百分比
        const avgHpPercent = team.reduce((sum, hero) => {
          return sum + hero.currentHp / hero.maxHp;
        }, 0) / team.length;
        return avgHpPercent >= minPercent;
      
      case ConditionType.NO_DEATH:
        return this.statistics.heroesLost === 0;
      
      case ConditionType.SPECIFIC_KILL:
        // 检查特定敌人是否被击杀
        const targetId = condition.params.enemyId;
        return this.isEnemyKilled(targetId);
      
      case ConditionType.TIME_LIMIT:
        const maxTime = condition.params.maxTime;
        return this.statistics.duration <= maxTime * 1000;
      
      case ConditionType.FATIGUE_LIMIT:
        const maxFatigue = condition.params.maxFatigue;
        return this.statistics.fatigueUsed <= maxFatigue;
      
      default:
        return false;
    }
  }
  
  // 获取条件值
  private getConditionValue(condition: StarConditionConfig): number {
    switch (condition.conditionType) {
      case ConditionType.TURN_LIMIT:
        return this.statistics.totalTurns;
      case ConditionType.HP_REMAIN:
        const avgHpPercent = this.getAverageHpPercent();
        return Math.round(avgHpPercent * 100);
      case ConditionType.NO_DEATH:
        return this.statistics.heroesLost;
      default:
        return 0;
    }
  }
  
  // 计算平均血量百分比
  private getAverageHpPercent(): number {
    // 需要传入team数据
    return 0.8; // 示例值
  }
}
```

---

## 六、掉落奖励计算

### 6.1 掉落配置

```typescript
// 掉落配置
interface DropConfig {
  dropId: string;
  
  // 掉落类型
  dropType: DropType;
  
  // 掉落池
  pools: DropPool[];
  
  // 掉落数量
  dropCount: {
    min: number;
    max: number;
    calculation: 'fixed' | 'random' | 'level_based';
  };
  
  // 掉落概率
  dropRate: {
    type: 'fixed' | 'percentage' | 'curve';
    value: number;
  };
  
  // 保底机制
  pity?: PityConfig;
}

// 掉落池
interface DropPool {
  poolId: string;
  poolType: 'normal' | 'rare' | 'epic' | 'legendary';
  weight: number;
  
  items: DropItem[];
  
  // 条件限制
  conditions?: {
    difficultyMin?: number;
    starMin?: number;
    levelMin?: number;
  };
}

// 掉落物品
interface DropItem {
  itemId: string;
  itemType: ItemType;
  weight: number;
  
  // 数量
  quantity: {
    min: number;
    max: number;
    calculation: 'fixed' | 'random' | 'hero_level';
  };
  
  // 稀有度加成
  rarityBonus?: {
    star1Multiply: number;
    star2Multiply: number;
    star3Multiply: number;
  };
}

// 保底配置
interface PityConfig {
  enabled: boolean;
  pityCount: number;           // 保底次数
  pityItem?: string;          // 保底物品
  pityType: 'guaranteed' | 'increased_rate';
  resetCondition: 'battle' | 'daily' | 'weekly';
}
```

### 6.2 掉落计算实现

```typescript
// 掉落计算器
class DropCalculator {
  private dropConfigs: Map<string, DropConfig>;
  private pityTracker: Map<string, PityTracker>;
  
  // 计算掉落
  async calculateDrop(
    levelId: string,
    stars: number,
    options?: DropOptions
  ): Promise<DropResult> {
    const levelConfig = await this.getLevelDropConfig(levelId);
    if (!levelConfig) {
      return { items: [], totalValue: 0 };
    }
    
    const drops: DroppedItem[] = [];
    
    // 1. 计算掉落数量
    const dropCount = this.calculateDropCount(levelConfig, stars);
    
    // 2. 从各掉落池抽取
    for (const pool of levelConfig.pools) {
      // 检查条件
      if (!this.checkPoolConditions(pool, stars)) {
        continue;
      }
      
      // 从池中抽取物品
      const poolDrops = this.drawFromPool(pool, dropCount);
      drops.push(...poolDrops);
    }
    
    // 3. 应用保底机制
    const finalDrops = this.applyPity(drops, levelConfig);
    
    // 4. 计算总价值
    const totalValue = this.calculateTotalValue(finalDrops);
    
    return {
      items: finalDrops,
      totalValue,
      breakdown: this.getDropBreakdown(finalDrops)
    };
  }
  
  // 从掉落池抽取
  private drawFromPool(pool: DropPool, count: number): DroppedItem[] {
    const drops: DroppedItem[] = [];
    const items = pool.items;
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    
    for (let i = 0; i < count; i++) {
      // 随机选择
      const roll = Math.random() * totalWeight;
      let currentWeight = 0;
      
      for (const item of items) {
        currentWeight += item.weight;
        if (roll <= currentWeight) {
          const quantity = this.calculateQuantity(item.quantity);
          drops.push({
            itemId: item.itemId,
            itemType: item.itemType,
            quantity,
            source: pool.poolId
          });
          break;
        }
      }
    }
    
    return drops;
  }
  
  // 应用保底
  private applyPity(drops: DroppedItem[], config: DropConfig): DroppedItem[] {
    if (!config.pity || !config.pity.enabled) {
      return drops;
    }
    
    const tracker = this.getOrCreatePityTracker(config.dropId);
    tracker.count++;
    
    // 检查保底
    if (tracker.count >= config.pity.pityCount) {
      // 触发保底
      if (config.pity.pityItem) {
        drops.push({
          itemId: config.pity.pityItem,
          itemType: 'material',
          quantity: 1,
          source: 'pity'
        });
      }
      
      // 重置计数器
      if (config.pity.resetCondition === 'battle') {
        tracker.count = 0;
      }
    }
    
    return drops;
  }
  
  // 计算掉落数量
  private calculateDropCount(config: DropConfig, stars: number): number {
    const { min, max, calculation } = config.dropCount;
    
    switch (calculation) {
      case 'fixed':
        return min;
      
      case 'random':
        return Math.floor(Math.random() * (max - min + 1)) + min;
      
      case 'level_based':
        // 基于星级增加
        const base = min;
        const bonus = (stars - 1) * (max - min) / 2;
        return Math.floor(Math.random() * (bonus + 1)) + base;
      
      default:
        return min;
    }
  }
  
  // 计算物品数量
  private calculateQuantity(quantityConfig: { min: number; max: number; calculation: string }): number {
    const { min, max, calculation } = quantityConfig;
    
    switch (calculation) {
      case 'fixed':
        return min;
      
      case 'random':
        return Math.floor(Math.random() * (max - min + 1)) + min;
      
      case 'hero_level':
        // 基于队伍平均等级
        const avgLevel = this.getAverageHeroLevel();
        return Math.floor(Math.random() * (max - min + 1)) + min + Math.floor(avgLevel / 20);
      
      default:
        return min;
    }
  }
}
```

---

## 七、多波次战斗处理

### 7.1 波次管理架构

```typescript
// 波次配置
interface WaveConfig {
  waveId: number;
  waveName?: string;
  
  // 敌人配置
  enemies: WaveEnemyConfig[];
  
  // 进入条件
  enterCondition: WaveEnterCondition;
  
  // 特殊规则
  specialRules?: WaveSpecialRule[];
  
  // 波次转换效果
  transitionEffect?: TransitionEffect;
}

// 敌人波次配置
interface WaveEnemyConfig {
  enemyId: string;
  count: number;
  positions: Position[];
  
  // 生成参数
  spawnParams?: {
    staggered?: boolean;        // 分散生成
    delay?: number;            // 生成延迟
    condition?: string;        // 生成条件
  };
}

// 波次进入条件
interface WaveEnterCondition {
  type: 'immediate' | 'after_kill' | 'after_turn' | 'after_delay' | 'scripted';
  
  // 条件参数
  params: {
    killPercent?: number;      // 击杀百分比触发
    turnNumber?: number;       // 第N回合触发
    delayMs?: number;          // 延迟时间
    eventId?: string;          // 事件ID
  };
}

// 波次管理器
class WaveManager {
  private currentWave: number;
  private waves: WaveConfig[];
  private spawnQueue: SpawnQueue[];
  
  // 初始化波次
  initialize(waves: WaveConfig[]): void {
    this.waves = waves;
    this.currentWave = 0;
    this.spawnQueue = [];
    
    // 生成初始波次敌人
    this.spawnCurrentWave();
  }
  
  // 检查波次转换
  checkWaveTransition(): WaveTransitionResult {
    if (this.currentWave >= this.waves.length) {
      return { shouldTransition: false, allWavesComplete: true };
    }
    
    const currentWaveConfig = this.waves[this.currentWave];
    const condition = currentWaveConfig.enterCondition;
    
    // 检查是否满足进入下一波的条件
    const conditionMet = this.evaluateCondition(condition);
    
    if (conditionMet) {
      return {
        shouldTransition: true,
        nextWave: this.currentWave + 1,
        transitionEffect: currentWaveConfig.transitionEffect
      };
    }
    
    return { shouldTransition: false };
  }
  
  // 执行波次转换
  async transitionToNextWave(): Promise<void> {
    const result = this.checkWaveTransition();
    if (!result.shouldTransition) return;
    
    // 播放转换特效
    if (result.transitionEffect) {
      await this.playTransitionEffect(result.transitionEffect);
    }
    
    // 更新当前波次
    this.currentWave = result.nextWave;
    
    // 生成新波次敌人
    this.spawnCurrentWave();
    
    // 触发波次变化事件
    this.eventSystem.emit('onWaveChange', {
      waveNumber: this.currentWave,
      waveConfig: this.waves[this.currentWave]
    });
  }
  
  // 生成波次敌人
  private spawnCurrentWave(): void {
    const waveConfig = this.waves[this.currentWave];
    
    for (const enemyConfig of waveConfig.enemies) {
      for (let i = 0; i < enemyConfig.count; i++) {
        const position = enemyConfig.positions[i] || this.getDefaultPosition();
        
        // 创建敌人实例
        const enemy = this.createEnemyInstance(enemyConfig.enemyId, position);
        
        // 如果是分散生成，添加到队列
        if (enemyConfig.spawnParams?.staggered) {
          this.spawnQueue.push({
            enemy,
            delay: enemyConfig.spawnParams.delay * i
          });
        } else {
          this.battleContext.addEnemy(enemy);
        }
      }
    }
    
    // 处理分散生成的敌人
    this.processSpawnQueue();
  }
  
  // 处理生成队列
  private async processSpawnQueue(): Promise<void> {
    for (const spawn of this.spawnQueue) {
      await this.delay(spawn.delay);
      this.battleContext.addEnemy(spawn.enemy);
      this.eventSystem.emit('onEnemySpawn', { enemy: spawn.enemy });
    }
    this.spawnQueue = [];
  }
  
  // 评估进入条件
  private evaluateCondition(condition: WaveEnterCondition): boolean {
    switch (condition.type) {
      case 'immediate':
        return true;
      
      case 'after_kill':
        const killPercent = this.calculateKillPercent();
        return killPercent >= (condition.params.killPercent || 1);
      
      case 'after_turn':
        return this.battleContext.turnNumber >= (condition.params.turnNumber || 0);
      
      case 'after_delay':
        return this.battleContext.battleTime >= (condition.params.delayMs || 0);
      
      case 'scripted':
        // 脚本触发
        return this.scriptManager.evaluate(condition.params.eventId || '');
      
      default:
        return false;
    }
  }
}
```

---

## 八、战斗失败处理

### 8.1 失败条件定义

```typescript
// 失败条件类型
enum LoseConditionType {
  ALL_HEROES_DEAD = 'all_heroes_dead',    // 英雄全灭
  TURN_EXCEEDED = 'turn_exceeded',        // 回合耗尽
  TIME_EXCEEDED = 'time_exceeded',        // 时间耗尽
  FATIGUE_ZERO = 'fatigue_zero',          // 疲劳耗尽
  PLAYER_SURRENDER = 'player_surrender',  // 主动投降
  ESCAPE_FAILED = 'escape_failed',        // 逃跑失败
  CONDITION_FAILED = 'condition_failed',  // 特殊条件失败
}

// 失败处理配置
interface LoseHandlingConfig {
  condition: LoseConditionType;
  
  // 失败惩罚
  penalties: {
    fatigueCost: number;           // 疲劳惩罚
    dropItems?: boolean;           // 是否掉落物品
    heroInjury?: InjuryConfig;    // 英雄受伤配置
    progressPenalty?: number;      // 进度惩罚
  };
  
  // UI展示
  ui: {
    showResult: boolean;
    showRetry: boolean;
    showStrategy: boolean;
    showHint: boolean;
  };
  
  // 后续处理
  nextActions: {
    canRetry: boolean;
    retryCost?: RetryCostConfig;
    goToMenu?: boolean;
    autoRevive?: boolean;
  };
}

// 失败处理配置示例
const LOSE_HANDLING_CONFIGS: Record<LoseConditionType, LoseHandlingConfig> = {
  [LoseConditionType.ALL_HEROES_DEAD]: {
    condition: LoseConditionType.ALL_HEROES_DEAD,
    penalties: {
      fatigueCost: 20,
      heroInjury: {
        hpReducePercent: 0.3,
        requireHeal: true
      }
    },
    ui: {
      showResult: true,
      showRetry: true,
      showStrategy: true,
      showHint: true
    },
    nextActions: {
      canRetry: true,
      retryCost: { type: 'fatigue', amount: 10 }
    }
  },
  
  [LoseConditionType.TURN_EXCEEDED]: {
    condition: LoseConditionType.TURN_EXCEEDED,
    penalties: {
      fatigueCost: 15
    },
    ui: {
      showResult: true,
      showRetry: true,
      showStrategy: false,
      showHint: true
    },
    nextActions: {
      canRetry: true,
      retryCost: { type: 'fatigue', amount: 5 }
    }
  }
};
```

### 8.2 失败处理流程

```typescript
// 失败处理器
class LoseHandler {
  // 处理战斗失败
  async handleLose(
    condition: LoseConditionType,
    context: BattleContext
  ): Promise<LoseResult> {
    // 1. 获取失败处理配置
    const config = LOSE_HANDLING_CONFIGS[condition];
    
    // 2. 执行惩罚
    const penalties = await this.applyPenalties(config.penalties);
    
    // 3. 收集失败统计
    const statistics = this.collectLoseStatistics(context);
    
    // 4. 生成失败结果
    const result: LoseResult = {
      condition,
      penalties,
      statistics,
      retryInfo: this.getRetryInfo(config),
      hint: await this.generateHint(context)
    };
    
    // 5. 触发失败事件
    this.eventSystem.emit('onBattleLose', result);
    
    return result;
  }
  
  // 应用惩罚
  private async applyPenalties(penalties: LoseHandlingConfig['penalties']): Promise<PenaltyResult> {
    const result: PenaltyResult = {
      fatigueLost: penalties.fatigueCost,
      itemsLost: [],
      heroesInjured: []
    };
    
    // 扣除疲劳
    this.player.reduceFatigue(penalties.fatigueCost);
    
    // 物品掉落
    if (penalties.dropItems) {
      result.itemsLost = await this.dropRandomItems();
    }
    
    // 英雄受伤
    if (penalties.heroInjury) {
      result.heroesInjured = await this.applyHeroInjury(penalties.heroInjury);
    }
    
    return result;
  }
  
  // 获取重试信息
  private getRetryInfo(config: LoseHandlingConfig): RetryInfo {
    return {
      available: config.nextActions.canRetry,
      cost: config.nextActions.retryCost,
      currentFatigue: this.player.fatigue,
      canAffordRetry: this.canAffordRetry(config.nextActions.retryCost)
    };
  }
  
  // 生成失败提示
  private async generateHint(context: BattleContext): Promise<string> {
    // 基于失败原因生成提示
    const hints: string[] = [];
    
    // 检查是否是伤害不足
    if (this.isDamageInsufficient(context)) {
      hints.push('建议提升攻击力或使用更高效的技能组合');
    }
    
    // 检查是否是治疗不足
    if (this.isHealingInsufficient(context)) {
      hints.push('建议带上治疗英雄或使用护盾技能');
    }
    
    // 检查是否是速度不足
    if (this.isSpeedInsufficient(context)) {
      hints.push('建议提升速度，抢先行动');
    }
    
    // 检查是否是控制不足
    if (this.isControlInsufficient(context)) {
      hints.push('建议带上控制型英雄，打断敌人技能');
    }
    
    return hints.join('\n') || '继续培养英雄后再次挑战';
  }
}
```

---

## 九、实现要点总结

### 9.1 核心功能清单

| 功能 | 实现要点 | 优先级 |
|------|----------|--------|
| 触发系统 | 多种触发类型和条件 | P0 |
| 参数传递 | 完整的参数验证和传递 | P0 |
| 结算系统 | 详细的统计和结算 | P0 |
| 星级评定 | 灵活的星级条件配置 | P0 |
| 掉落计算 | 掉落池、保底机制 | P1 |
| 波次管理 | 波次转换和敌人生成 | P1 |
| 失败处理 | 惩罚和重试机制 | P1 |

### 9.2 配置示例

```json
{
  "levelId": "LEVEL_1_3",
  "name": "前厅危机",
  "type": "elite",
  
  "waves": [
    {
      "waveId": 1,
      "enemies": [
        { "enemyId": "ELITE_001", "count": 1, "positions": [[5, 3]] }
      ],
      "enterCondition": { "type": "immediate" }
    },
    {
      "waveId": 2,
      "enemies": [
        { "enemyId": "ENEMY_002", "count": 3, "positions": [[3, 2], [5, 2], [7, 2]] }
      ],
      "enterCondition": { 
        "type": "after_kill", 
        "params": { "killPercent": 0.5 } 
      }
    }
  ],
  
  "starConditions": [
    { "star": 1, "condition": "win", "params": {} },
    { "star": 2, "condition": "turn_limit", "params": { "maxTurns": 20 } },
    { "star": 3, "condition": "hp_remain", "params": { "minHpPercent": 0.5 } }
  ],
  
  "rewards": {
    "baseExp": 300,
    "baseGold": 250,
    "drops": {
      "poolId": "ELITE_COMMON",
      "dropRate": 0.8,
      "minCount": 1,
      "maxCount": 3
    }
  }
}
```

---

*文档版本：v1.0 | 最后更新：2026-04-24*
