# 战斗状态系统设计方案

> 版本：1.0
> 日期：2026年4月24日
> 游戏：《苍穹劫·摸金传人》
> 状态：深化设计文档

---

## 一、文档概述

### 1.1 目的与范围

本文档定义战斗状态系统（Buff/Debuff系统）的完整设计方案，包括状态类型定义、叠加规则、互斥规则、刷新机制、持续时间计算和UI显示规范。本系统是战斗系统的核心状态管理模块。

### 1.2 设计原则

- **状态独立**：每个Buff独立计算和管理
- **规则明确**：叠加、互斥规则清晰可配置
- **性能优先**：高效的状态查询和更新
- **UI友好**：清晰的状态显示和反馈

---

## 二、Buff/Debuff类型定义

### 2.1 状态类型分类

```typescript
// 状态类型枚举
enum BuffCategory {
  // ===== 增益类 =====
  BUFF = 'buff',                  // 增益Buff
  SHIELD = 'shield',              // 护盾
  IMMUNITY = 'immunity',          // 免疫
  
  // ===== 减益类 =====
  DEBUFF = 'debuff',              // 减益Debuff
  DOT = 'dot',                    // 持续伤害
  HOT = 'hot',                    // 持续治疗
  
  // ===== 控制类 =====
  CONTROL = 'control',            // 控制状态
  STUN = 'stun',                  // 眩晕
  FREEZE = 'freeze',              // 冰冻
  SILENCE = 'silence',            // 沉默
  SLEEP = 'sleep',                // 睡眠
  FEAR = 'fear',                  // 恐惧
  CONFUSION = 'confusion',        // 混乱
  taunt = 'taunt',                // 嘲讽
  BIND = 'bind',                  // 束缚
  
  // ===== 特殊类 =====
  MARK = 'mark',                  // 标记
  COUNTER = 'counter',            // 反击标记
  REFLECT = 'reflect',            // 伤害反弹标记
}
```

### 2.2 详细状态定义

```typescript
// 眩晕 (Stun)
interface StunBuff extends BaseBuff {
  category: 'control';
  controlType: 'stun';
  
  // 效果：禁止行动
  effects: {
    canAct: false;           // 无法行动
    canUseSkill: false;      // 无法使用技能
    canBeHealed: true;       // 仍可被治疗
  };
  
  // 显示
  icon: 'stun.png';
  color: '#FF6B6B';
  priority: 100;             // 高优先级显示
}

// 冰冻 (Freeze)
interface FreezeBuff extends BaseBuff {
  category: 'control';
  controlType: 'freeze';
  
  effects: {
    canAct: false;
    canUseSkill: false;
    speedReduction: 0.5;     // 速度减半（解冻后恢复）
  };
  
  // 解冻条件
  clearOnDamage: true;       // 受到伤害时解冻
  damageThreshold: 0;        // 任意伤害即解冻
  
  icon: 'freeze.png';
  color: '#4ECDC4';
  priority: 100;
}

// 沉默 (Silence)
interface SilenceBuff extends BaseBuff {
  category: 'control';
  controlType: 'silence';
  
  effects: {
    canAct: true;            // 可以普攻
    canUseSkill: false;      // 无法使用技能
    canUseUltimate: false;  // 无法使用大招
    passiveActive: true;    // 被动技能仍生效
  };
  
  icon: 'silence.png';
  color: '#9B59B6';
  priority: 90;
}

// 睡眠 (Sleep)
interface SleepBuff extends BaseBuff {
  category: 'control';
  controlType: 'sleep';
  
  effects: {
    canAct: false;
    canUseSkill: false;
  };
  
  // 唤醒条件
  wakeConditions: {
    onDamage: true;          // 受到伤害唤醒
    onAllyDamage: false;     // 友方受伤不唤醒
    onTurnStart: false;      // 回合开始不自动唤醒
  };
  
  icon: 'sleep.png';
  color: '#3498DB';
  priority: 95;
}

// 恐惧 (Fear)
interface FearBuff extends BaseBuff {
  category: 'control';
  controlType: 'fear';
  
  effects: {
    canAct: false;           // 无法主动行动
    canBeHealed: true;
    willFlee: true;          // 逃跑判定
  };
  
  // 恐惧效果
  fleeChance: 0.3;          // 30%几率逃跑
  
  icon: 'fear.png';
  color: '#E74C3C';
  priority: 100;
}

// 嘲讽 (Taunt)
interface TauntBuff extends BaseBuff {
  category: 'control';
  controlType: 'taunt';
  
  effects: {
    tauntTargets: 'all';      // 所有敌方必须攻击此目标
    canAct: true;
  };
  
  // 嘲讽优先级
  tauntPriority: 200;        // 高优先级嘲讽
  
  icon: 'taunt.png';
  color: '#F39C12';
  priority: 80;
}

// 混乱 (Confusion)
interface ConfusionBuff extends BaseBuff {
  category: 'control';
  controlType: 'confusion';
  
  effects: {
    canAct: true;
    targetSelection: 'random'; // 随机选择目标
    allyPriority: 0.5;        // 50%几率攻击友方
    selfPriority: 0.2;        // 20%几率攻击自己
  };
  
  icon: 'confusion.png';
  color: '#E91E63';
  priority: 85;
}

// 束缚 (Bind)
interface BindBuff extends BaseBuff {
  category: 'control';
  controlType: 'bind';
  
  effects: {
    canAct: false;
    canUseSkill: false;
    canMove: false;          // 不可移动位置
  };
  
  // 特殊：束缚可以叠加延长，不可叠加层数
  stackType: 'duration_only';
  
  icon: 'bind.png';
  color: '#795548';
  priority: 90;
}
```

