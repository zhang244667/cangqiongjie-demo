# 战斗便捷功能设计方案

> 版本：1.0
> 日期：2026年4月24日
> 游戏：《苍穹劫·摸金传人》
> 状态：深化设计文档

---

## 一、文档概述

### 1.1 目的与范围

本文档定义战斗便捷功能的完整设计方案，包括自动战斗逻辑设计、战斗速度系统、扫荡系统设计和战斗日志系统。本系统提升玩家战斗体验，减少重复操作。

### 1.2 设计原则

- **体验优先**：便捷功能不破坏游戏核心乐趣
- **策略保留**：自动战斗保留玩家决策空间
- **资源节约**：减少玩家时间消耗
- **反馈明确**：清晰的系统状态显示

---

## 二、自动战斗逻辑设计

### 2.1 自动战斗模式

```typescript
// 自动战斗模式
enum AutoBattleMode {
  OFF = 'off',                    // 关闭
  BASIC = 'basic',               // 基础自动（普攻）
  SEMI = 'semi',                 // 半自动（普攻+技能）
  FULL = 'full',                 // 全自动（完全自动）
}

// 自动战斗配置
interface AutoBattleConfig {
  mode: AutoBattleMode;
  
  // 技能自动释放
  skillUsage: {
    autoUltimate: boolean;        // 自动释放大招
    autoSkillThreshold: number;   // 技能释放阈值
    prioritySkills: string[];    // 优先释放的技能
    saveForBoss: boolean;        // Boss战保留怒气
  };
  
  // 目标选择
  targetSelection: {
    autoSelectTarget: boolean;    // 自动选择目标
    targetPriority: AutoTargetPriority[];
  };
  
  // 特殊行为
  specialBehavior: {
    healLowHp: boolean;          // 低血量自动治疗
    healThreshold: number;       // 治疗阈值
    useDefensiveSkills: boolean; // 使用防御技能
    useBuffSkills: boolean;     // 使用Buff技能
  };
  
  // 暂停条件
  pauseConditions: PauseCondition[];
}

// 自动目标优先级
interface AutoTargetPriority {
  condition: TargetCondition;
  priority: number;
  enabled: boolean;
}

// 暂停条件
interface PauseCondition {
  type: 'low_hp' | 'boss_phase' | 'elite_appear' | 'special_event';
  threshold: number;
  action: 'pause' | 'notify' | 'switch_mode';
}
```

### 2.2 自动战斗决策逻辑

