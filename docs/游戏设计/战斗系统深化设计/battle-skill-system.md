# 战斗技能效果系统设计方案

> 版本：1.0
> 日期：2026年4月24日
> 游戏：《苍穹劫·摸金传人》
> 状态：深化设计文档

---

## 一、文档概述

### 1.1 目的与范围

本文档定义战斗技能效果系统的完整设计方案，包括技能效果类型定义、40个英雄技能详细设计、Boss特殊机制设计、技能效果触发流程和技能特效需求说明。本系统是战斗系统的核心输出模块。

### 1.2 设计原则

- **效果可组合**：支持多效果叠加和条件触发
- **目标灵活**：支持单体、群体、自定义筛选
- **动画可分离**：技能效果与视觉表现解耦
- **性能优先**：技能执行效率优化

---

## 二、技能效果类型定义

### 2.1 效果类型分类

```typescript
// 技能效果类型枚举
enum SkillEffectType {
  // ===== 伤害类 =====
  DAMAGE = 'damage',                    // 伤害
  REAL_DAMAGE = 'real_damage',         // 真实伤害（无视防御）
  PIERCE_DAMAGE = 'pierce_damage',     // 穿透伤害（无视护盾）
  DOT_DAMAGE = 'dot_damage',           // 持续伤害
  
  // ===== 治疗类 =====
  HEAL = 'heal',                       // 治疗
  HOT_HEAL = 'hot_heal',               // 持续治疗
  
  // ===== 增益类 =====
  BUFF_ATK = 'buff_atk',               // 攻击力提升
  BUFF_DEF = 'buff_def',               // 防御力提升
  BUFF_SPD = 'buff_spd',               // 速度提升
  BUFF_CRIT = 'buff_crit',             // 暴击率提升
  BUFF_CRIT_DMG = 'buff_crit_dmg',     // 暴击伤害提升
  BUFF_DAMAGE_BONUS = 'buff_damage_bonus', // 伤害加成
  IMMUNE_CONTROL = 'immune_control',   // 免疫控制
  SHIELD = 'shield',                   // 护盾
  
  // ===== 减益类 =====
  DEBUFF_ATK = 'debuff_atk',           // 攻击力降低
  DEBUFF_DEF = 'debuff_def',           // 防御力降低
  DEBUFF_SPD = 'debuff_spd',           // 速度降低
  DEBUFF_CRIT = 'debuff_crit',         // 暴击率降低
  
  // ===== 控制类 =====
  STUN = 'stun',                       // 眩晕
  FREEZE = 'freeze',                   // 冰冻
  SILENCE = 'silence',                 // 沉默
  SLEEP = 'sleep',                     // 睡眠
  FEAR = 'fear',                       // 恐惧
  CONFUSION = 'confusion',             // 混乱
  taunt = 'taunt',                     // 嘲讽
  CHARM = 'charm',                     // 魅惑
  BIND = 'bind',                       // 束缚（禁止移动）
  
  // ===== 特殊类 =====
  SUMMON = 'summon',                   // 召唤
  REVIVE = 'revive',                   // 复活
  DISPEL = 'dispel',                   // 驱散
  TRANSFER_ANGER = 'transfer_anger',  // 转移怒气
  GAIN_ANGER = 'gain_anger',          // 获取怒气
  REDUCE_ANGER = 'reduce_anger',     // 减少怒气
  EXTRA_ACTION = 'extra_action',       // 额外行动
  COUNTER = 'counter',                 // 反击
  REFLECT = 'reflect',                 // 伤害反弹
  ABSORB = 'absorb',                   // 伤害吸收
  MARK = 'mark',                       // 标记
  CLEAVE = 'cleave',                  // 顺劈
  AREA_DAMAGE = 'area_damage',        // AOE溅射
}
```

### 2.2 效果参数结构

```typescript
// 基础效果参数
interface SkillEffectParams {
  // 通用参数
  value?: number;                      // 效果值
  valueType?: ValueType;               // 数值类型：固定值/百分比
  coefficient?: number;                 // 系数（基于攻击/生命等）
  target?: EffectTarget;               // 效果目标
  triggerChance?: number;             // 触发几率 (0-1)
  
  // 持续时间
  duration?: number;                   // 持续回合数
  durationType?: DurationType;         // 持续类型：战斗/回合/永久
  
  // 叠加规则
  stackType?: StackType;              // 叠加类型
  maxStack?: number;                   // 最大层数
  
  // 伤害相关
  damageType?: DamageType;            // 伤害类型
  canCrit?: boolean;                   // 是否可暴击
  
  // 条件触发
  condition?: TriggerCondition;        // 触发条件
}

// 伤害效果参数
interface DamageEffectParams extends SkillEffectParams {
  damageType: 'physical' | 'magic' | 'true';
  damageCoeff: number;                  // 伤害系数
  extraDamage?: number;                 // 额外伤害
  cleaveRange?: number;               // 顺劈范围
}

// 治疗效果参数
interface HealEffectParams extends SkillEffectParams {
  healType: 'normal' | 'hot';
  basedOnLost?: boolean;              // 基于损失生命计算
  critHeal?: boolean;                 // 是否可暴击
}

// 控制效果参数
interface ControlEffectParams extends SkillEffectParams {
  controlType: ControlType;
  canBeResisted?: boolean;            // 是否可被抵抗
  immunityBuff?: string;               // 免疫BuffID
}
```

