# 战斗AI系统设计方案

> 版本：1.0
> 日期：2026年4月24日
> 游戏：《苍穹劫·摸金传人》
> 状态：深化设计文档

---

## 一、文档概述

### 1.1 目的与范围

本文档定义战斗AI系统的完整设计方案，包括敌人目标选择AI、技能使用决策AI、Boss阶段切换AI、召唤机制AI和难度分级AI行为差异。本系统控制所有敌方单位的战斗行为。

### 1.2 设计原则

- **可配置性**：AI行为完全由配置驱动
- **多样性**：不同敌人类型有不同AI风格
- **平衡性**：AI行为符合游戏难度设计
- **性能优先**：高效的目标决策算法

---

## 二、AI系统架构

### 2.1 整体架构

```
AIManager
├── AIController           # AI控制器
│     ├── update()         # 每帧更新
│     ├── onTurnStart()    # 回合开始
│     └── onTurnEnd()      # 回合结束
│
├── TargetSelector         # 目标选择器
│     ├── selectSingle()   # 单体目标选择
│     ├── selectArea()     # 范围目标选择
│     └── selectPriority() # 优先级选择
│
├── SkillDecider          # 技能决策器
│     ├── evaluateSkill()  # 评估技能价值
│     ├── selectSkill()    # 选择技能
│     └── calculateTiming()# 时机计算
│
├── PhaseManager          # 阶段管理器(Boss)
│     ├── checkPhase()     # 检查阶段切换
│     ├── transition()     # 执行阶段切换
│     └── getPhaseConfig() # 获取阶段配置
│
└── BehaviorTrees          # 行为树集合
      ├── AggressiveTree   # 激进型行为树
      ├── DefensiveTree    # 防御型行为树
      └── BalancedTree     # 平衡型行为树
```

### 2.2 AI行为类型

```typescript
// AI行为类型枚举
enum AIBehaviorType {
  AGGRESSIVE = 'aggressive',       // 激进型
  DEFENSIVE = 'defensive',         // 防御型
  BALANCED = 'balanced',           // 平衡型
  CAUTIOUS = 'cautious',           // 谨慎型
  RANDOM = 'random',               // 随机型
  PATTERN = 'pattern',             // 模式型
  BOSS = 'boss',                   // Boss专属
}

// AI配置
interface AIConfig {
  behaviorType: AIBehaviorType;
  
  // 基础参数
  aggressionLevel: number;         // 攻击性 (0-1)
  skillUsageRate: number;          // 技能使用频率
  targetPreference: TargetPreference[];
  
  // 决策权重
  decisionWeights: {
    damage: number;                // 伤害权重
    survival: number;              // 生存权重
    control: number;              // 控制权重
    utility: number;              // 辅助权重
  };
  
  // 行为树配置
  behaviorTree?: BehaviorTreeConfig;
  
  // 特殊AI规则
  specialRules?: AIRule[];
}
```

---

## 三、目标选择AI

### 3.1 目标选择策略