### 2.3 减益状态详细定义

```typescript
// 中毒 (Poison DOT)
interface PoisonDebuff extends BaseDebuff {
  category: 'dot';
  dotType: 'poison';
  
  // 伤害计算
  damagePerTick: number;      // 每回合伤害
  damageCalculation: 'percent_max_hp';  // 基于最大生命百分比
  baseDamageRate: 0.05;       // 5%最大生命/回合
  
  // 效果
  effects: {
    canAct: true;
    canUseSkill: true;
    healingReduction: 0.5;    // 受到治疗效果减半
  };
  
  // 可叠加
  stackType: 'intensity';    // 强度叠加
  maxStack: 5;
  damagePerStack: 0.01;       // 每层+1%
  
  icon: 'poison.png';
  color: '#2ECC71';
  particleEffect: 'poison_drip';
}

// 灼烧 (Burn DOT)
interface BurnDebuff extends BaseDebuff {
  category: 'dot';
  dotType: 'burn';
  
  damageCalculation: 'percent_attack';  // 基于攻击者攻击力
  baseDamageRate: 0.08;       // 8%攻击力/回合
  
  effects: {
    canAct: true;
    canUseSkill: true;
  };
  
  // 可叠加
  stackType: 'intensity';
  maxStack: 3;
  
  icon: 'burn.png';
  color: '#E67E22';
  particleEffect: 'flame_dance';
}

// 冰冻DOT (Chill)
interface ChillDebuff extends BaseDebuff {
  category: 'debuff';
  dotType: 'chill';
  
  effects: {
    speedReduction: 0.20;     // 减速20%
  };
  
  // 叠满3层触发冰冻
  stackToFreeze: 3;
  
  icon: 'chill.png';
  color: '#00BCD4';
}

// 破甲 (Armor Break)
interface ArmorBreakDebuff extends BaseDebuff {
  category: 'debuff';
  
  effects: {
    defenseReduction: 0.25;   // 防御降低25%
  };
  
  stackType: 'intensity';
  maxStack: 3;
  defensePerStack: 0.10;      // 每层额外-10%
  
  icon: 'armor_break.png';
  color: '#607D8B';
}
```

### 2.4 增益状态详细定义