### 2.3 效果计算公式

```typescript
// 技能效果计算器
class SkillEffectCalculator {
  
  // 伤害计算
  static calculateDamage(
    attacker: CombatUnit,
    defender: CombatUnit,
    params: DamageEffectParams
  ): DamageResult {
    // 基础伤害
    let baseDamage = attacker.attack * params.damageCoeff;
    
    // 伤害类型加成
    if (params.damageType === 'physical') {
      baseDamage *= (1 + attacker.physicalBonus - defender.physicalResist);
    } else if (params.damageType === 'magic') {
      baseDamage *= (1 + attacker.magicBonus - defender.magicResist);
    }
    // true damage 不受减免
    
    // 防御减免
    if (params.damageType !== 'true') {
      const defReduction = defender.defense / (defender.defense + 1000);
      baseDamage *= (1 - defReduction);
    }
    
    // 暴击判定
    let isCrit = false;
    let critMultiplier = 1;
    if (params.canCrit !== false && Math.random() < attacker.critRate) {
      isCrit = true;
      critMultiplier = attacker.critDamage;
    }
    
    // 伤害浮动
    const floatMultiplier = 0.95 + Math.random() * 0.15;
    
    // 最终伤害
    const finalDamage = Math.floor(baseDamage * critMultiplier * floatMultiplier);
    
    return {
      damage: Math.max(1, finalDamage),
      isCrit,
      damageType: params.damageType
    };
  }
  
  // 治疗计算
  static calculateHeal(
    healer: CombatUnit,
    target: CombatUnit,
    params: HealEffectParams
  ): HealResult {
    let baseHeal = 0;
    
    if (params.valueType === 'percent') {
      baseHeal = target.maxHp * (params.coefficient || 0);
    } else {
      baseHeal = params.coefficient 
        ? healer.attack * params.coefficient 
        : params.value || 0;
    }
    
    // 基于损失生命的治疗
    if (params.basedOnLost) {
      baseHeal *= (target.maxHp - target.currentHp) / target.maxHp;
    }
    
    return {
      heal: Math.floor(baseHeal),
      actualHeal: Math.min(baseHeal, target.maxHp - target.currentHp)
    };
  }
  
  // 属性加成/减益计算
  static calculateAttributeChange(
    unit: CombatUnit,
    params: AttributeChangeParams
  ): AttributeChangeResult {
    let changeRate = params.value;
    
    // 百分比计算
    if (params.valueType === 'percent') {
      changeRate = unit.baseAttributes[params.attribute] * params.value;
    }
    
    // 上限检查
    if (params.maxValue !== undefined) {
      changeRate = Math.min(changeRate, params.maxValue);
    }
    
    return { changeRate, attribute: params.attribute };
  }
}
```

---

## 三、40个英雄技能详细设计

### 3.1 星纹摸金传承（10英雄）

#### 3.1.1 摸金手 (SR) - HERO_XW_001

**传承定位**：输出型传承，擅长暴击与穿透

**技能1：星纹箭（普攻）**
```yaml
技能ID: SKILL_XW_001_A
名称: 星纹箭
类型: 物理伤害
目标: 单体
伤害系数: 100%
怒气获取: 10

效果:
  - type: damage
    damageType: physical
    damageCoeff: 1.0
    canCrit: true

动画描述:
  - 蓄力0.3秒，弩箭发出金色光芒
  - 箭矢飞行轨迹带有星尘拖尾
  - 命中时星光爆裂
```

**技能2：穿甲星矢（怒攻）**
```yaml
技能ID: SKILL_XW_001_B
名称: 穿甲星矢
类型: 物理伤害
目标: 单体
怒气消耗: 100
伤害系数: 280%

效果:
  - type: damage
    damageType: physical
    damageCoeff: 2.8
    canCrit: true
  - type: debuff_def
    value: -0.30
    duration: 2
    triggerChance: 1.0

特效:
  - 金色星纹光芒包裹箭矢
  - 命中时敌人身上出现破甲符文
  - 屏幕轻微震动
```