```typescript
// 目标选择器
class TargetSelector {
  private battleContext: BattleContext;
  
  // 单体目标选择
  selectSingle(attacker: CombatUnit, options?: SelectOptions): CombatUnit | null {
    const validTargets = this.getValidTargets(attacker);
    if (validTargets.length === 0) return null;
    
    // 计算每个目标的价值
    const targetValues = validTargets.map(target => ({
      target,
      value: this.calculateTargetValue(attacker, target, options)
    }));
    
    // 按价值排序
    targetValues.sort((a, b) => b.value - a.value);
    
    // 随机选择（如果有多个同价值目标）
    const topTargets = targetValues.filter(t => 
      Math.abs(t.value - targetValues[0].value) < 0.01
    );
    
    return topTargets[Math.floor(Math.random() * topTargets.length)].target;
  }
  
  // 计算目标价值
  private calculateTargetValue(
    attacker: CombatUnit,
    target: CombatUnit,
    options?: SelectOptions
  ): number {
    let value = 0;
    const aiConfig = attacker.aiConfig;
    
    // 1. 攻击性判断（优先攻击谁）
    if (options?.preferLowHp) {
      // 低血量优先
      value += (1 - target.currentHp / target.maxHp) * 30;
    }
    
    if (options?.preferHighThreat) {
      // 高威胁优先
      value += target.threatLevel * 20;
    }
    
    if (options?.preferNotTaunted) {
      // 非嘲讽目标优先
      if (!target.hasBuff('taunt')) {
        value += 15;
      }
    }
    
    // 2. 仇恨值判断
    const threat = this.threatManager.getThreat(attacker, target);
    value += threat * aiConfig.decisionWeights.damage;
    
    // 3. 击杀价值
    if (this.canKill(target, attacker)) {
      value += 50; // 击杀奖励
    }
    
    // 4. 弱化价值（攻击后能否让敌人更弱）
    if (options?.canApplyDebuff) {
      const debuffValue = this.calculateDebuffValue(attacker, target);
      value += debuffValue * aiConfig.decisionWeights.control;
    }
    
    // 5. 攻击性调整
    if (aiConfig.behaviorType === AIBehaviorType.AGGRESSIVE) {
      // 激进型优先攻击脆皮
      if (target.maxHp < attacker.attack * 2) {
        value += 20;
      }
    } else if (aiConfig.behaviorType === AIBehaviorType.DEFENSIVE) {
      // 防御型优先攻击能打死的
      if (this.canKill(target, attacker)) {
        value += 30;
      }
    }
    
    // 6. 随机扰动
    value += (Math.random() - 0.5) * 10;
    
    return value;
  }
  
  // 范围目标选择
  selectArea(
    attacker: CombatUnit,
    centerTarget: CombatUnit,
    areaType: AreaType,
    options?: SelectOptions
  ): CombatUnit[] {
    const targetsInArea = this.getTargetsInArea(centerTarget, areaType);
    return targetsInArea.filter(t => this.isValidTarget(attacker, t));
  }
}
```

### 3.2 目标优先级配置

```typescript
// 目标优先级类型
interface TargetPriority {
  type: PriorityType;
  value: number;
  condition?: Condition;
}

// 优先级类型
enum PriorityType {
  LOWEST_HP = 'lowest_hp',           // 最低血量
  HIGHEST_HP = 'highest_hp',         // 最高血量
  LOWEST_DEF = 'lowest_def',        // 最低防御
  HIGHEST_THREAT = 'highest_threat', // 最高仇恨
  SPECIFIC_CLASS = 'specific_class',  // 特定职业
  NOT_TAUNTED = 'not_taunted',       // 非嘲讽目标
  HAS_BUFF = 'has_buff',            // 有特定Buff
  NO_BUFF = 'no_buff',              // 无特定Buff
  RANDOM = 'random',                // 随机
}

// 敌人类型的目标选择配置
const ENEMY_TARGET_PRIORITIES: Record<string, TargetPriority[]> = {
  // 普通小怪
  normal: [
    { type: 'lowest_hp', value: 30 },
    { type: 'highest_threat', value: 20 },
    { type: 'random', value: 10 }
  ],
  
  // 精英怪
  elite: [
    { type: 'lowest_hp', value: 25 },
    { type: 'has_buff', value: 20, condition: { buffType: 'damage_reduction' } },
    { type: 'highest_threat', value: 20 },
    { type: 'lowest_def', value: 15 },
    { type: 'random', value: 10 }
  ],
  
  // 刺客型敌人
  assassin: [
    { type: 'lowest_hp', value: 40 },
    { type: 'no_buff', value: 20, condition: { buffType: 'shield' } },
    { type: 'lowest_def', value: 20 },
    { type: 'random', value: 5 }
  ],
  
  // 治疗型敌人
  healer: [
    { type: 'highest_hp', value: 30 },
    { type: 'lowest_hp_enemy', value: 25 },  // 我方最低血量
    { type: 'random', value: 15 }
  ],
  
  // Boss
  boss: [
    { type: 'highest_threat', value: 30 },
    { type: 'lowest_hp', value: 25 },
    { type: 'not_taunted', value: 15 },
    { type: 'has_buff', value: 10, condition: { buffType: 'atk_up' } }
  ]
};
```

---

## 四、技能使用决策AI

### 4.1 技能决策流程