```typescript
// 自动战斗AI
class AutoBattleAI {
  private config: AutoBattleConfig;
  private decisionCooldown: Map<string, number>;
  
  // 每回合决策
  async makeDecision(hero: CombatUnit): Promise<AutoDecision> {
    // 1. 检查暂停条件
    if (this.shouldPause(hero)) {
      return { action: 'pause', reason: 'pause_condition_met' };
    }
    
    // 2. 检查是否需要行动
    if (hero.isStunned() || hero.isDead()) {
      return { action: 'skip', reason: 'cannot_act' };
    }
    
    // 3. 评估技能使用
    const skillDecision = await this.evaluateSkillUsage(hero);
    if (skillDecision.shouldUse && this.config.skillUsage.autoUltimate) {
      return skillDecision;
    }
    
    // 4. 默认普攻
    const target = await this.selectAutoTarget(hero);
    return {
      action: 'attack',
      skill: null,
      target,
      reason: 'auto_attack'
    };
  }
  
  // 评估技能使用
  private async evaluateSkillUsage(hero: CombatUnit): Promise<AutoDecision> {
    // 检查怒气是否足够
    if (hero.currentAnger < 100) {
      return { action: 'none', reason: 'not_enough_anger' };
    }
    
    // 获取可用技能
    const availableSkills = hero.getSkills().filter(s => 
      s.currentCooldown === 0 && hero.currentAnger >= s.angerCost
    );
    
    // 评估每个技能
    const evaluations = await Promise.all(
      availableSkills.map(skill => this.evaluateSkill(skill, hero))
    );
    
    // 按价值排序
    evaluations.sort((a, b) => b.value - a.value);
    
    if (evaluations.length === 0 || evaluations[0].value < 0.5) {
      return { action: 'none', reason: 'no_good_skill' };
    }
    
    const bestSkill = evaluations[0];
    
    // 检查Boss保留怒气
    if (this.config.skillUsage.saveForBoss && this.isBossWave()) {
      return { action: 'none', reason: 'saving_for_boss' };
    }
    
    return {
      action: 'skill',
      skill: bestSkill.skill,
      target: bestSkill.target,
      value: bestSkill.value,
      reason: `skill_${bestSkill.skill.skillId}`
    };
  }
  
  // 评估单个技能
  private async evaluateSkill(skill: SkillConfig, hero: CombatUnit): Promise<SkillEvaluation> {
    let value = 0;
    const targets = this.selectSkillTargets(hero, skill);
    
    // 1. 伤害价值
    if (skill.damageCoeff) {
      const damage = this.calculateSkillDamage(hero, skill, targets);
      value += damage * 1.0;
    }
    
    // 2. 治疗价值
    if (this.isHealSkill(skill)) {
      const healValue = this.calculateHealValue(hero, skill);
      const lowHpAllies = hero.allies.filter(a => 
        a.currentHp / a.maxHp < this.config.specialBehavior.healThreshold
      ).length;
      value += healValue * lowHpAllies * 2.0;
    }
    
    // 3. 控制价值
    if (this.isControlSkill(skill)) {
      value += this.evaluateControlValue(skill) * 1.5;
    }
    
    // 4. Buff价值
    if (this.isBuffSkill(skill)) {
      value += this.evaluateBuffValue(hero, skill) * 1.2;
    }
    
    // 5. 优先级调整
    if (this.isPrioritySkill(skill)) {
      value *= 1.5;
    }
    
    return {
      skill,
      target: targets[0],
      value
    };
  }
  
  // 选择自动目标
  private async selectAutoTarget(hero: CombatUnit): Promise<CombatUnit> {
    if (!this.config.targetSelection.autoSelectTarget) {
      // 返回上次选择的目标或随机
      return this.lastTarget || this.selectRandomTarget(hero);
    }
    
    // 按优先级选择
    const enemies = hero.enemies.filter(e => !e.isDead());
    
    for (const priority of this.config.targetSelection.targetPriority) {
      if (!priority.enabled) continue;
      
      const selected = this.findTargetByPriority(hero, enemies, priority);
      if (selected) return selected;
    }
    
    // 默认选择最低血量
    return enemies.reduce((lowest, enemy) => 
      enemy.currentHp < lowest.currentHp ? enemy : lowest
    );
  }
  
  // 按优先级查找目标
  private findTargetByPriority(
    hero: CombatUnit,
    enemies: CombatUnit[],
    priority: AutoTargetPriority
  ): CombatUnit | null {
    switch (priority.condition) {
      case 'lowest_hp':
        return enemies.reduce((lowest, enemy) => 
          enemy.currentHp < lowest.currentHp ? enemy : lowest
        );
      
      case 'lowest_def':
        return enemies.reduce((lowest, enemy) => 
          enemy.defense < lowest.defense ? enemy : lowest
        );
      
      case 'can_kill':
        return enemies.find(e => this.canKill(e, hero.attack));
      
      case 'has_buff':
        return enemies.find(e => e.hasBuff(priority.condition));
      
      case 'elite':
        return enemies.find(e => e.isElite);
      
      case 'boss':
        return enemies.find(e => e.isBoss);
      
      default:
        return null;
    }
  }
  
  // 检查是否暂停
  private shouldPause(hero: CombatUnit): boolean {
    for (const condition of this.config.pauseConditions) {
      if (!condition.enabled) continue;
      
      switch (condition.type) {
        case 'low_hp':
          if (hero.currentHp / hero.maxHp < condition.threshold) {
            return true;
          }
          break;
        
        case 'boss_phase':
          if (this.isBossPhaseChange()) {
            return true;
          }
          break;
      }
    }
    return false;
  }
}
```

### 2.3 自动战斗UI