```typescript
// 护盾 (Shield)
interface ShieldBuff extends BaseBuff {
  category: 'shield';
  
  // 护盾值
  shieldValue: number;        // 护盾值
  shieldCalculation: 'fixed' | 'percent_max_hp' | 'percent_attack';
  
  // 护盾规则
  shieldRules: {
    absorbAllDamage: true;     // 吸收所有伤害
    absorbType: 'all';         // 吸收类型：all/physical/magic
    breakEffect?: BuffConfig;  // 护盾破碎时的效果
  };
  
  // 显示
  displayType: 'overlay';     // 叠加显示
  icon: 'shield.png';
  color: '#2196F3';
  
  // 可叠加规则
  stackType: 'absorb';        // 护盾值累加
  maxShieldValue: undefined;  // 无上限
}

// 攻击力提升
interface AttackUpBuff extends BaseBuff {
  category: 'buff';
  buffType: 'atk_up';
  
  effects: {
    attackBonus: number;       // 攻击力加成百分比
  };
  
  stackType: 'intensity';
  maxStack: 5;
  
  icon: 'atk_up.png';
  color: '#FF5722';
}

// 速度提升
interface SpeedUpBuff extends BaseBuff {
  category: 'buff';
  buffType: 'spd_up';
  
  effects: {
    speedBonus: number;        // 速度加成
    speedBonusPercent: number; // 速度加成百分比
  };
  
  // 速度加成可能影响行动顺序
  affectsActionBar: true;
  
  icon: 'spd_up.png';
  color: '#FFEB3B';
}

// 暴击率提升
interface CritUpBuff extends BaseBuff {
  category: 'buff';
  buffType: 'crit_up';
  
  effects: {
    critRateBonus: number;    // 暴击率加成
  };
  
  maxCritRate: 1.0;           // 暴击率上限100%
  
  icon: 'crit_up.png';
  color: '#FF9800';
}

// 伤害减免
interface DamageReductionBuff extends BaseBuff {
  category: 'buff';
  buffType: 'damage_reduction';
  
  effects: {
    damageReduction: number;   // 伤害减免百分比
    damageReductionType: 'all' | 'physical' | 'magic';
  };
  
  // 伤害减免有上限
  maxReduction: 0.90;        // 最多减免90%
  
  icon: 'def_up.png';
  color: '#3F51B5';
}

// 免疫控制
interface ImmunityBuff extends BaseBuff {
  category: 'immunity';
  immunityType: 'control' | 'debuff' | 'dot' | 'all';
  
  effects: {
    immuneStun: true;
    immuneFreeze: true;
    immuneSilence: true;
    // ... 其他免疫
  };
  
  // 优先级最高
  priority: 200;
  
  icon: 'immunity.png';
  color: '#FFFFFF';
}
```

---

## 三、状态叠加规则

### 3.1 叠加类型定义

```typescript
// 叠加类型枚举
enum StackType {
  NONE = 'none',             // 不可叠加
  RENEW = 'renew',            // 刷新时间
  STACK = 'stack',            // 叠加层数
  REPLACE = 'replace',         // 替换效果
  DURATION_ONLY = 'duration_only', // 只延长持续时间
  ABSORB = 'absorb',           // 护盾类累加
  INTENSITY = 'intensity',     // 强度叠加(数值累加)
}

// 各Buff类型的默认叠加规则
const DEFAULT_STACK_RULES: Record<string, StackType> = {
  // 增益类
  'atk_up': 'stack',
  'def_up': 'stack',
  'spd_up': 'stack',
  'crit_up': 'stack',
  'crit_dmg_up': 'stack',
  'damage_reduction': 'intensity',
  'shield': 'absorb',
  'immunity': 'none',
  
  // 减益类
  'atk_down': 'stack',
  'def_down': 'stack',
  'spd_down': 'stack',
  'armor_break': 'intensity',
  'poison': 'intensity',
  'burn': 'intensity',
  
  // 控制类
  'stun': 'duration_only',
  'freeze': 'replace',
  'silence': 'duration_only',
  'sleep': 'replace',
  'fear': 'duration_only',
  'taunt': 'replace',
  'confusion': 'replace',
  'bind': 'duration_only',
};
```

### 3.2 叠加规则实现