```typescript
// 技能决策器
class SkillDecider {
  private battleContext: BattleContext;
  private damageCalculator: DamageCalculator;
  
  // 决定是否使用技能
  async decideSkillUsage(enemy: CombatUnit): Promise<SkillDecision | null> {
    const availableSkills = this.getAvailableSkills(enemy);
    if (availableSkills.length === 0) return null;
    
    // 评估每个技能的价值
    const skillEvaluations = await Promise.all(
      availableSkills.map(skill => this.evaluateSkill(enemy, skill))
    );
    
    // 按价值排序
    skillEvaluations.sort((a, b) => b.value - a.value);
    
    // 检查是否达到使用阈值
    const bestSkill = skillEvaluations[0];
    if (bestSkill.value < this.getSkillThreshold(enemy)) {
      return null; // 不值得使用技能
    }
    
    // 选择目标
    const target = await this.selectSkillTarget(enemy, bestSkill.skill);
    
    return {
      skill: bestSkill.skill,
      target,
      value: bestSkill.value,
      reason: bestSkill.reason
    };
  }
  
  // 评估技能价值
  private async evaluateSkill(
    enemy: CombatUnit,
    skill: SkillConfig
  ): Promise<SkillEvaluation> {
    let value = 0;
    const reasons: string[] = [];
    
    // 1. 基础伤害价值
    if (skill.damageCoeff) {
      const potentialDamage = this.calculatePotentialDamage(enemy, skill);
      value += potentialDamage * enemy.aiConfig.decisionWeights.damage;
      reasons.push(`预期伤害: ${potentialDamage}`);
    }
    
    // 2. 控制价值
    if (skill.effects) {
      const controlValue = this.evaluateControlEffects(skill.effects, enemy);
      value += controlValue * enemy.aiConfig.decisionWeights.control;
      if (controlValue > 0) {
        reasons.push(`控制价值: ${controlValue}`);
      }
    }
    
    // 3. 生存价值
    if (skill.effects?.some(e => e.type === 'heal' || e.type === 'shield')) {
      const survivalValue = this.evaluateSurvivalEffect(enemy, skill);
      value += survivalValue * enemy.aiConfig.decisionWeights.survival;
      reasons.push(`生存价值: ${survivalValue}`);
    }
    
    // 4. 时机调整
    const timingBonus = this.calculateTimingBonus(enemy, skill);
    value *= timingBonus;
    
    if (timingBonus > 1) {
      reasons.push(`时机加成: x${timingBonus.toFixed(2)}`);
    }
    
    // 5. AI类型调整
    value = this.applyBehaviorModifier(value, enemy, skill);
    
    // 6. 随机扰动
    value *= (0.9 + Math.random() * 0.2);
    
    return {
      skill,
      value,
      reasons
    };
  }
  
  // 计算时机加成
  private calculateTimingBonus(enemy: CombatUnit, skill: SkillConfig): number {
    let bonus = 1.0;
    
    // 我方血量低时，治疗/护盾价值提升
    const alliesLowHp = enemy.allies.filter(a => 
      a.currentHp / a.maxHp < 0.3
    ).length;
    if (alliesLowHp > 0 && this.isHealSkill(skill)) {
      bonus *= 1 + alliesLowHp * 0.5;
    }
    
    // 敌人正在蓄力，控制技能价值提升
    const enemiesCharging = enemy.enemies.filter(e => e.isCharging()).length;
    if (enemiesCharging > 0 && this.isControlSkill(skill)) {
      bonus *= 1 + enemiesCharging * 0.3;
    }
    
    // 敌人血量低时，爆发技能价值提升
    if (this.isBurstSkill(skill)) {
      const lowHpEnemies = enemy.enemies.filter(e => 
        e.currentHp / e.maxHp < 0.3
      ).length;
      if (lowHpEnemies > 0) {
        bonus *= 1.5;
      }
    }
    
    // Boss狂暴阶段
    if (enemy.isBoss && enemy.isEnraged) {
      if (this.isDefensiveSkill(skill)) {
        bonus *= 0.5; // 狂暴时不防御
      }
      if (this.isBurstSkill(skill)) {
        bonus *= 1.3;
      }
    }
    
    return bonus;
  }
  
  // 计算潜在伤害
  private calculatePotentialDamage(
    enemy: CombatUnit,
    skill: SkillConfig
  ): number {
    const targets = this.selectSkillTargets(enemy, skill);
    let totalDamage = 0;
    
    for (const target of targets) {
      const damage = this.damageCalculator.calculateDamage(enemy, target, {
        damageCoeff: skill.damageCoeff,
        damageType: skill.damageType
      });
      
      totalDamage += damage.damage;
    }
    
    // 考虑击杀价值
    for (const target of targets) {
      if (this.canKill(target, enemy, skill)) {
        totalDamage += 100; // 击杀加成
      }
    }
    
    return totalDamage;
  }
  
  // 评估控制效果
  private evaluateControlEffects(
    effects: SkillEffect[],
    enemy: CombatUnit
  ): number {
    let controlValue = 0;
    
    for (const effect of effects) {
      if (effect.type === 'stun') {
        // 眩晕回合数 × 目标攻击力
        const stunTurns = effect.duration || 1;
        const avgTargetAtk = this.getAverageAttack(enemy.enemies);
        controlValue += stunTurns * avgTargetAtk * 0.5;
      }
      
      if (effect.type === 'debuff_def') {
        // 防御降低对团队的贡献
        controlValue += effect.value * 100;
      }
      
      if (effect.type === 'silence') {
        // 沉默对关键技能的阻止
        controlValue += 50;
      }
    }
    
    return controlValue;
  }
}
```