**被动：星纹猎手**
```yaml
技能ID: SKILL_XW_001_P
名称: 星纹猎手
类型: 被动

触发条件: 攻击时

效果:
  - type: mark
    buffId: BUFF_STAR_MARK
    triggerChance: 0.15
    duration: 1

标记效果:
  - 下回合受到伤害+20%
```

---

#### 3.1.2 小星 (N) - HERO_XW_002

**技能1：暗影突刺（普攻）**
```yaml
技能ID: SKILL_XW_002_A
名称: 暗影突刺
类型: 物理伤害
目标: 单体
伤害系数: 95%
怒气获取: 12
```

**技能2：星纹穿刺（怒攻）**
```yaml
技能ID: SKILL_XW_002_B
名称: 星纹穿刺
类型: 物理伤害
目标: 生命最低敌人
怒气消耗: 100
伤害系数: 220%

效果:
  - type: damage
    damageCoeff: 2.2
    targetFilter: lowest_hp
```

**被动：轻盈脚步**
```yaml
技能ID: SKILL_XW_002_P
名称: 轻盈脚步
类型: 被动

效果:
  - type: buff_spd
    value: 10
    durationType: permanent
  - type: buff_dodge
    value: 0.05
    durationType: permanent
```

---

#### 3.1.3 老周 (SR) - HERO_XW_003

**技能1：重锤击（普攻）**
```yaml
技能ID: SKILL_XW_003_A
名称: 重锤击
类型: 物理伤害
目标: 单体
伤害系数: 110%
怒气获取: 10

附加效果:
  - type: stun
    triggerChance: 0.10
    duration: 1
```

**技能2：星纹爆裂（怒攻）**
```yaml
技能ID: SKILL_XW_003_B
名称: 星纹爆裂
类型: 物理伤害
目标: 目标及周围2格
怒气消耗: 120
伤害系数: 320%

效果:
  - type: area_damage
    damageCoeff: 3.2
    range: 2
```

**被动：破甲专精**
```yaml
技能ID: SKILL_XW_003_P
名称: 破甲专精
类型: 被动

效果:
  - type: debuff_def
    value: -0.15
    duration: 2
    triggerChance: 1.0
    condition: on_attack
```

---

#### 3.1.4 摸金校尉 (SSR) - HERO_XW_004

**技能1：精准射击（普攻）**
```yaml
技能ID: SKILL_XW_004_A
名称: 精准射击
类型: 物理伤害
目标: 单体
伤害系数: 115%
怒气获取: 15
必定暴击: true
```

**技能2：星陨天降（怒攻）**
```yaml
技能ID: SKILL_XW_004_B
名称: 星陨天降
类型: 物理伤害
目标: 单体
怒气消耗: 150
伤害系数: 500%

效果:
  - type: damage
    damageCoeff: 5.0
  - type: buff_crit_dmg
    value: 0.50
    duration: 1
    triggerChance: 1.0
    condition: self
    afterSkill: true
```

**被动：星纹大师**
```yaml
技能ID: SKILL_XW_004_P
名称: 星纹大师
类型: 被动

效果:
  - type: buff_crit
    value: 0.25
    durationType: permanent
  - type: buff_crit_dmg
    value: 0.30
    durationType: permanent
```

---

#### 3.1.5-3.1.10 其他星纹摸金英雄（简略）

| 英雄ID | 名称 | 品质 | 普攻 | 怒攻特点 | 被动 |
|--------|------|------|------|----------|------|
| HERO_XW_005 | 黑衣人 | SR | 暗袭95% | 星纹穿心260%，优先后排 | 背刺精通25%后排增伤 |
| HERO_XW_006 | 星箭 | R | 星矢100% | 星链锁敌200%+减怒 | 连击20%连击2次 |
| HERO_XW_007 | 铁蛋 | N | 石弹95% | 星落如雨180%随机3目标 | 新手幸运杀敌回怒 |
| HERO_XW_008 | 星尘 | R | 星光80% | 星之指引给队友必暴 | 星光护盾全队减伤5% |
| HERO_XW_009 | 穿山甲 | R | 利爪100% | 地穴突袭240%后排随机 | 挖洞专家隐身1回合 |
| HERO_XW_010 | 追星者 | SR | 追星箭105% | 流星火雨350%AOE+灼烧 | 追星逐月20%额外行动 |

---

### 3.2 璇玑搬山传承（10英雄）