```typescript
// Buff管理器
class BuffManager {
  private unitBuffs: Map<string, BuffInstance[]>;
  
  // 添加Buff
  addBuff(unit: CombatUnit, buffConfig: BuffConfig, caster?: CombatUnit): BuffResult {
    const existingBuffs = this.unitBuffs.get(unit.id) || [];
    
    // 1. 检查互斥
    const exclusiveResult = this.checkExclusive(buffConfig, existingBuffs);
    if (exclusiveResult.isExclusive) {
      return { 
        success: false, 
        reason: 'exclusive',
        conflictingBuff: exclusiveResult.conflictWith
      };
    }
    
    // 2. 查找相同类型的Buff
    const sameTypeBuff = existingBuffs.find(b => b.config.buffType === buffConfig.buffType);
    
    // 3. 应用叠加规则
    if (sameTypeBuff) {
      return this.applyStackRule(unit, sameTypeBuff, buffConfig, caster);
    }
    
    // 4. 添加新Buff
    const newBuff = this.createBuffInstance(buffConfig, caster);
    existingBuffs.push(newBuff);
    this.unitBuffs.set(unit.id, existingBuffs);
    
    // 5. 应用Buff效果
    this.applyBuffEffects(unit, newBuff);
    
    // 6. 触发添加事件
    this.eventSystem.emit('onBuffAdded', { unit, buff: newBuff });
    
    return { success: true, buff: newBuff };
  }
  
  // 应用叠加规则
  private applyStackRule(
    unit: CombatUnit,
    existingBuff: BuffInstance,
    newBuffConfig: BuffConfig,
    caster?: CombatUnit
  ): BuffResult {
    const stackType = newBuffConfig.stackType;
    
    switch (stackType) {
      case StackType.NONE:
        return { success: false, reason: 'not_stackable' };
      
      case StackType.RENEW:
        // 刷新持续时间
        existingBuff.remainingDuration = newBuffConfig.duration;
        return { success: true, buff: existingBuff, renewed: true };
      
      case StackType.STACK:
        // 检查是否达到最大层数
        if (existingBuff.stack >= (newBuffConfig.maxStack || 1)) {
          existingBuff.remainingDuration = newBuffConfig.duration;
          return { success: true, buff: existingBuff, renewed: true };
        }
        
        existingBuff.stack++;
        existingBuff.remainingDuration = newBuffConfig.duration;
        this.updateStackEffects(unit, existingBuff);
        return { success: true, buff: existingBuff, stacked: true };
      
      case StackType.INTENSITY:
        // 数值累加
        const maxStack = newBuffConfig.maxStack || 10;
        existingBuff.stack = Math.min(existingBuff.stack + 1, maxStack);
        existingBuff.intensity = this.calculateIntensity(newBuffConfig, existingBuff.stack);
        existingBuff.remainingDuration = newBuffConfig.duration;
        this.updateStackEffects(unit, existingBuff);
        return { success: true, buff: existingBuff, intensity: existingBuff.intensity };
      
      case StackType.ABSORB:
        // 护盾值累加
        existingBuff.shieldValue += newBuffConfig.shieldValue;
        existingBuff.remainingDuration = newBuffConfig.duration;
        return { success: true, buff: existingBuff, shieldGained: newBuffConfig.shieldValue };
      
      case StackType.DURATION_ONLY:
        // 只延长持续时间
        existingBuff.remainingDuration = Math.max(
          existingBuff.remainingDuration,
          newBuffConfig.duration
        );
        return { success: true, buff: existingBuff, durationExtended: true };
      
      case StackType.REPLACE:
        // 替换效果
        this.removeBuff(unit, existingBuff);
        const newBuff = this.createBuffInstance(newBuffConfig, caster);
        this.unitBuffs.get(unit.id).push(newBuff);
        this.applyBuffEffects(unit, newBuff);
        return { success: true, buff: newBuff, replaced: true };
    }
  }
  
  // 计算强度（用于intensity类型）
  private calculateIntensity(buffConfig: BuffConfig, stack: number): number {
    if (buffConfig.intensityFormula) {
      return eval(buffConfig.intensityFormula);
    }
    return buffConfig.baseIntensity * stack;
  }
}
```

---

## 四、状态互斥规则

### 4.1 互斥组定义