### 4.2 技能使用时机

```typescript
// 技能使用时机配置
interface SkillUsageTiming {
  skillId: string;
  
  // 使用条件
  conditions: {
    minTurn?: number;           // 最早使用回合
    maxTurn?: number;           // 最晚使用回合
    
    hpThreshold?: {
      self?: { above?: number; below?: number };
      target?: { above?: number; below?: number };
      lowestAlly?: { above?: number; below?: number };
    };
    
    allyCount?: {
      below?: number;          // 友方少于N人时
      alive?: number;          // 友方存活N人时
    };
    
    enemyCount?: {
      above?: number;          // 敌方多于N人时
    };
    
    buffsRequired?: string[];   // 需要有特定Buff
    buffsForbidden?: string[];  // 不能有特定Buff
    
    threatLevel?: {
      above?: number;          // 仇恨高于N时
    };
  };
  
  // 优先级
  priority: number;
  
  // 冷却设置
  cooldownUsage?: 'immediate' | 'save_for_special';
}

// Boss技能使用时机配置
const BOSS_SKILL_TIMING: SkillUsageTiming[] = [
  {
    skillId: 'BOSS_ULTIMATE',
    conditions: {
      minTurn: 3,
      hpThreshold: {
        self: { below: 0.5 }
      }
    },
    priority: 100,
    cooldownUsage: 'immediate'
  },
  
  {
    skillId: 'BOSS_SUMMON',
    conditions: {
      allyCount: { below: 2 }
    },
    priority: 80,
    cooldownUsage: 'immediate'
  },
  
  {
    skillId: 'BOSS_ENRAGE',
    conditions: {
      hpThreshold: {
        self: { below: 0.3 }
      }
    },
    priority: 150,  // 最高优先级
    cooldownUsage: 'save_for_special'
  }
];
```

---

## 五、Boss阶段切换AI

### 5.1 阶段管理架构