#### 3.2.1 星祭司 (SSR) - HERO_XY_001

**技能1：璇玑弹（普攻）**
```yaml
技能ID: SKILL_XY_001_A
名称: 璇玑弹
类型: 法术伤害
目标: 单体
伤害系数: 90%
怒气获取: 12
```

**技能2：搬山填海（怒攻）**
```yaml
技能ID: SKILL_XY_001_B
名称: 搬山填海
类型: 法术伤害
目标: 敌方全体
怒气消耗: 150
伤害系数: 400%

效果:
  - type: damage
    damageType: magic
    damageCoeff: 4.0
  - type: stun
    triggerChance: 0.25
    duration: 1
```

**被动：阵法加持**
```yaml
技能ID: SKILL_XY_001_P
名称: 阵法加持
类型: 被动

触发条件: 释放技能时

效果:
  - type: special
    triggerChance: 0.15
    effect: 不消耗怒气
```

---

#### 3.2.2 搬山客 (SR) - HERO_XY_002

**技能1：搬山诀（普攻）**
```yaml
技能ID: SKILL_XY_002_A
名称: 搬山诀
类型: 法术伤害
目标: 单体
伤害系数: 85%
怒气获取: 10
```

**技能2：璇玑困锁（怒攻）**
```yaml
技能ID: SKILL_XY_002_B
名称: 璇玑困锁
类型: 控制+伤害
目标: 单体
怒气消耗: 120
伤害系数: 180%

效果:
  - type: damage
    damageCoeff: 1.8
  - type: bind
    duration: 2
    triggerChance: 1.0
```

**被动：机关识破**
```yaml
技能ID: SKILL_XY_002_P
名称: 机关识破
类型: 被动

效果:
  - type: special
    effect: 受到机关伤害-40%
  - type: special
    effect: 可识破隐形敌人
```

---

#### 3.2.3-3.2.10 其他璇玑搬山英雄

| 英雄ID | 名称 | 品质 | 普攻 | 怒攻特点 | 被动 |
|--------|------|------|------|----------|------|
| HERO_XY_003 | 小璇 | N | 符咒75% | 护盾符给队友护盾 | 符纸精通初始+30怒 |
| HERO_XY_004 | 机关师 | SR | 机关弹100% | 连环机关280%+放置机关 | 工匠之心机关伤害+20% |
| HERO_XY_005 | 阵法师 | R | 阵旗80% | 迷阵困敌减速30%全队2回合 | 阵法精通控制延长1回合 |
| HERO_XY_006 | 破阵者 | R | 破阵击100% | 破甲爆破250%无视20%防 | 弱点识破对护盾+35% |
| HERO_XY_007 | 傀儡师 | SR | 傀儡击90% | 傀儡大军召唤3个傀儡 | 傀儡强化傀儡属性+30% |
| HERO_XY_008 | 璇玑使者 | R | 符弹85% | 璇玑锁链定身2回合 | 符咒精通Buff效果+15% |
| HERO_XY_009 | 机关猎手 | SR | 机括箭100% | 捕兽机关陷阱敌人2回合 | 陷阱识破反踩陷阱 |
| HERO_XY_010 | 搬山道 | SSR | 搬山掌110% | 填海移山全体350%+破防 | 移山倒海全体攻击+15% |

---

### 3.3 辰宿卸岭传承（10英雄）

#### 3.3.1 卸岭勇士 (SR) - HERO_CS_001

**技能1：重拳（普攻）**
```yaml
技能ID: SKILL_CS_001_A
名称: 重拳
类型: 物理伤害
目标: 单体
伤害系数: 105%
怒气获取: 12
```

**技能2：卸岭裂石（怒攻）**
```yaml
技能ID: SKILL_CS_001_B
名称: 卸岭裂石
类型: 物理伤害
目标: 单体
怒气消耗: 120
伤害系数: 350%

效果:
  - type: damage
    damageCoeff: 3.5
  - type: debuff_def
    value: -0.25
    duration: 2
```

**被动：大地之力**
```yaml
技能ID: SKILL_CS_001_P
名称: 大地之力
类型: 被动

触发条件: 回合结束

效果:
  - type: hot_heal
    value: 0.05
    duration: 1
```

---

#### 3.3.2 护甲师 (SR) - HERO_CS_002

**技能1：护甲击（普攻）**
```yaml
技能ID: SKILL_CS_002_A
名称: 护甲击
类型: 物理伤害
目标: 单体
伤害系数: 80%
怒气获取: 15
```