```typescript
// 互斥组配置
interface ExclusiveGroup {
  groupId: string;
  name: string;
  exclusiveType: 'category' | 'mechanic';
  
  // 互斥的Buff类型
  exclusiveBuffs: string[];
  
  // 优先级规则
  priorityRule: 'higher' | 'lower' | 'newer' | 'older';
  
  // 冲突时的处理
  conflictResolution: 'remove_lower' | 'remove_both' | 'keep_both';
}

// 预定义互斥组
const EXCLUSIVE_GROUPS: ExclusiveGroup[] = [
  {
    groupId: 'speed_buffers',
    name: '速度增益互斥',
    exclusiveType: 'category',
    exclusiveBuffs: ['spd_up', 'spd_down'],
    priorityRule: 'higher',
    conflictResolution: 'remove_lower'
  },
  
  {
    groupId: 'control_stun',
    name: '眩晕互斥',
    exclusiveType: 'mechanic',
    exclusiveBuffs: ['stun', 'freeze', 'sleep'],
    priorityRule: 'newer',
    conflictResolution: 'remove_both'
  },
  
  {
    groupId: 'taunt_confusion',
    name: '嘲讽与混乱互斥',
    exclusiveType: 'mechanic',
    exclusiveBuffs: ['taunt', 'confusion'],
    priorityRule: 'newer',
    conflictResolution: 'remove_both'
  },
  
  {
    groupId: 'immunity_all',
    name: '免疫互斥',
    exclusiveType: 'category',
    exclusiveBuffs: ['immunity_all', 'immunity_control', 'immunity_debuff'],
    priorityRule: 'higher',
    conflictResolution: 'remove_lower'
  },
  
  {
    groupId: 'mark_types',
    name: '标记互斥',
    exclusiveType: 'mechanic',
    exclusiveBuffs: ['mark', 'mark_boss', 'mark_crit'],
    priorityRule: 'newer',
    conflictResolution: 'remove_both'
  }
];
```

### 4.2 互斥检查实现

```typescript
// 互斥检查器
class ExclusiveChecker {
  private groups: Map<string, ExclusiveGroup>;
  
  constructor() {
    this.groups = new Map();
    for (const group of EXCLUSIVE_GROUPS) {
      this.groups.set(group.groupId, group);
    }
  }
  
  // 检查Buff互斥
  checkExclusive(newBuff: BuffConfig, existingBuffs: BuffInstance[]): ExclusiveResult {
    for (const [groupId, group] of this.groups) {
      if (!group.exclusiveBuffs.includes(newBuff.buffType)) {
        continue;
      }
      
      // 查找组内已有的Buff
      const conflicting = existingBuffs.find(b => 
        group.exclusiveBuffs.includes(b.config.buffType) &&
        b.config.buffId !== newBuff.buffId
      );
      
      if (conflicting) {
        const resolution = this.resolveConflict(group, newBuff, conflicting);
        
        return {
          isExclusive: true,
          groupId,
          conflictWith: conflicting,
          resolution
        };
      }
    }
    
    return { isExclusive: false };
  }
  
  // 解决冲突
  private resolveConflict(
    group: ExclusiveGroup,
    newBuff: BuffConfig,
    existingBuff: BuffInstance
  ): ConflictResolution {
    let toRemove: BuffInstance | null = null;
    let toKeep: BuffConfig | BuffInstance = newBuff;
    
    switch (group.conflictResolution) {
      case 'remove_lower':
        if (this.comparePriority(newBuff, existingBuff) > 0) {
          toRemove = existingBuff;
        } else {
          toRemove = newBuff;
          toKeep = existingBuff;
        }
        break;
      
      case 'remove_both':
        toRemove = existingBuff;
        // newBuff也不添加
        return { removeNew: true, removeExisting: existingBuff };
      
      case 'keep_both':
        // 不处理冲突，都保留
        return { removeNew: false, removeExisting: null };
    }
    
    return {
      removeNew: toRemove === newBuff,
      removeExisting: toRemove === existingBuff ? existingBuff : null
    };
  }
  
  // 比较优先级
  private comparePriority(buff1: BuffConfig | BuffInstance, buff2: BuffInstance): number {
    const p1 = 'priority' in buff1 ? buff1.priority : buff1.config.priority;
    const p2 = buff2.config.priority;
    return p1 - p2;
  }
}
```

---

## 五、状态刷新机制

### 5.1 刷新类型定义

```typescript
// 刷新类型
enum RefreshType {
  DURATION = 'duration',       // 刷新持续时间
  INTENSITY = 'intensity',     // 刷新强度
  BOTH = 'both',               // 刷新全部
  STACK = 'stack',             // 增加一层
}

// 刷新触发条件
interface RefreshTrigger {
  type: 'onHit' | 'onDamage' | 'onHeal' | 'onKill' | 'onTurnStart' | 'onTurnEnd';
  condition?: (context: BattleContext) => boolean;
  target?: 'self' | 'caster' | 'attacker';
}

// Buff刷新配置
interface BuffRefreshConfig {
  buffId: string;
  refreshType: RefreshType;
  
  triggers: RefreshTrigger[];
  
  // 刷新效果
  durationRefresh?: number;    // 刷新后持续时间
  intensityRefresh?: number;   // 刷新后强度
  maxRefreshStacks?: number;   // 最大刷新层数
}
```