```typescript
// Boss阶段配置
interface BossPhaseConfig {
  phaseId: number;
  phaseName: string;
  
  // 进入条件
  triggerType: 'hp_percent' | 'turn_count' | 'manual' | 'event';
  triggerValue: number;         // 阈值（HP百分比或回合数）
  
  // 阶段属性调整
  attributeModifiers: {
    attackMultiplier?: number;
    defenseMultiplier?: number;
    speedMultiplier?: number;
    hpMultiplier?: number;
  };
  
  // 技能池
  availableSkills: string[];
  skillWeightModifier?: Record<string, number>;
  
  // AI调整
  aiModifier?: Partial<AIConfig>;
  
  // 阶段特效
  phaseEffects?: {
    screenEffect?: string;
    audioEffect?: string;
    unitEffect?: string;
  };
  
  // 阶段行动
  phaseActions?: PhaseAction[];
}

// 阶段动作
interface PhaseAction {
  actionType: 'skill' | 'summon' | 'transform' | 'dialog';
  actionId: string;
  delay?: number;
}

// Boss阶段管理器
class BossPhaseManager {
  private currentPhase: BossPhaseConfig;
  private phaseHistory: BossPhaseConfig[];
  
  // 检查阶段切换
  checkPhaseTransition(boss: CombatUnit): PhaseTransitionResult | null {
    const nextPhase = this.getNextPhase(boss);
    if (!nextPhase) return null;
    
    // 检查触发条件
    const triggerMet = this.evaluateTrigger(boss, nextPhase);
    if (!triggerMet) return null;
    
    return {
      fromPhase: this.currentPhase,
      toPhase: nextPhase,
      canTransition: true
    };
  }
  
  // 执行阶段切换
  async transitionTo(boss: CombatUnit, newPhase: BossPhaseConfig): Promise<void> {
    // 1. 执行旧阶段退出动作
    if (this.currentPhase.exitActions) {
      await this.executePhaseActions(boss, this.currentPhase.exitActions);
    }
    
    // 2. 记录历史
    this.phaseHistory.push(this.currentPhase);
    
    // 3. 应用新阶段配置
    this.applyPhaseModifiers(boss, newPhase);
    
    // 4. 执行新阶段进入动作
    if (newPhase.entryActions) {
      await this.executePhaseActions(boss, newPhase.entryActions);
    }
    
    // 5. 更新当前阶段
    this.currentPhase = newPhase;
    
    // 6. 触发阶段切换事件
    this.eventSystem.emit('onBossPhaseChange', {
      boss,
      newPhase,
      phaseNumber: this.phaseHistory.length + 1
    });
    
    // 7. 播放阶段切换特效
    await this.playPhaseTransitionEffect(boss, newPhase);
  }
  
  // 应用阶段属性调整
  private applyPhaseModifiers(boss: CombatUnit, phase: BossPhaseConfig): void {
    const mods = phase.attributeModifiers;
    
    if (mods.attackMultiplier) {
      boss.baseAttack *= mods.attackMultiplier;
    }
    if (mods.defenseMultiplier) {
      boss.baseDefense *= mods.defenseMultiplier;
    }
    if (mods.speedMultiplier) {
      boss.baseSpeed *= mods.speedMultiplier;
    }
    if (mods.hpMultiplier) {
      const hpRatio = boss.currentHp / boss.maxHp;
      boss.maxHp *= mods.hpMultiplier;
      boss.currentHp = boss.maxHp * hpRatio;
    }
  }
  
  // 评估触发条件
  private evaluateTrigger(boss: CombatUnit, phase: BossPhaseConfig): boolean {
    switch (phase.triggerType) {
      case 'hp_percent':
        const hpRatio = boss.currentHp / boss.maxHp;
        return hpRatio <= phase.triggerValue;
      
      case 'turn_count':
        return this.battleContext.turnNumber >= phase.triggerValue;
      
      case 'manual':
        return boss.manualPhaseTrigger;
      
      case 'event':
        return this.checkEventCondition(phase.triggerValue);
      
      default:
        return false;
    }
  }
}
```

### 5.2 Boss阶段配置示例

```typescript
// 守墓鬼将Boss阶段配置
const BOSS_GUARDIAN_PHASES: BossPhaseConfig[] = [
  {
    phaseId: 1,
    phaseName: '守墓之威',
    triggerType: 'hp_percent',
    triggerValue: 1.0,
    
    attributeModifiers: {
      attackMultiplier: 1.0,
      defenseMultiplier: 1.0,
      speedMultiplier: 1.0
    },
    
    availableSkills: ['NORMAL_ATTACK', 'GHOST_CLAW'],
    aiModifier: {
      behaviorType: 'balanced',
      aggressionLevel: 0.6
    }
  },
  
  {
    phaseId: 2,
    phaseName: '召唤亡魂',
    triggerType: 'hp_percent',
    triggerValue: 0.7,
    
    attributeModifiers: {
      attackMultiplier: 1.15,
      speedMultiplier: 1.1
    },
    
    availableSkills: ['NORMAL_ATTACK', 'GHOST_CLAW', 'SUMMON_UNDEAD'],
    aiModifier: {
      behaviorType: 'aggressive',
      aggressionLevel: 0.8
    },
    
    entryActions: [
      { actionType: 'summon', actionId: 'ZOMBIE', count: 2 },
      { actionType: 'dialog', actionId: 'PHASE2_DIALOG' }
    ],
    
    phaseEffects: {
      unitEffect: 'ghost_flame'
    }
  },
  
  {
    phaseId: 3,
    phaseName: '鬼将咆哮',
    triggerType: 'hp_percent',
    triggerValue: 0.3,
    
    attributeModifiers: {
      attackMultiplier: 1.3,
      defenseMultiplier: 1.2,
      speedMultiplier: 1.2
    },
    
    availableSkills: ['NORMAL_ATTACK', 'GHOST_HOWL', 'DEATH_SCYTHE'],
    aiModifier: {
      behaviorType: 'aggressive',
      aggressionLevel: 1.0
    },
    
    entryActions: [
      { actionType: 'skill', actionId: 'ENRAGE_BUFF' },
      { actionType: 'dialog', actionId: 'PHASE3_DIALOG' }
    ],
    
    phaseEffects: {
      screenEffect: 'dark_aura',
      audioEffect: 'boss_enrage'
    }
  }
];
```