**技能2：土系护盾（怒攻）**
```yaml
技能ID: SKILL_CS_002_B
名称: 土系护盾
类型: 护盾
目标: 全体队友
怒气消耗: 100

效果:
  - type: shield
    value: 0.20
    duration: 3
    basedOn: self_max_hp
```

**被动：卸岭甲胄**
```yaml
技能ID: SKILL_CS_002_P
名称: 卸岭甲胄
类型: 被动

效果:
  - type: buff_def
    value: 0.15
    durationType: permanent
  - type: buff_damage_reduction
    value: 0.10
    durationType: permanent
```

---

#### 3.3.3-3.3.10 其他辰宿卸岭英雄

| 英雄ID | 名称 | 品质 | 普攻 | 怒攻特点 | 被动 |
|--------|------|------|------|----------|------|
| HERO_CS_003 | 反击者 | R | 反手击100% | 反弹攻击造成150%反击 | 荆棘反伤15%伤害 |
| HERO_CS_004 | 守护者 | SR | 盾击90% | 守护之盾保护队友2回合 | 守护天赋被保护目标减伤30% |
| HERO_CS_005 | 土系专家 | R | 土弹85% | 土墙阻挡全体减伤20% | 土系精通土系效果+20% |
| HERO_CS_006 | 卸岭弟子 | N | 基础拳100% | 地裂斩150%单体 | 坚韧受到伤害-10% |
| HERO_CS_007 | 战意大师 | SR | 战意拳110% | 战意爆发全体攻击+25% | 战意激励队友击杀回怒 |
| HERO_CS_008 | 铁壁 | SSR | 铁拳100% | 铜墙铁壁全体护盾+30%HP | 铁壁防御护盾效果+50% |
| HERO_CS_009 | 狂暴者 | R | 乱拳100% | 狂暴连击攻击3次各80% | 狂暴之血HP<50%时攻击+30% |
| HERO_CS_010 | 磐石 | SR | 磐石拳100% | 固若金汤全体减伤+护盾 | 磐石之心护盾持续+1回合 |

---

### 3.4 天枢发丘传承（10英雄）

#### 3.4.1 发丘天官 (SSR) - HERO_TS_001

**技能1：天官指（普攻）**
```yaml
技能ID: SKILL_TS_001_A
名称: 天官指
类型: 法术伤害
目标: 单体
伤害系数: 85%
怒气获取: 12
```

**技能2：天枢指引（怒攻）**
```yaml
技能ID: SKILL_TS_001_B
名称: 天枢指引
类型: 增益+治疗
目标: 攻击力最高队友

怒气消耗: 100

效果:
  - type: buff_atk
    value: 0.30
    duration: 2
  - type: heal
    value: 0.15
    basedOnLost: true
  - type: buff_crit
    value: 0.20
    duration: 2
```

**被动：天命回春**
```yaml
技能ID: SKILL_TS_001_P
名称: 天命回春
类型: 被动

触发条件: 队友死亡时

效果:
  - type: revive
    triggerChance: 0.20
    reviveHp: 0.30
```

---

#### 3.4.2 治愈师 (SR) - HERO_TS_002

**技能1：治愈术（普攻）**
```yaml
技能ID: SKILL_TS_002_A
名称: 治愈术
类型: 法术伤害+治疗
目标: 单体
伤害系数: 70%
怒气获取: 10

治疗效果:
  - type: heal
    value: 0.10
    target: self
```

**技能2：群体治愈（怒攻）**
```yaml
技能ID: SKILL_TS_002_B
名称: 群体治愈
类型: 治疗
目标: 全体队友
怒气消耗: 120

效果:
  - type: heal
    value: 0.25
    basedOnLost: true
```

**被动：治愈精通**
```yaml
技能ID: SKILL_TS_002_P
名称: 治愈精通
类型: 被动

效果:
  - type: special
    effect: 治疗效果+25%
  - type: hot_heal
    value: 0.03
    duration: 2
    condition: on_heal
```

---

#### 3.4.3-3.4.10 其他天枢发丘英雄