```typescript
// 自动战斗UI配置
interface AutoBattleUIConfig {
  // 模式切换按钮
  modeButton: {
    position: 'bottom_right';
    icon: 'auto_icon';
    showCurrentMode: boolean;
    cycleModes: AutoBattleMode[];
  };
  
  // 模式指示器
  modeIndicator: {
    show: boolean;
    position: 'top_center';
    styles: Record<AutoBattleMode, ModeStyle>;
  };
  
  // 暂停提示
  pausePrompt: {
    show: boolean;
    autoResumeDelay: number;
    buttons: ('resume' | 'settings' | 'exit')[];
  };
  
  // 技能释放提示
  skillIndicator: {
    showTargeting: boolean;
    showPrediction: boolean;
    targetingStyle: 'outline' | 'highlight';
  };
}

// 自动战斗UI样式
const AUTO_BATTLE_UI_STYLES = {
  [AutoBattleMode.OFF]: {
    color: '#888888',
    label: '手动',
    icon: 'manual_icon'
  },
  [AutoBattleMode.BASIC]: {
    color: '#4CAF50',
    label: '自动(普攻)',
    icon: 'auto_basic_icon'
  },
  [AutoBattleMode.SEMI]: {
    color: '#2196F3',
    label: '自动(技能)',
    icon: 'auto_semi_icon'
  },
  [AutoBattleMode.FULL]: {
    color: '#FF9800',
    label: '全自动',
    icon: 'auto_full_icon'
  }
};
```

---

## 三、战斗速度系统

### 3.1 速度等级定义

```typescript
// 战斗速度等级
enum BattleSpeed {
  NORMAL = 1,      // 1倍速
  FAST = 2,        // 2倍速
  ULTRA = 3,       // 3倍速（跳过动画）
}

// 速度配置
interface BattleSpeedConfig {
  speed: BattleSpeed;
  
  // 动画调整
  animationTimeScale: number;
  skipAnimations: boolean;
  
  // 特效调整
  effectsEnabled: boolean;
  particleLimit?: number;
  
  // 音效调整
  soundEnabled: boolean;
  soundVolume: number;
  
  // 延迟调整
  actionDelay: number;          // 行动间隔
  resultDisplayTime: number;    // 结果显示时间
  
  // 允许的操作
  allowSkillTargeting: boolean;
  allowPause: boolean;
  allowAutoMode: boolean;
}

// 各速度配置
const BATTLE_SPEED_CONFIGS: Record<BattleSpeed, BattleSpeedConfig> = {
  [BattleSpeed.NORMAL]: {
    speed: BattleSpeed.NORMAL,
    animationTimeScale: 1.0,
    skipAnimations: false,
    effectsEnabled: true,
    soundEnabled: true,
    soundVolume: 1.0,
    actionDelay: 500,
    resultDisplayTime: 1000,
    allowSkillTargeting: true,
    allowPause: true,
    allowAutoMode: true
  },
  
  [BattleSpeed.FAST]: {
    speed: BattleSpeed.FAST,
    animationTimeScale: 1.5,
    skipAnimations: false,
    effectsEnabled: true,
    particleLimit: 50,
    soundEnabled: true,
    soundVolume: 0.7,
    actionDelay: 200,
    resultDisplayTime: 400,
    allowSkillTargeting: true,
    allowPause: true,
    allowAutoMode: true
  },
  
  [BattleSpeed.ULTRA]: {
    speed: BattleSpeed.ULTRA,
    animationTimeScale: 0,
    skipAnimations: true,
    effectsEnabled: false,
    particleLimit: 0,
    soundEnabled: false,
    soundVolume: 0,
    actionDelay: 50,
    resultDisplayTime: 100,
    allowSkillTargeting: false,
    allowPause: false,
    allowAutoMode: true
  }
};
```

### 3.2 速度切换逻辑