---

## 六、召唤机制AI

### 6.1 召唤决策逻辑

```typescript
// 召唤管理器
class SummonManager {
  // 评估召唤时机
  evaluateSummon(enemy: CombatUnit): SummonDecision {
    const summonConfig = enemy.summonConfig;
    if (!summonConfig) return { shouldSummon: false };
    
    // 检查召唤条件
    const conditionsMet = this.checkSummonConditions(enemy, summonConfig);
    if (!conditionsMet) {
      return { shouldSummon: false, reason: conditionsMet.reason };
    }
    
    // 计算召唤价值
    const summonValue = this.calculateSummonValue(enemy, summonConfig);
    
    // 判断是否召唤
    const shouldSummon = summonValue > summonConfig.minValueThreshold;
    
    return {
      shouldSummon,
      value: summonValue,
      summonType: summonConfig.summonType,
      position: this.calculateSummonPosition(enemy),
      reason: `召唤价值: ${summonValue.toFixed(1)}`
    };
  }
  
  // 检查召唤条件
  private checkSummonConditions(
    enemy: CombatUnit,
    config: SummonConfig
  ): CheckResult {
    // 回合限制
    if (this.battleContext.turnNumber < config.availableFromTurn) {
      return { passed: false, reason: `需要达到第${config.availableFromTurn}回合` };
    }
    
    // 召唤冷却
    if (enemy.summonCooldown > 0) {
      return { passed: false, reason: '召唤冷却中' };
    }
    
    // 最大召唤数
    const currentSummons = this.battleContext.getSummonCount(enemy.id);
    if (currentSummons >= config.maxSummons) {
      return { passed: false, reason: '已达到最大召唤数' };
    }
    
    // 友方存活数检查
    const aliveAllies = enemy.allies.filter(a => !a.isDead).length;
    if (config.maxAllies !== undefined && aliveAllies >= config.maxAllies) {
      return { passed: false, reason: '友方人数已满' };
    }
    
    // HP条件
    if (config.hpThreshold && enemy.currentHp / enemy.maxHp > config.hpThreshold) {
      return { passed: false, reason: 'HP高于阈值' };
    }
    
    return { passed: true };
  }
  
  // 计算召唤价值
  private calculateSummonValue(enemy: CombatUnit, config: SummonConfig): number {
    let value = 0;
    
    // 基础价值
    value += 50;
    
    // 友方数量价值
    const aliveAllies = enemy.allies.filter(a => !a.isDead).length;
    if (aliveAllies < 2) {
      value += 40; // 友方少时召唤价值高
    }
    
    // 敌方威胁价值
    const highThreat = enemy.enemies.filter(e => 
      e.threatLevel > 0.5
    ).length;
    if (highThreat > 2) {
      value += 30; // 敌人多时分散仇恨
    }
    
    // 嘲讽/吸引仇恨价值
    if (enemy.hasBuff('taunt')) {
      value -= 20; // 有嘲讽时召唤价值降低
    }
    
    // Boss特殊调整
    if (enemy.isBoss) {
      value *= 1.5; // Boss召唤更有价值
    }
    
    return value;
  }
  
  // 计算召唤位置
  private calculateSummonPosition(summonner: CombatUnit): Position[] {
    const positions: Position[] = [];
    const maxSummons = summonner.summonConfig?.maxSummons || 2;
    
    // 优先填充满战场
    const occupiedPositions = this.battleContext.getEnemyPositions();
    const allPositions = this.getValidSummonPositions();
    
    const availablePositions = allPositions.filter(p => 
      !occupiedPositions.some(op => op.x === p.x && op.y === p.y)
    );
    
    // 选择距离召唤者最近的空位
    availablePositions.sort((a, b) => {
      const distA = Math.abs(a.x - summonner.position.x) + Math.abs(a.y - summonner.position.y);
      const distB = Math.abs(b.x - summonner.position.x) + Math.abs(b.y - summonner.position.y);
      return distA - distB;
    });
    
    return availablePositions.slice(0, maxSummons);
  }
}
```