| 英雄ID | 名称 | 品质 | 普攻 | 怒攻特点 | 被动 |
|--------|------|------|------|----------|------|
| HERO_TS_003 | 辅助弟子 | N | 辅助拳80% | 鼓舞士气队友攻击+15% | 辅助之心辅助效果+10% |
| HERO_TS_004 | 驱魔师 | SR | 驱魔符100% | 驱魔咒全体驱散减益 | 驱魔精通驱散效果+50% |
| HERO_TS_005 | 护身符师 | R | 符咒85% | 护身符给队友免疫控制1回合 | 符咒强化护身符持续+1 |
| HERO_TS_006 | 复活专家 | R | 治愈拳90% | 复活术复活队友50%HP | 复活精通复活后+20%属性 |
| HERO_TS_007 | 天枢弟子 | N | 天枢拳85% | 天枢标记标记敌人易伤20% | 天枢传承标记伤害+15% |
| HERO_TS_008 | 祝福师 | SR | 祝福击100% | 全体祝福攻击+20%速度+10 | 祝福精通Buff持续+1回合 |
| HERO_TS_009 | 驱鬼道人 | R | 驱鬼剑100% | 驱鬼阵法全体驱散+伤害 | 驱鬼秘术对鬼系伤害+40% |
| HERO_TS_010 | 天医 | SSR | 天医针100% | 妙手回春全体治疗+驱散 | 天医圣手治疗暴击+30% |

---

## 四、Boss特殊机制设计

### 4.1 主线Boss（8个）

#### 4.1.1 守墓鬼将 (Boss_001) - 第1章Boss

**基础属性**：
- 等级：10
- HP：8000（普通小怪约300）
- 攻击：350
- 防御：150
- 速度：70

**技能配置**：

**普攻：鬼爪**
```yaml
伤害: 100%攻击
特效: 无
```

**技能1：鬼影连击**
```yaml
类型: 物理伤害
目标: 单体
伤害系数: 180%
触发: 每3回合

效果:
  - 连续攻击同一目标2次
```

**技能2：召唤亡魂**
```yaml
类型: 召唤
触发: HP<70%

效果:
  - 召唤2只跳尸助战
  - 跳尸属性为标准的80%
```

**技能3：鬼将咆哮**
```yaml
类型: 物理伤害
目标: 全体
伤害系数: 250%
触发: HP<30%

效果:
  - 全体伤害
  - 附加恐惧效果1回合(20%几率)
```

**Boss机制：守墓之威**
```yaml
阶段1 (HP>50%):
  - 正常攻击模式
  - 每3回合使用鬼影连击

阶段2 (HP<50%):
  - 召唤亡魂
  - 伤害+20%
  - 速度+15

阶段3 (HP<30%):
  - 鬼将咆哮
  - 进入狂暴状态
  - 每回合回复5%HP
```

---

#### 4.1.2 青龙守护 (Boss_002) - 第2章Boss

**基础属性**：
- 等级：15
- HP：15000
- 攻击：480
- 防御：220
- 速度：85

**特殊机制：星轨守护**

```yaml
星轨护盾:
  - 5层星轨护盾
  - 每层抵消10000伤害
  - 护盾被打破后Boss攻击力+15%

阶段1 (5-3层护盾):
  - 普攻+星轨打击
  - 每损失1层护盾召唤星轨战士

阶段2 (2-1层护盾):
  - 解锁青龙领域
  - 每回合对全体造成10%最大HP伤害
  - 召唤速度加快

阶段3 (护盾全破):
  - 进入虚弱状态
  - 防御-30%，但攻击+50%
  - 每回合使用青龙之怒
```

---

#### 4.1.3-4.1.8 其他主线Boss（简略）

| Boss ID | 名称 | 章节 | 等级 | HP | 核心机制 |
|---------|------|------|------|-----|----------|
| BOSS_003 | 白虎战将 | 3 | 25 | 25000 | 压力石板连动 |
| BOSS_004 | 朱雀祭司 | 4 | 35 | 35000 | 火焰领域+复活 |
| BOSS_005 | 玄武统领 | 5 | 45 | 50000 | 水系控制+护盾 |
| BOSS_006 | 冥王 | 6 | 55 | 70000 | 暗影分身 |
| BOSS_007 | 机关巨兽 | 7 | 65 | 90000 | 机关变身 |
| BOSS_008 | 最终Boss | 8 | 80 | 150000 | 全机制+阶段变身 |

---

### 4.2 四象守护（4个）

#### 4.2.1 青龙之魂

**基础属性**：
- 等级：80
- HP：200000
- 攻击：1200
- 防御：500
- 速度：100

**独有机制：龙魂不灭**
```yaml
龙魂形态:
  - 死亡时不真正死亡
  - 转化为龙魂状态
  - 龙魂状态下攻击力+100%
  - 持续3回合后复活

击杀条件:
  - 需要在龙魂状态下再次击杀
  - 或使用驱散类技能阻止复活
```

#### 4.2.2 白虎之魂

**独有机制：白虎之力**
```yaml
白虎之爪:
  - 攻击附带撕裂效果
  - 每层撕裂每秒造成5%攻击伤害
  - 最多叠加5层

白虎咆哮:
  - 每回合对全体造成冲击波
  - 附带眩晕判定
```