### 5.2 刷新实现

```typescript
// Buff刷新管理器
class BuffRefreshManager {
  private refreshConfigs: Map<string, BuffRefreshConfig>;
  
  // 触发刷新
  triggerRefresh(
    unit: CombatUnit,
    triggerType: string,
    context: BattleContext
  ): void {
    const buffs = this.buffManager.getBuffs(unit);
    
    for (const buff of buffs) {
      const config = this.refreshConfigs.get(buff.config.buffId);
      if (!config) continue;
      
      // 检查触发条件
      if (!this.matchTrigger(config.triggers, triggerType, context, unit)) {
        continue;
      }
      
      // 执行刷新
      this.refreshBuff(unit, buff, config);
    }
  }
  
  // 刷新单个Buff
  private refreshBuff(
    unit: CombatUnit,
    buff: BuffInstance,
    config: BuffRefreshConfig
  ): void {
    switch (config.refreshType) {
      case RefreshType.DURATION:
        buff.remainingDuration = config.durationRefresh || buff.config.duration;
        break;
      
      case RefreshType.INTENSITY:
        buff.intensity = config.intensityRefresh || buff.config.baseIntensity;
        break;
      
      case RefreshType.BOTH:
        buff.remainingDuration = config.durationRefresh || buff.config.duration;
        buff.intensity = config.intensityRefresh || buff.config.baseIntensity;
        break;
      
      case RefreshType.STACK:
        const maxStack = buff.config.maxStack || 1;
        if (buff.stack < maxStack) {
          buff.stack++;
          this.updateStackEffects(unit, buff);
        } else {
          // 达到最大层数，刷新持续时间
          buff.remainingDuration = config.durationRefresh || buff.config.duration;
        }
        break;
    }
    
    // 触发刷新事件
    this.eventSystem.emit('onBuffRefreshed', { unit, buff, config });
  }
  
  // 匹配触发条件
  private matchTrigger(
    triggers: RefreshTrigger[],
    triggerType: string,
    context: BattleContext,
    unit: CombatUnit
  ): boolean {
    return triggers.some(t => {
      if (t.type !== triggerType) return false;
      if (t.condition && !t.condition(context)) return false;
      return true;
    });
  }
}
```

---

## 六、状态持续时间计算

### 6.1 持续时间类型

```typescript
// 持续时间类型
enum DurationType {
  INSTANT = 'instant',           // 瞬时（立即生效后消失）
  BATTLE = 'battle',             // 整场战斗（除非被清除）
  TURN_BASED = 'turn_based',      // 回合制（按回合计算）
  TICK_BASED = 'tick_based',      // Tick制（按固定时间计算）
  CONDITION = 'condition',        // 条件制（满足条件消失）
}

// 持续时间配置
interface DurationConfig {
  type: DurationType;
  
  // 回合制配置
  turns?: number;
  
  // Tick制配置
  ticks?: number;
  tickInterval?: number;         // tick间隔(ms)
  
  // 条件制配置
  endCondition?: {
    type: 'hp_below' | 'hp_above' | 'buff_count' | 'unit_count';
    value?: number;
  };
  
  // 特殊规则
  reducedByControl?: boolean;     // 被控制时是否减少
  pauseOnSleep?: boolean;         // 睡眠时是否暂停
}
```

### 6.2 持续时间管理器