---

## 七、难度分级AI行为差异

### 7.1 难度等级定义

```typescript
// 难度等级配置
interface DifficultyConfig {
  difficulty: DifficultyLevel;
  
  // AI参数调整
  aiModifiers: {
    aggressionLevelModifier: number;      // 攻击性调整
    skillUsageRateModifier: number;       // 技能使用频率
    targetAccuracy: number;              // 目标准确度
    reactionTime: number;                // 反应时间(ms)
    mistakeChance: number;               // 失误几率
    perfectDefenseChance: number;        // 完美防御几率
  };
  
  // 战斗参数调整
  battleModifiers: {
    enemyHpMultiplier: number;
    enemyAtkMultiplier: number;
    enemyDefMultiplier: number;
    enemySpeedMultiplier: number;
  };
  
  // 特殊规则
  specialRules?: SpecialRule[];
}

// 难度等级
enum DifficultyLevel {
  EASY = 1,
  NORMAL = 2,
  HARD = 3,
  NIGHTMARE = 4,
  HELL = 5,
}

// 各难度AI配置
const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  [DifficultyLevel.EASY]: {
    difficulty: DifficultyLevel.EASY,
    aiModifiers: {
      aggressionLevelModifier: -0.2,
      skillUsageRateModifier: 0.7,
      targetAccuracy: 0.6,
      reactionTime: 2000,
      mistakeChance: 0.25,
      perfectDefenseChance: 0.1
    },
    battleModifiers: {
      enemyHpMultiplier: 0.6,
      enemyAtkMultiplier: 0.6,
      enemyDefMultiplier: 0.6,
      enemySpeedMultiplier: 0.85
    }
  },
  
  [DifficultyLevel.NORMAL]: {
    difficulty: DifficultyLevel.NORMAL,
    aiModifiers: {
      aggressionLevelModifier: 0,
      skillUsageRateModifier: 0.85,
      targetAccuracy: 0.8,
      reactionTime: 1000,
      mistakeChance: 0.1,
      perfectDefenseChance: 0.2
    },
    battleModifiers: {
      enemyHpMultiplier: 1.0,
      enemyAtkMultiplier: 1.0,
      enemyDefMultiplier: 1.0,
      enemySpeedMultiplier: 1.0
    }
  },
  
  [DifficultyLevel.HARD]: {
    difficulty: DifficultyLevel.HARD,
    aiModifiers: {
      aggressionLevelModifier: 0.15,
      skillUsageRateModifier: 0.95,
      targetAccuracy: 0.9,
      reactionTime: 500,
      mistakeChance: 0.03,
      perfectDefenseChance: 0.35
    },
    battleModifiers: {
      enemyHpMultiplier: 1.3,
      enemyAtkMultiplier: 1.2,
      enemyDefMultiplier: 1.15,
      enemySpeedMultiplier: 1.05
    }
  },
  
  [DifficultyLevel.NIGHTMARE]: {
    difficulty: DifficultyLevel.NIGHTMARE,
    aiModifiers: {
      aggressionLevelModifier: 0.25,
      skillUsageRateModifier: 1.0,
      targetAccuracy: 0.95,
      reactionTime: 200,
      mistakeChance: 0.01,
      perfectDefenseChance: 0.5
    },
    battleModifiers: {
      enemyHpMultiplier: 1.6,
      enemyAtkMultiplier: 1.4,
      enemyDefMultiplier: 1.3,
      enemySpeedMultiplier: 1.1
    }
  },
  
  [DifficultyLevel.HELL]: {
    difficulty: DifficultyLevel.HELL,
    aiModifiers: {
      aggressionLevelModifier: 0.35,
      skillUsageRateModifier: 1.0,
      targetAccuracy: 1.0,
      reactionTime: 0,
      mistakeChance: 0,
      perfectDefenseChance: 0.7
    },
    battleModifiers: {
      enemyHpMultiplier: 2.0,
      enemyAtkMultiplier: 1.6,
      enemyDefMultiplier: 1.5,
      enemySpeedMultiplier: 1.15
    }
  }
};
```

### 7.2 难度AI行为差异实现