#### 4.2.3 朱雀之魂

**独有机制：浴火重生**
```yaml
火凤形态:
  - HP<50%时触发
  - 变身火凤，获得新技能组
  - 攻击附带灼烧

灰烬重生:
  - 死亡时化为灰烬
  - 3回合后以50%HP重生
  - 重生次数=战斗开始时朱雀层数
```

#### 4.2.4 玄武之魂

**独有机制：玄武之壳**
```yaml
玄武护甲:
  - 战斗开始获得100%HP的护盾
  - 护盾存在时受到伤害-50%

龟蛇合体:
  - HP<50%时蛇灵分离
  - 龟灵专注防御
  - 蛇灵独立行动进行攻击
```

---

## 五、技能效果触发流程

### 5.1 技能执行流程图

```
技能执行流程:

1. 技能释放请求
   │
   ├── 验证释放条件
   │     ├── 怒气是否足够
   │     ├── 是否被沉默
   │     ├── 目标是否有效
   │     └── 冷却是否完成
   │
   ├── 消耗资源
   │     └── 扣除怒气/冷却
   │
   ├── 选择目标
   │     ├── 根据targetFilter筛选
   │     ├── 随机选择（如需要）
   │     └── 优先级排序
   │
   ├── 执行技能效果
   │     │
   │     ├── 主效果执行
   │     │     ├── 计算伤害/治疗/Buff
   │     │     ├── 触发暴击判定
   │     │     └── 应用效果到目标
   │     │
   │     ├── 附加效果执行
   │     │     ├── 逐个执行附加效果
   │     │     ├── 触发几率判定
   │     │     └── 效果互斥处理
   │     │
   │     └── 特殊效果处理
   │           ├── 召唤处理
   │           ├── 复活处理
   │           └── 驱散处理
   │
   ├── 触发被动技能
   │     ├── 遍历所有被动技能
   │     ├── 检查触发条件
   │     └── 执行被动效果
   │
   ├── 更新战斗状态
   │     ├── 更新HP/怒气
   │     ├── 更新Buff/Debuff
   │     ├── 更新行动条
   │     └── 更新战斗日志
   │
   ├── 触发战斗事件
   │     ├── onSkillUsed
   │     ├── onDamageDealt
   │     ├── onHealDone
   │     └── onUnitDied
   │
   └── 播放技能动画
         ├── 播放施法动画
         ├── 播放命中特效
         └── 播放受击反馈
```

### 5.2 技能执行器实现

```typescript
// 技能执行器
class SkillExecutor {
  private battleContext: BattleContext;
  private eventSystem: BattleEventSystem;
  
  async executeSkill(
    caster: CombatUnit,
    skill: SkillConfig,
    targets: CombatUnit[]
  ): Promise<SkillResult> {
    const startTime = Date.now();
    const results: EffectResult[] = [];
    
    try {
      // 1. 验证释放条件
      const validation = this.validateSkill(caster, skill, targets);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // 2. 消耗资源
      this.consumeResources(caster, skill);
      
      // 3. 触发施法前事件
      await this.eventSystem.emit('onBeforeSkill', { caster, skill, targets });
      
      // 4. 执行主效果
      const mainResult = await this.executeMainEffect(caster, skill, targets);
      results.push(...mainResult);
      
      // 5. 执行附加效果
      if (skill.effects) {
        for (const effect of skill.effects) {
          const effectResult = await this.executeEffect(caster, skill, targets, effect);
          results.push(effectResult);
        }
      }
      
      // 6. 触发被动技能
      await this.triggerPassiveSkills(caster, 'onSkillUsed', { skill, targets });
      
      // 7. 触发战斗事件
      await this.eventSystem.emit('onSkillUsed', { caster, skill, results });
      
      // 8. 更新战斗状态
      this.updateBattleState(results);
      
      return {
        success: true,
        results,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // 执行主效果
  private async executeMainEffect(
    caster: CombatUnit,
    skill: SkillConfig,
    targets: CombatUnit[]
  ): Promise<EffectResult[]> {
    const results: EffectResult[] = [];
    
    // 根据技能类型执行不同效果
    if (skill.damageCoeff) {
      for (const target of targets) {
        const damage = SkillEffectCalculator.calculateDamage(
          caster,
          target,
          { damageCoeff: skill.damageCoeff, damageType: skill.damageType }
        );
        
        target.takeDamage(damage);
        
        results.push({
          type: 'damage',
          source: caster.id,
          target: target.id,
          value: damage.damage,
          isCrit: damage.isCrit
        });
        
        // 触发受击事件
        await this.eventSystem.emit('onDamageDealt', { caster, target, damage });
      }
    }
    
    if (skill.healValue) {
      // 执行治疗效果
    }
    
    return results;
  }
  
  // 执行单个效果
  private async executeEffect(
    caster: CombatUnit,
    skill: SkillConfig,
    targets: CombatUnit[],
    effect: SkillEffect
  ): Promise<EffectResult> {
    // 触发几率判定
    if (effect.triggerChance !== undefined && Math.random() > effect.triggerChance) {
      return { type: 'missed', source: caster.id };
    }
    
    // 根据效果类型执行
    switch (effect.type) {
      case 'stun':
        return this.applyControlEffect(targets, 'stun', effect);
      case 'buff_atk':
        return this.applyBuffEffect(targets, 'atk', effect);
      case 'debuff_def':
        return this.applyDebuffEffect(targets, 'def', effect);
      case 'dot_damage':
        return this.applyDOTEffect(targets, effect);
      // ... 其他效果类型
    }
  }
  
  // 应用控制效果
  private applyControlEffect(
    targets: CombatUnit[],
    controlType: ControlType,
    effect: SkillEffect
  ): EffectResult {
    for (const target of targets) {
      // 检查免疫
      if (target.hasImmunity(controlType)) {
        continue;
      }
      
      // 添加控制Buff
      const buff = BuffFactory.createControlBuff(controlType, effect.duration);
      target.addBuff(buff);
    }
    
    return {
      type: controlType,
      source: targets[0].id,
      targets: targets.map(t => t.id),
      value: effect.duration
    };
  }
}
```