```typescript
// 速度管理器
class BattleSpeedManager {
  private currentSpeed: BattleSpeed;
  private config: BattleSpeedConfig;
  
  constructor() {
    this.currentSpeed = BattleSpeed.NORMAL;
    this.config = BATTLE_SPEED_CONFIGS[this.currentSpeed];
  }
  
  // 切换速度
  switchSpeed(newSpeed: BattleSpeed): SpeedSwitchResult {
    // 检查是否允许切换
    if (!this.canSwitchTo(newSpeed)) {
      return { success: false, reason: 'not_allowed' };
    }
    
    const oldSpeed = this.currentSpeed;
    this.currentSpeed = newSpeed;
    this.config = BATTLE_SPEED_CONFIGS[newSpeed];
    
    // 应用速度配置
    this.applySpeedConfig();
    
    return {
      success: true,
      oldSpeed,
      newSpeed,
      config: this.config
    };
  }
  
  // 检查是否允许切换
  private canSwitchTo(speed: BattleSpeed): boolean {
    // 某些状态下不允许切换
    if (this.isInCutscene()) {
      return false;
    }
    
    if (this.isInBossCinematic() && speed !== BattleSpeed.NORMAL) {
      return false;
    }
    
    // 检查速度限制
    if (this.isSpeedRestricted() && speed > BattleSpeed.FAST) {
      return false;
    }
    
    return true;
  }
  
  // 应用速度配置
  private applySpeedConfig(): void {
    // 更新动画时间
    this.updateAnimationTimeScale(this.config.animationTimeScale);
    
    // 更新特效
    this.updateEffects(this.config.effectsEnabled, this.config.particleLimit);
    
    // 更新音效
    this.updateSound(this.config.soundEnabled, this.config.soundVolume);
    
    // 更新延迟
    this.updateDelays(this.config.actionDelay, this.config.resultDisplayTime);
    
    // 更新允许的操作
    this.updateAllowedOperations();
  }
  
  // 获取当前速度配置
  getConfig(): BattleSpeedConfig {
    return { ...this.config };
  }
  
  // 加速下一个行动
  accelerateNextAction(): void {
    this.nextActionOverride = true;
  }
  
  // 跳过当前动画
  skipCurrentAnimation(): void {
    if (this.config.skipAnimations) {
      this.animationPlayer.skip();
    }
  }
}
```

### 3.3 速度UI设计

```typescript
// 速度切换UI
interface SpeedUIConfig {
  // 速度按钮
  speedButton: {
    position: 'bottom_right';
    iconType: 'arrow' | 'number';
    showCurrentSpeed: boolean;
    cycleOnClick: boolean;
  };
  
  // 速度指示器
  speedIndicator: {
    position: 'top_right';
    showSpeedLevel: boolean;
    showProgress: boolean;
  };
  
  // 快捷键
  shortcuts: {
    speedUp: '>',
    speedDown: '<',
    toggleUltra: 'Tab'
  };
  
  // 提示配置
  tooltips: Record<BattleSpeed, string>;
}

// 速度按钮样式
const SPEED_BUTTON_STYLES = {
  [BattleSpeed.NORMAL]: { color: '#888', label: '1x' },
  [BattleSpeed.FAST]: { color: '#4CAF50', label: '2x' },
  [BattleSpeed.ULTRA]: { color: '#FF9800', label: '3x' }
};
```

---

## 四、扫荡系统设计

### 4.1 扫荡条件

```typescript
// 扫荡条件配置
interface SweepCondition {
  // 解锁条件
  unlock: {
    type: 'level_complete' | 'star_count' | 'daily_limit';
    levelId?: string;            // 需要通关的关卡
    starRequired?: number;       // 需要的最少星数
    dailyCount?: number;         // 每日扫荡次数限制
  };
  
  // 可扫荡关卡
  sweepableLevels: {
    levelId: string;
    minStars: number;           // 最少星数要求
    minDifficulty?: number;      // 最低难度要求
  }[];
  
  // 扫荡限制
  limits: {
    maxSweepCount: number;      // 单次最大扫荡次数
    dailyLimit: number;         // 每日限制次数
    requireStamina: boolean;     // 是否消耗体力
    staminaCost: number;         // 体力消耗
  };
  
  // 奖励配置
  rewards: {
    expMultiplier: number;       // 经验倍率
    goldMultiplier: number;     // 金币倍率
    dropRateMultiplier: number; // 掉落倍率
    guaranteedDrops: boolean;   // 保底掉落
  };
}

// 扫荡条件示例
const SWEEP_CONDITIONS: SweepCondition = {
  unlock: {
    type: 'level_complete',
    levelId: 'LEVEL_1_4'
  },
  
  sweepableLevels: [
    { levelId: 'LEVEL_1_1', minStars: 1 },
    { levelId: 'LEVEL_1_2', minStars: 1 },
    { levelId: 'LEVEL_1_3', minStars: 1 },
    { levelId: 'LEVEL_2_1', minStars: 2 },
    // ... 更多关卡
  ],
  
  limits: {
    maxSweepCount: 10,
    dailyLimit: 50,
    requireStamina: true,
    staminaCost: 10
  },
  
  rewards: {
    expMultiplier: 1.5,
    goldMultiplier: 1.5,
    dropRateMultiplier: 1.0,
    guaranteedDrops: true
  }
};
```