```typescript
// 难度适配器
class DifficultyAdapter {
  private difficultyConfig: DifficultyConfig;
  
  constructor(difficulty: DifficultyLevel) {
    this.difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
  }
  
  // 应用难度调整到AI
  applyDifficultyToAI(enemy: CombatUnit): void {
    const mod = this.difficultyConfig.aiModifiers;
    const ai = enemy.aiConfig;
    
    // 调整攻击性
    ai.aggressionLevel = Math.max(0, Math.min(1, 
      ai.aggressionLevel + mod.aggressionLevelModifier
    ));
    
    // 调整技能使用频率
    ai.skillUsageRate *= mod.skillUsageRateModifier;
    
    // 添加失误行为
    if (mod.mistakeChance > 0) {
      ai.mistakeChance = mod.mistakeChance;
    }
  }
  
  // 应用难度调整到属性
  applyDifficultyToStats(enemy: CombatUnit): void {
    const mod = this.difficultyConfig.battleModifiers;
    
    enemy.maxHp = Math.floor(enemy.maxHp * mod.enemyHpMultiplier);
    enemy.currentHp = Math.floor(enemy.currentHp * mod.enemyHpMultiplier);
    enemy.attack = Math.floor(enemy.attack * mod.enemyAtkMultiplier);
    enemy.defense = Math.floor(enemy.defense * mod.enemyDefMultiplier);
    enemy.speed = Math.floor(enemy.speed * mod.enemySpeedMultiplier);
  }
  
  // 难度相关决策调整
  adjustDecision(enemy: CombatUnit, decision: AIDecision): AIDecision {
    const mod = this.difficultyConfig.aiModifiers;
    
    // 目标准确度调整
    if (mod.targetAccuracy < 1 && Math.random() > mod.targetAccuracy) {
      // 选择次优目标
      decision.target = this.selectSuboptimalTarget(decision.target);
      decision.reason = '目标偏移(难度)';
    }
    
    // 技能延迟使用
    if (mod.reactionTime > 0) {
      decision.executeDelay = mod.reactionTime + Math.random() * 500;
    }
    
    // 失误处理
    if (mod.mistakeChance > 0 && Math.random() < mod.mistakeChance) {
      decision = this.applyMistake(decision);
    }
    
    return decision;
  }
  
  // 应用失误
  private applyMistake(decision: AIDecision): AIDecision {
    const mistakeTypes = ['wrong_target', 'skill_delay', 'skill_cancel', 'wrong_skill'];
    const mistake = mistakeTypes[Math.floor(Math.random() * mistakeTypes.length)];
    
    switch (mistake) {
      case 'wrong_target':
        decision.target = this.selectRandomTarget();
        decision.reason = '失误:目标错误';
        break;
      
      case 'skill_delay':
        decision.executeDelay = 3000;
        decision.reason = '失误:技能延迟';
        break;
      
      case 'skill_cancel':
        decision.canceled = true;
        decision.reason = '失误:取消技能';
        break;
      
      case 'wrong_skill':
        decision.skill = this.selectRandomSkill();
        decision.reason = '失误:使用错误技能';
        break;
    }
    
    return decision;
  }
}
```

---

## 八、实现要点总结

### 8.1 核心功能清单

| 功能 | 实现要点 | 优先级 |
|------|----------|--------|
| 目标选择 | 多维度价值评估 | P0 |
| 技能决策 | 时机计算和价值评估 | P0 |
| Boss阶段 | 阶段切换和属性调整 | P0 |
| 召唤管理 | 召唤时机和位置 | P1 |
| 难度适配 | 难度参数调整 | P1 |
| 行为树 | 复杂AI行为 | P2 |

### 8.2 AI配置示例

```json
{
  "enemyId": "ENEMY_ZOMBIE_KING",
  "aiConfig": {
    "behaviorType": "aggressive",
    "aggressionLevel": 0.8,
    "skillUsageRate": 0.9,
    "decisionWeights": {
      "damage": 1.0,
      "survival": 0.5,
      "control": 0.8,
      "utility": 0.3
    },
    "targetPriority": [
      { "type": "lowest_hp", "value": 40 },
      { "type": "has_buff", "value": 20, "condition": { "buffType": "heal" } },
      { "type": "random", "value": 10 }
    ],
    "specialRules": [
      {
        "ruleId": "summon_when_outnumbered",
        "condition": { "allyCount": { "below": 2 } },
        "action": "summon",
        "priority": 80
      }
    ]
  }
}
```

---

*文档版本：v1.0 | 最后更新：2026-04-24*