---

## 六、技能特效需求说明

### 6.1 特效分类

| 特效类型 | 说明 | 性能要求 | 资源占用 |
|----------|------|----------|----------|
| 命中特效 | 伤害/治疗数字飘字 | 实时 | 低 |
| 技能特效 | 技能释放动效 | 实时 | 中 |
| Buff特效 | 状态图标动效 | 实时 | 低 |
| 场景特效 | 背景环境效果 | 异步 | 高 |
| 粒子特效 | 粒子系统效果 | 实时 | 中-高 |

### 6.2 特效资源规范

```typescript
// 特效配置
interface EffectConfig {
  effectId: string;
  name: string;
  type: EffectType;
  
  // 美术资源
  resources: {
    particles?: string[];       // 粒子图集
    animation?: string;         // 动画JSON
    sound?: string;             // 音效ID
  };
  
  // 表现参数
  parameters: {
    duration: number;           // 持续时间(ms)
    loop?: boolean;             // 是否循环
    blendMode?: string;         // 混合模式
    scale?: number;              // 缩放
  };
  
  // 层级
  layer: 'background' | 'unit' | 'foreground' | 'ui';
}

// 特效组合配置
interface EffectCombo {
  comboId: string;
  effects: EffectConfig[];
  playMode: 'sequential' | 'parallel' | 'merge';
}
```

### 6.3 各职业特效风格

| 传承 | 特效风格 | 主色调 | 粒子类型 |
|------|----------|--------|----------|
| 星纹摸金 | 星光闪烁、符文流动 | 金色/蓝色 | 星尘、符文 |
| 璇玑搬山 | 阵法光环、机械运转 | 紫色/铜色 | 齿轮、符文阵 |
| 辰宿卸岭 | 大地厚重、土系爆发 | 棕色/绿色 | 岩石、土浪 |
| 天枢发丘 | 神圣光芒、治愈流动 | 白色/绿色 | 光粒、水波 |

---

## 七、实现要点总结

### 7.1 核心实现清单

| 功能 | 实现要点 | 优先级 |
|------|----------|--------|
| 伤害计算 | 整合战斗计算公式文档 | P0 |
| 效果触发 | 支持几率判定、条件触发 | P0 |
| Buff系统 | 与状态系统联动 | P0 |
| Boss机制 | 阶段切换、特殊召唤 | P0 |
| 技能动画 | 可配置的动画系统 | P1 |
| 性能优化 | 对象池、批处理 | P1 |

### 7.2 配置示例

```json
{
  "skillId": "SKILL_XW_001_B",
  "name": "穿甲星矢",
  "type": "ultimate",
  "angerCost": 100,
  "targetType": "single",
  "damage": {
    "type": "physical",
    "coefficient": 2.8
  },
  "effects": [
    {
      "type": "debuff_def",
      "value": -0.30,
      "duration": 2,
      "triggerChance": 1.0
    }
  ],
  "animation": {
    "cast": "shoot",
    "impact": "star_burst"
  }
}
```

---

*文档版本：v1.0 | 最后更新：2026-04-24*