### 4.2 扫荡流程

```typescript
// 扫荡管理器
class SweepManager {
  private dailyUsage: Map<string, number>;
  private cooldown: number = 0;
  
  // 检查扫荡条件
  async checkSweepCondition(levelId: string, team: HeroData[]): Promise<SweepCheckResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 1. 检查关卡是否可扫荡
    const config = SWEEP_CONDITIONS;
    const levelConfig = config.sweepableLevels.find(l => l.levelId === levelId);
    if (!levelConfig) {
      return { canSweep: false, reason: 'level_not_sweepable' };
    }
    
    // 2. 检查星级要求
    const playerStars = await this.getLevelStars(levelId);
    if (playerStars < levelConfig.minStars) {
      return { 
        canSweep: false, 
        reason: 'insufficient_stars',
        required: levelConfig.minStars,
        current: playerStars
      };
    }
    
    // 3. 检查体力
    const staminaRequired = config.limits.staminaCost;
    if (this.player.stamina < staminaRequired) {
      return { 
        canSweep: false, 
        reason: 'insufficient_stamina',
        required: staminaRequired,
        current: this.player.stamina
      };
    }
    
    // 4. 检查每日次数
    const todayCount = this.getDailySweepCount(levelId);
    if (todayCount >= config.limits.dailyLimit) {
      return { 
        canSweep: false, 
        reason: 'daily_limit_reached',
        limit: config.limits.dailyLimit,
        remaining: 0
      };
    }
    
    // 5. 检查队伍状态
    for (const hero of team) {
      if (hero.currentHp < hero.maxHp * 0.5) {
        warnings.push(`${hero.name} 血量低于50%`);
      }
    }
    
    return {
      canSweep: true,
      warnings,
      cost: staminaRequired,
      remainingDaily: config.limits.dailyLimit - todayCount
    };
  }
  
  // 执行扫荡
  async executeSweep(
    levelId: string,
    team: HeroData[],
    count: number
  ): Promise<SweepResult> {
    // 验证次数
    const maxCount = Math.min(count, SWEEP_CONDITIONS.limits.maxSweepCount);
    const remainingStamina = this.player.stamina;
    const possibleCount = Math.floor(remainingStamina / SWEEP_CONDITIONS.limits.staminaCost);
    const actualCount = Math.min(maxCount, possibleCount);
    
    if (actualCount === 0) {
      return { success: false, reason: 'no_possible_sweep' };
    }
    
    // 预计算奖励
    const singleBattleRewards = await this.calculateBattleRewards(levelId, team, 3);
    const totalRewards = this.multiplyRewards(singleBattleRewards, actualCount);
    
    // 显示扫荡预览
    await this.showSweepPreview(levelId, actualCount, totalRewards);
    
    // 确认扫荡
    const confirmed = await this.waitForConfirmation();
    if (!confirmed) {
      return { success: false, reason: 'canceled_by_user' };
    }
    
    // 消耗体力
    const totalStaminaCost = actualCount * SWEEP_CONDITIONS.limits.staminaCost;
    this.player.consumeStamina(totalStaminaCost);
    
    // 更新使用次数
    this.incrementDailySweepCount(levelId, actualCount);
    
    // 执行扫荡（异步计算结果）
    const sweepResults = await this.simulateBattleResults(levelId, team, actualCount);
    
    // 发放奖励
    await this.distributeRewards(totalRewards);
    
    return {
      success: true,
      sweepCount: actualCount,
      results: sweepResults,
      rewards: totalRewards,
      newStamina: this.player.stamina,
      remainingDaily: SWEEP_CONDITIONS.limits.dailyLimit - this.getDailySweepCount(levelId)
    };
  }
  
  // 模拟战斗结果（快速计算）
  private async simulateBattleResults(
    levelId: string,
    team: HeroData[],
    count: number
  ): Promise<SweepBattleResult[]> {
    const results: SweepBattleResult[] = [];
    
    // 预加载战斗数据
    const levelConfig = await this.getLevelConfig(levelId);
    const difficulty = levelConfig.difficulty;
    
    // 计算队伍战斗力
    const teamPower = this.calculateTeamPower(team);
    
    // 计算胜率
    const winRate = this.calculateWinRate(teamPower, difficulty);
    
    // 生成结果
    for (let i = 0; i < count; i++) {
      const isWin = Math.random() < winRate;
      
      if (isWin) {
        results.push({
          battleNumber: i + 1,
          result: 'win',
          stars: this.randomStars(),
          rewards: this.calculateBattleRewards(levelId, team, this.randomStars())
        });
      } else {
        results.push({
          battleNumber: i + 1,
          result: 'fail',
          stars: 0,
          rewards: this.getFailRewards()
        });
      }
    }
    
    return results;
  }
  
  // 计算胜率
  private calculateWinRate(teamPower: number, difficulty: number): number {
    // 战斗力与难度比较
    const ratio = teamPower / difficulty;
    
    if (ratio >= 2.0) return 0.99;
    if (ratio >= 1.5) return 0.95;
    if (ratio >= 1.2) return 0.90;
    if (ratio >= 1.0) return 0.80;
    if (ratio >= 0.8) return 0.60;
    if (ratio >= 0.6) return 0.30;
    
    return 0.10;
  }
}
```