```typescript
// 持续时间管理器
class DurationManager {
  
  // 计算Buff剩余持续时间
  calculateRemainingDuration(
    buff: BuffInstance,
    currentTime: number
  ): number {
    const config = buff.config.duration;
    
    switch (config.type) {
      case DurationType.INSTANT:
        return 0;
      
      case DurationType.BATTLE:
        return Infinity;
      
      case DurationType.TURN_BASED:
        return buff.remainingTurns;
      
      case DurationType.TICK_BASED:
        return buff.remainingTicks * config.tickInterval;
      
      case DurationType.CONDITION:
        return this.checkCondition(buff, currentTime);
    }
  }
  
  // 回合开始处理
  onTurnStart(unit: CombatUnit, turnNumber: number): void {
    const buffs = this.buffManager.getBuffs(unit);
    
    for (const buff of buffs) {
      const config = buff.config.duration;
      
      // 跳过不减少的类型
      if (config.type === DurationType.INSTANT || config.type === DurationType.BATTLE) {
        continue;
      }
      
      // 睡眠时暂停
      if (config.pauseOnSleep && unit.hasControlEffect('sleep')) {
        continue;
      }
      
      // 控制时减少（需要配置）
      if (config.reducedByControl && unit.hasControlEffect()) {
        buff.remainingTurns = Math.max(0, buff.remainingTurns - 1);
      } else if (config.type === DurationType.TURN_BASED) {
        buff.remainingTurns = Math.max(0, buff.remainingTurns - 1);
      }
      
      // 检查是否到期
      if (this.isExpired(buff)) {
        this.buffManager.removeBuff(unit, buff, 'expired');
      }
    }
  }
  
  // Tick处理（DOT/HOT）
  onTick(unit: CombatUnit, tickNumber: number): void {
    const buffs = this.buffManager.getBuffs(unit);
    
    for (const buff of buffs) {
      if (buff.config.duration.type !== DurationType.TICK_BASED) {
        continue;
      }
      
      // 执行DOT/HOT效果
      this.executeTickEffect(unit, buff);
      
      // 减少Tick
      buff.remainingTicks--;
      
      // 检查是否到期
      if (buff.remainingTicks <= 0) {
        this.buffManager.removeBuff(unit, buff, 'expired');
      }
    }
  }
  
  // 检查条件是否满足
  private checkCondition(buff: BuffInstance, currentTime: number): number {
    const config = buff.config.duration.endCondition;
    if (!config) return Infinity;
    
    const unit = this.getUnitByBuff(buff);
    
    switch (config.type) {
      case 'hp_below':
        if (unit.currentHp / unit.maxHp <= (config.value || 0.5)) {
          return 0; // 触发条件，立即结束
        }
        return Infinity;
      
      case 'hp_above':
        if (unit.currentHp / unit.maxHp >= (config.value || 0.8)) {
          return 0;
        }
        return Infinity;
      
      default:
        return Infinity;
    }
  }
}
```

---

## 七、状态UI显示规范

### 7.1 Buff图标显示规范

```typescript
// Buff图标配置
interface BuffIconConfig {
  buffId: string;
  iconPath: string;              // 图标资源路径
  iconFrame?: string;            // 图标边框
  
  // 显示参数
  showStack: boolean;            // 是否显示层数
  stackPosition: 'corner' | 'bottom' | 'overlay';
  stackFormat: 'number' | 'bar' | 'both';
  
  // 动画配置
  idleAnimation?: string;        // 待机动画
  addAnimation?: string;         // 添加动画
  removeAnimation?: string;      // 移除动画
  expiredAnimation?: string;      // 即将过期动画
  
  // 颜色配置
  borderColor: string;           // 边框颜色
  backgroundColor: string;      // 背景颜色
  glowColor?: string;           // 发光颜色
}

// Buff图标层级
enum BuffIconLayer {
  CONTROL = 100,                 // 控制状态（最高）
  SHIELD = 90,
  BUFF = 80,
  DEBUFF = 70,
  DOT = 60,
  MARK = 50,
}

// 各类Buff的默认显示配置
const DEFAULT_BUFF_ICONS: Record<string, BuffIconConfig> = {
  stun: {
    iconPath: 'icons/buff/stun.png',
    showStack: false,
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    idleAnimation: 'pulse_red',
    priority: 100
  },
  
  freeze: {
    iconPath: 'icons/buff/freeze.png',
    showStack: true,
    stackPosition: 'corner',
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
    idleAnimation: 'shimmer_ice',
    priority: 100
  },
  
  silence: {
    iconPath: 'icons/buff/silence.png',
    showStack: false,
    borderColor: '#9B59B6',
    backgroundColor: 'rgba(155, 89, 182, 0.3)',
    priority: 90
  },
  
  poison: {
    iconPath: 'icons/debuff/poison.png',
    showStack: true,
    stackPosition: 'corner',
    stackFormat: 'number',
    borderColor: '#2ECC71',
    backgroundColor: 'rgba(46, 204, 113, 0.3)',
    idleAnimation: 'drip',
    priority: 70
  },
  
  shield: {
    iconPath: 'icons/buff/shield.png',
    showStack: true,
    stackPosition: 'overlay',
    stackFormat: 'bar',
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    glowColor: 'rgba(33, 150, 243, 0.5)',
    priority: 90
  },
  
  atk_up: {
    iconPath: 'icons/buff/atk_up.png',
    showStack: true,
    stackPosition: 'corner',
    borderColor: '#FF5722',
    backgroundColor: 'rgba(255, 87, 34, 0.3)',
    priority: 80
  },
  
  def_up: {
    iconPath: 'icons/buff/def_up.png',
    showStack: true,
    stackPosition: 'corner',
    borderColor: '#3F51B5',
    backgroundColor: 'rgba(63, 81, 181, 0.3)',
    priority: 80
  }
};
```