### 4.3 扫荡UI设计

```typescript
// 扫荡UI配置
interface SweepUIConfig {
  // 扫荡按钮
  sweepButton: {
    position: 'level_detail_panel';
    icon: 'sweep_icon';
    showCondition: boolean;
    showCost: boolean;
  };
  
  // 扫荡面板
  sweepPanel: {
    showTeam: boolean;
    showCost: boolean;
    showRewards: boolean;
    showResults: boolean;
    
    // 次数选择
    countSelector: {
      type: 'slider' | 'buttons';
      maxSelectable: number;
      quickSelect: number[];
    };
  };
  
  // 结果展示
  resultPanel: {
    showEachResult: boolean;      // 显示每次结果
    aggregateRewards: boolean;   // 汇总奖励
    showAnimation: boolean;        // 显示动画
    speed: 'fast' | 'instant';
  };
  
  // 状态显示
  statusDisplay: {
    showDailyRemaining: boolean;
    showStamina: boolean;
    showUnlockProgress: boolean;
  };
}
```

---

## 五、战斗日志系统

### 5.1 日志类型定义

```typescript
// 战斗日志类型
enum BattleLogType {
  // 伤害日志
  DAMAGE_DEALT = 'damage_dealt',         // 造成伤害
  DAMAGE_TAKEN = 'damage_taken',         // 受到伤害
  CRITICAL_HIT = 'critical_hit',         // 暴击
  MISS = 'miss',                         // 未命中
  DODGE = 'dodge',                       // 闪避
  
  // 治疗日志
  HEAL_DONE = 'heal_done',               // 治疗他人
  HEAL_RECEIVED = 'heal_received',       // 受到治疗
  HOT_TICK = 'hot_tick',                 // 持续治疗Tick
  
  // 技能日志
  SKILL_USED = 'skill_used',             // 使用技能
  SKILL_HIT = 'skill_hit',               // 技能命中
  SKILL_MISSED = 'skill_missed',         // 技能未命中
  
  // Buff日志
  BUFF_ADDED = 'buff_added',             // 添加Buff
  BUFF_REMOVED = 'buff_removed',         // 移除Buff
  BUFF_EXPIRED = 'buff_expired',         // Buff到期
  DOT_TICK = 'dot_tick',                 // DOT伤害Tick
  
  // 状态日志
  UNIT_DIED = 'unit_died',               // 单位死亡
  UNIT_REVIVED = 'unit_revived',         // 单位复活
  BATTLE_START = 'battle_start',         // 战斗开始
  BATTLE_END = 'battle_end',             // 战斗结束
  WAVE_CHANGE = 'wave_change',           // 波次变化
  
  // 怒气日志
  ANGER_GAIN = 'anger_gain',            // 怒气获取
  ANGER_SPENT = 'anger_spent',           // 怒气消耗
  ULTIMATE_READY = 'ultimate_ready',     // 大招就绪
}

// 日志条目
interface BattleLogEntry {
  id: string;
  type: BattleLogType;
  timestamp: number;
  turnNumber: number;
  
  // 涉及单位
  sourceId?: string;       // 来源单位
  targetId?: string;       // 目标单位
  
  // 数值数据
  value?: number;
  valueType?: 'damage' | 'heal' | 'buff' | 'anger';
  
  // 附加信息
  skillId?: string;
  buffId?: string;
  isCritical?: boolean;
  isLethal?: boolean;
  
  // 显示配置
  displayConfig: {
    showInLog: boolean;
    showInCombat: boolean;
    priority: number;
    color: string;
  };
}
```

### 5.2 日志收集器

```typescript
// 战斗日志收集器
class BattleLogCollector {
  private logs: BattleLogEntry[] = [];
  private maxLogs: number = 1000;
  private subscribers: LogSubscriber[] = [];
  
  // 添加日志
  addLog(entry: Omit<BattleLogEntry, 'id' | 'timestamp'>): BattleLogEntry {
    const fullEntry: BattleLogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: Date.now()
    };
    
    // 添加到日志数组
    this.logs.push(fullEntry);
    
    // 保持日志数量限制
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // 通知订阅者
    this.notifySubscribers(fullEntry);
    
    // 触发事件
    this.eventSystem.emit('onLogAdded', fullEntry);
    
    return fullEntry;
  }
  
  // 记录伤害
  logDamage(
    source: CombatUnit,
    target: CombatUnit,
    damage: number,
    isCrit: boolean,
    skillId?: string
  ): void {
    this.addLog({
      type: isCrit ? BattleLogType.CRITICAL_HIT : BattleLogType.DAMAGE_DEALT,
      turnNumber: this.battleContext.turnNumber,
      sourceId: source.id,
      targetId: target.id,
      value: damage,
      valueType: 'damage',
      skillId,
      isCritical: isCrit,
      displayConfig: {
        showInLog: true,
        showInCombat: true,
        priority: isCrit ? 100 : 50,
        color: isCrit ? '#FFD700' : '#FFFFFF'
      }
    });
  }
  
  // 记录治疗
  logHeal(
    source: CombatUnit,
    target: CombatUnit,
    amount: number,
    skillId?: string
  ): void {
    this.addLog({
      type: target.id === source.id ? BattleLogType.HEAL_RECEIVED : BattleLogType.HEAL_DONE,
      turnNumber: this.battleContext.turnNumber,
      sourceId: source.id,
      targetId: target.id,
      value: amount,
      valueType: 'heal',
      skillId,
      displayConfig: {
        showInLog: true,
        showInCombat: true,
        priority: 60,
        color: '#4CAF50'
      }
    });
  }
  
  // 记录Buff变化
  logBuffChange(
    target: CombatUnit,
    buffId: string,
    action: 'added' | 'removed' | 'expired'
  ): void {
    const typeMap = {
      added: BattleLogType.BUFF_ADDED,
      removed: BattleLogType.BUFF_REMOVED,
      expired: BattleLogType.BUFF_EXPIRED
    };
    
    this.addLog({
      type: typeMap[action],
      turnNumber: this.battleContext.turnNumber,
      targetId: target.id,
      buffId,
      displayConfig: {
        showInLog: action !== 'expired',
        showInCombat: false,
        priority: 20,
        color: '#2196F3'
      }
    });
  }
  
  // 记录单位死亡
  logUnitDied(unit: CombatUnit, killer?: CombatUnit): void {
    this.addLog({
      type: BattleLogType.UNIT_DIED,
      turnNumber: this.battleContext.turnNumber,
      sourceId: killer?.id,
      targetId: unit.id,
      isLethal: true,
      displayConfig: {
        showInLog: true,
        showInCombat: true,
        priority: 150,
        color: '#F44336'
      }
    });
  }
  
  // 订阅日志
  subscribe(subscriber: LogSubscriber): void {
    this.subscribers.push(subscriber);
  }
  
  // 取消订阅
  unsubscribe(subscriber: LogSubscriber): void {
    const index = this.subscribers.indexOf(subscriber);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }
  
  // 通知订阅者
  private notifySubscribers(entry: BattleLogEntry): void {
    for (const subscriber of this.subscribers) {
      if (subscriber.filter && !subscriber.filter(entry)) {
        continue;
      }
      subscriber.callback(entry);
    }
  }
  
  // 获取日志
  getLogs(filter?: LogFilter): BattleLogEntry[] {
    if (!filter) return [...this.logs];
    
    return this.logs.filter(log => {
      if (filter.types && !filter.types.includes(log.type)) return false;
      if (filter.sourceId && log.sourceId !== filter.sourceId) return false;
      if (filter.targetId && log.targetId !== filter.targetId) return false;
      if (filter.turnNumber && log.turnNumber !== filter.turnNumber) return false;
      return true;
    });
  }
  
  // 导出日志
  exportLogs(format: 'json' | 'text'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }
    
    return this.logs.map(log => {
      const time = `${log.turnNumber}T`;
      return `[${time}] ${log.type}: ${log.sourceId} -> ${log.targetId} = ${log.value}`;
    }).join('\n');
  }
}

// 日志订阅者
interface LogSubscriber {
  id: string;
  filter?: (log: BattleLogEntry) => boolean;
  callback: (log: BattleLogEntry) => void;
}

// 日志过滤器
interface LogFilter {
  types?: BattleLogType[];
  sourceId?: string;
  targetId?: string;
  turnNumber?: number;
  since?: number;
}
```