### 7.2 Buff状态条显示

```typescript
// Buff状态条配置
interface BuffStatusBarConfig {
  displayMode: 'icon_bar' | 'text_only' | 'hybrid';
  
  // 图标条模式
  iconBar: {
    maxVisibleIcons: number;    // 最多显示图标数
    overflowIndicator: string;   // 溢出指示器
    iconSize: number;            // 图标大小
    iconGap: number;             // 图标间距
  };
  
  // 文本模式
  textBar: {
    showDuration: boolean;
    durationFormat: 'turns' | 'seconds' | 'both';
    abbreviated: boolean;       // 缩写形式
  };
  
  // 溢出菜单
  overflowMenu: {
    enabled: boolean;
    sortBy: 'priority' | 'duration' | 'type';
    groupBy: 'category' | 'none';
  };
}

// 默认状态条配置
const DEFAULT_STATUS_BAR_CONFIG: BuffStatusBarConfig = {
  displayMode: 'icon_bar',
  iconBar: {
    maxVisibleIcons: 8,
    overflowIndicator: '+N',
    iconSize: 32,
    iconGap: 4
  },
  textBar: {
    showDuration: true,
    durationFormat: 'turns',
    abbreviated: true
  },
  overflowMenu: {
    enabled: true,
    sortBy: 'priority',
    groupBy: 'category'
  }
};
```

### 7.3 Buff效果提示

```typescript
// Buff效果提示配置
interface BuffTooltipConfig {
  // 显示内容
  showName: boolean;
  showDuration: boolean;
  showStacks: boolean;
  showEffects: boolean;
  showSource: boolean;          // 来源（谁施加的）
  
  // 格式化
  durationFormat: 'remaining' | 'elapsed';
  effectFormat: 'detailed' | 'summary';
  
  // 特殊提示
  showOnHover: boolean;
  highlightOnClick: boolean;
  
  // 颜色方案
  positiveColor: string;        // 正面效果
  negativeColor: string;        // 负面效果
  neutralColor: string;         // 中性效果
}

// Buff提示模板
const BUFF_TOOLTIP_TEMPLATE = `
  <div class="buff-tooltip">
    <div class="tooltip-header">
      <img class="tooltip-icon" src="{icon}" />
      <span class="tooltip-name" style="color: {nameColor}">{name}</span>
      {stackIndicator}
    </div>
    <div class="tooltip-body">
      <div class="tooltip-effects">
        {effects}
      </div>
      <div class="tooltip-footer">
        {sourceIndicator}
        <span class="tooltip-duration">{duration}</span>
      </div>
    </div>
  </div>
`;
```

---

## 八、实现要点总结

### 8.1 核心功能清单

| 功能 | 实现要点 | 优先级 |
|------|----------|--------|
| Buff基础结构 | 统一的Buff数据模型 | P0 |
| 叠加规则 | 支持多种叠加类型 | P0 |
| 互斥规则 | 互斥组配置和管理 | P0 |
| 持续时间 | 多类型持续时间计算 | P0 |
| 状态效果 | 23种状态效果实现 | P0 |
| UI显示 | 图标、状态条、提示 | P1 |
| 事件系统 | 状态变化事件 | P1 |

### 8.2 性能优化

1. **查询优化**
   - 按类型索引Buff
   - 按单位索引Buff
   - 缓存常用查询结果

2. **更新优化**
   - 批量更新同类Buff
   - 延迟非关键更新
   - 使用脏标记

3. **显示优化**
   - 图标懒加载
   - 可见区域优先加载
   - 动画节流

---

*文档版本：v1.0 | 最后更新：2026-04-24*