### 5.3 日志UI显示

```typescript
// 战斗日志UI配置
interface BattleLogUIConfig {
  // 显示配置
  display: {
    maxVisible: number;            // 最大可见条目
    autoScroll: boolean;           // 自动滚动
    showTimestamps: boolean;       // 显示时间戳
    compactMode: boolean;          // 紧凑模式
  };
  
  // 过滤配置
  filter: {
    showDamage: boolean;
    showHeal: boolean;
    showBuff: boolean;
    showSkill: boolean;
    showSystem: boolean;
    minPriority: number;           // 最低显示优先级
  };
  
  // 格式化配置
  format: {
    showIcons: boolean;
    showColors: boolean;
    abbreviate: boolean;
    maxTextLength: number;
  };
  
  // 位置配置
  position: {
    location: 'left' | 'right';
    collapsible: boolean;
    defaultVisible: boolean;
  };
}

// 日志格式化
const LOG_FORMATS: Record<BattleLogType, LogFormat> = {
  [BattleLogType.DAMAGE_DEALT]: {
    template: '{source} 对 {target} 造成 {value} 伤害',
    icon: 'sword',
    color: '#FFFFFF'
  },
  
  [BattleLogType.CRITICAL_HIT]: {
    template: '{source} 对 {target} 暴击造成 {value} 伤害!',
    icon: 'crit',
    color: '#FFD700'
  },
  
  [BattleLogType.HEAL_DONE]: {
    template: '{source} 治疗 {target} {value} HP',
    icon: 'heal',
    color: '#4CAF50'
  },
  
  [BattleLogType.BUFF_ADDED]: {
    template: '{target} 获得 {buff}',
    icon: 'buff',
    color: '#2196F3'
  },
  
  [BattleLogType.UNIT_DIED]: {
    template: '{target} 阵亡',
    icon: 'skull',
    color: '#F44336'
  }
};
```

---

## 六、实现要点总结

### 6.1 功能清单

| 功能 | 实现要点 | 优先级 |
|------|----------|--------|
| 自动战斗 | 多种模式、策略配置 | P0 |
| 速度系统 | 3档速度、状态限制 | P0 |
| 扫荡系统 | 条件限制、快速结算 | P1 |
| 战斗日志 | 实时记录、灵活显示 | P1 |
| UI交互 | 状态提示、快捷操作 | P1 |

### 6.2 性能考虑

1. **自动战斗**
   - 决策计算异步执行
   - 缓存评估结果
   - 限制每帧决策数

2. **扫荡系统**
   - 预计算奖励
   - 后台异步处理
   - 结果批量显示

3. **战斗日志**
   - 日志数量限制
   - 按需加载历史
   - 虚拟滚动优化

---

*文档版本：v1.0 | 最后更新：2026-04-24*
