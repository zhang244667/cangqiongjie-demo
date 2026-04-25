# 《苍穹劫·摸金传人》星级系统数值设计文档

> 版本：1.0
> 更新日期：2026年4月24日
> 设计原则：鲸鱼玩家成长速度 = 免费玩家 × 2

---

## 一、英雄品质与星级总览

### 1.1 品质等级体系

| 品质 | 英文标识 | 颜色 | 初始星级 | 最高星级 | 碎片获取难度 |
|:----:|:--------:|:----:|:--------:|:--------:|--------------|
| N | Normal | #808080 灰色 | 1★ | 3★ | 极易 |
| R | Rare | #00FF00 绿色 | 2★ | 4★ | 容易 |
| SR | Super Rare | #0080FF 蓝色 | 3★ | 5★ | 中等 |
| SSR | Super Super Rare | #8000FF 紫色 | 4★ | 6★ | 困难 |
| UR | Ultra Rare | #FF8000 橙色 | 5★ | 7★ | 极难 |

### 1.2 品质基础属性倍率

```json
{
  "quality_base_multiplier": {
    "n": {
      "quality_level": 1,
      "color_hex": "808080",
      "base_hp_multiplier": 1.0,
      "base_atk_multiplier": 1.0,
      "base_def_multiplier": 1.0,
      "skill_damage_multiplier": 1.0,
      "max_star": 3,
      "shard_drop_rate": 0.40,
      "fragment_per_draw": 5
    },
    "r": {
      "quality_level": 2,
      "color_hex": "00FF00",
      "base_hp_multiplier": 1.3,
      "base_atk_multiplier": 1.3,
      "base_def_multiplier": 1.3,
      "skill_damage_multiplier": 1.2,
      "max_star": 4,
      "shard_drop_rate": 0.30,
      "fragment_per_draw": 3
    },
    "sr": {
      "quality_level": 3,
      "color_hex": "0080FF",
      "base_hp_multiplier": 1.8,
      "base_atk_multiplier": 1.8,
      "base_def_multiplier": 1.8,
      "skill_damage_multiplier": 1.5,
      "max_star": 5,
      "shard_drop_rate": 0.18,
      "fragment_per_draw": 2
    },
    "ssr": {
      "quality_level": 4,
      "color_hex": "8000FF",
      "base_hp_multiplier": 2.5,
      "base_atk_multiplier": 2.5,
      "base_def_multiplier": 2.5,
      "skill_damage_multiplier": 2.0,
      "max_star": 6,
      "shard_drop_rate": 0.08,
      "fragment_per_draw": 1
    },
    "ur": {
      "quality_level": 5,
      "color_hex": "FF8000",
      "base_hp_multiplier": 3.5,
      "base_atk_multiplier": 3.5,
      "base_def_multiplier": 3.5,
      "skill_damage_multiplier": 2.8,
      "max_star": 7,
      "shard_drop_rate": 0.04,
      "fragment_per_draw": 1
    }
  }
}
```

---

## 二、星级成长曲线

### 2.1 星级属性加成表

| 星级 | 生命加成 | 攻击加成 | 防御加成 | 技能伤害加成 |
|:----:|:--------:|:--------:|:--------:|:------------:|
| 1★ | +0% | +0% | +0% | +0% |
| 2★ | +15% | +12% | +10% | +5% |
| 3★ | +35% | +28% | +25% | +12% |
| 4★ | +60% | +50% | +45% | +22% |
| 5★ | +90% | +78% | +70% | +35% |
| 6★ | +125% | +110% | +100% | +50% |
| 7★ | +170% | +150% | +135% | +70% |

### 2.2 星级详细属性加成JSON

```json
{
  "star_attribute_bonus": {
    "1": {
      "star_level": 1,
      "hp_percent": 0.0,
      "atk_percent": 0.0,
      "def_percent": 0.0,
      "skill_damage_percent": 0.0,
      "unlock_skill": null
    },
    "2": {
      "star_level": 2,
      "hp_percent": 0.15,
      "atk_percent": 0.12,
      "def_percent": 0.10,
      "skill_damage_percent": 0.05,
      "unlock_skill": null
    },
    "3": {
      "star_level": 3,
      "hp_percent": 0.35,
      "atk_percent": 0.28,
      "def_percent": 0.25,
      "skill_damage_percent": 0.12,
      "unlock_skill": "passive_skill_enhance_1"
    },
    "4": {
      "star_level": 4,
      "hp_percent": 0.60,
      "atk_percent": 0.50,
      "def_percent": 0.45,
      "skill_damage_percent": 0.22,
      "unlock_skill": "ult_skill_enhance_1"
    },
    "5": {
      "star_level": 5,
      "hp_percent": 0.90,
      "atk_percent": 0.78,
      "def_percent": 0.70,
      "skill_damage_percent": 0.35,
      "unlock_skill": "passive_skill_enhance_2"
    },
    "6": {
      "star_level": 6,
      "hp_percent": 1.25,
      "atk_percent": 1.10,
      "def_percent": 1.00,
      "skill_damage_percent": 0.50,
      "unlock_skill": "ult_skill_enhance_2"
    },
    "7": {
      "star_level": 7,
      "hp_percent": 1.70,
      "atk_percent": 1.50,
      "def_percent": 1.35,
      "skill_damage_percent": 0.70,
      "unlock_skill": "special_awakening"
    }
  }
}
```

### 2.3 技能解锁与强化（按星级）

| 星级 | 普攻 | 怒攻 | 被动 |
|:----:|:----:|:----:|:----:|
| 1★ | Lv.1 | 锁定 | 锁定 |
| 2★ | Lv.2 | Lv.1 | 锁定 |
| 3★ | Lv.3 | Lv.2 | Lv.1 |
| 4★ | Lv.4 | Lv.3 | Lv.2 |
| 5★ | Lv.5 | Lv.4 | Lv.3 |
| 6★ | Lv.6 | Lv.5 | Lv.4 |
| 7★ | Lv.MAX | Lv.MAX | Lv.MAX |

---

## 三、升星材料消耗

### 3.1 各品质升星消耗表

**N品质英雄升星消耗：**

| 升星 | 碎片数量 | 金币消耗 | 成功率 | 耗时(免费) |
|:----:|:--------:|:--------:|:------:|:----------:|
| 1→2★ | 15 | 5,000 | 100% | 2天 |
| 2→3★ | 30 | 15,000 | 100% | 5天 |

**R品质英雄升星消耗：**

| 升星 | 碎片数量 | 金币消耗 | 成功率 | 耗时(免费) |
|:----:|:--------:|:--------:|:------:|:----------:|
| 2→3★ | 20 | 8,000 | 100% | 3天 |
| 3→4★ | 50 | 25,000 | 95% | 7天 |

**SR品质英雄升星消耗：**

| 升星 | 碎片数量 | 金币消耗 | 成功率 | 耗时(免费) |
|:----:|:--------:|:--------:|:------:|:----------:|
| 3→4★ | 30 | 15,000 | 100% | 5天 |
| 4→5★ | 80 | 50,000 | 90% | 12天 |

**SSR品质英雄升星消耗：**

| 升星 | 碎片数量 | 金币消耗 | 成功率 | 耗时(免费) |
|:----:|:--------:|:--------:|:------:|:----------:|
| 4→5★ | 50 | 30,000 | 100% | 8天 |
| 5→6★ | 150 | 100,000 | 85% | 25天 |

**UR品质英雄升星消耗：**

| 升星 | 碎片数量 | 金币消耗 | 成功率 | 耗时(免费) |
|:----:|:--------:|:--------:|:------:|:----------:|
| 5→6★ | 80 | 50,000 | 100% | 13天 |
| 6→7★ | 300 | 200,000 | 80% | 50天 |

### 3.2 升星材料消耗JSON配置

```json
{
  "star_upgrade_cost": {
    "n": {
      "1_to_2": {
        "fragment": 15,
        "coin": 5000,
        "success_rate": 1.0,
        "days_for_free_player": 2
      },
      "2_to_3": {
        "fragment": 30,
        "coin": 15000,
        "success_rate": 1.0,
        "days_for_free_player": 5
      }
    },
    "r": {
      "2_to_3": {
        "fragment": 20,
        "coin": 8000,
        "success_rate": 1.0,
        "days_for_free_player": 3
      },
      "3_to_4": {
        "fragment": 50,
        "coin": 25000,
        "success_rate": 0.95,
        "days_for_free_player": 7
      }
    },
    "sr": {
      "3_to_4": {
        "fragment": 30,
        "coin": 15000,
        "success_rate": 1.0,
        "days_for_free_player": 5
      },
      "4_to_5": {
        "fragment": 80,
        "coin": 50000,
        "success_rate": 0.90,
        "days_for_free_player": 12
      }
    },
    "ssr": {
      "4_to_5": {
        "fragment": 50,
        "coin": 30000,
        "success_rate": 1.0,
        "days_for_free_player": 8
      },
      "5_to_6": {
        "fragment": 150,
        "coin": 100000,
        "success_rate": 0.85,
        "days_for_free_player": 25
      }
    },
    "ur": {
      "5_to_6": {
        "fragment": 80,
        "coin": 50000,
        "success_rate": 1.0,
        "days_for_free_player": 13
      },
      "6_to_7": {
        "fragment": 300,
        "coin": 200000,
        "success_rate": 0.80,
        "days_for_free_player": 50
      }
    }
  }
}
```

---

## 四、升星成功率与保底

### 4.1 成功率设计

| 星级提升 | N | R | SR | SSR | UR |
|:--------:|:-:|:-:|:--:|:---:|:--:|
| 3→4★ | - | 95% | 100% | 100% | - |
| 4→5★ | - | - | 90% | 100% | 100% |
| 5→6★ | - | - | - | 85% | 100% |
| 6→7★ | - | - | - | - | 80% |

### 4.2 失败惩罚机制

```json
{
  "star_upgrade_fail_penalty": {
    "success_rate_above_90": {
      "fail_refund": 0.80,
      "description": "返还80%碎片"
    },
    "success_rate_85_90": {
      "fail_refund": 0.70,
      "description": "返还70%碎片"
    },
    "success_rate_80_85": {
      "fail_refund": 0.60,
      "description": "返还60%碎片"
    },
    "guaranteed_after_fail": {
      "enabled": true,
      "fail_count_threshold": 3,
      "next_upgrade_success_rate": 1.0,
      "description": "连续失败3次后，下一次必成"
    }
  }
}
```

### 4.3 升星保护机制

```json
{
  "star_upgrade_protection": {
    "daily_free_protection": {
      "enabled": true,
      "free_attempts_per_day": 1,
      "applicable_qualities": ["sr", "ssr", "ur"],
      "description": "每日首次SR+升星失败不消耗碎片"
    },
    "monthly_guarantee": {
      "enabled": true,
      "guaranteed_star_upgrade_per_month": 1,
      "applicable_qualities": ["ssr", "ur"],
      "description": "每月至少一次SR+必成机会"
    }
  }
}
```

---

## 五、星级养成时间线

### 5.1 各品质满星养成周期

| 品质 | 满星 | 总碎片 | 免费玩家 | 鲸鱼玩家 |
|:----:|:----:|:------:|:--------:|:---------:|
| N | 3★ | 45 | 7天 | 3.5天 |
| R | 4★ | 70 | 12天 | 6天 |
| SR | 5★ | 110 | 20天 | 10天 |
| SSR | 6★ | 200 | 40天 | 20天 |
| UR | 7★ | 380 | 80天 | 40天 |

### 5.2 每日碎片获取量

| 玩家类型 | N碎片/日 | R碎片/日 | SR碎片/日 | SSR碎片/日 | UR碎片/日 |
|----------|:--------:|:--------:|:---------:|:-----------:|:---------:|
| 免费玩家 | 10 | 6 | 4 | 2 | 0.5 |
| 月卡玩家 | 15 | 9 | 6 | 3 | 0.8 |
| 鲸鱼玩家 | 30 | 18 | 12 | 6 | 2 |

### 5.3 养成时间线JSON配置

```json
{
  "star_upgrade_timeline": {
    "free_player": {
      "n_max_star": {
        "target_star": 3,
        "total_fragment": 45,
        "daily_fragment": 10,
        "days_to_max": 7,
        "coin_total": 20000
      },
      "r_max_star": {
        "target_star": 4,
        "total_fragment": 70,
        "daily_fragment": 6,
        "days_to_max": 12,
        "coin_total": 33000
      },
      "sr_max_star": {
        "target_star": 5,
        "total_fragment": 110,
        "daily_fragment": 4,
        "days_to_max": 28,
        "coin_total": 65000
      },
      "ssr_max_star": {
        "target_star": 6,
        "total_fragment": 200,
        "daily_fragment": 2,
        "days_to_max": 100,
        "coin_total": 130000
      },
      "ur_max_star": {
        "target_star": 7,
        "total_fragment": 380,
        "daily_fragment": 0.5,
        "days_to_max": 760,
        "coin_total": 250000
      }
    },
    "whale_player": {
      "multiplier": 2.0,
      "description": "鲸鱼玩家养成速度为免费玩家2倍"
    }
  }
}
```

---

## 六、星级对战斗力的影响

### 6.1 战斗力计算公式

```
最终属性 = 基础属性 × 品质倍率 × 等级系数 × 星级系数 × (1+突破加成) × (1+宝物加成)
战斗力 = 生命值×0.1 + 攻击值×0.5 + 防御值×0.3 + 技能伤害×2.0
```

### 6.2 星级战力对比（以100级SR为例）

| 星级 | 战力倍数 | 相对1★战力 |
|:----:|:--------:|:----------:|
| 1★ | 1.00x | 100% |
| 2★ | 1.18x | 118% |
| 3★ | 1.45x | 145% |
| 4★ | 1.85x | 185% |
| 5★ | 2.35x | 235% |

### 6.3 战力系数JSON配置

```json
{
  "star_power_coefficient": {
    "base_power_formula": {
      "hp_weight": 0.1,
      "atk_weight": 0.5,
      "def_weight": 0.3,
      "skill_damage_weight": 2.0
    },
    "star_power_multiplier": {
      "1": 1.00,
      "2": 1.18,
      "3": 1.45,
      "4": 1.85,
      "5": 2.35,
      "6": 2.90,
      "7": 3.60
    }
  }
}
```

---

## 七、版本记录

| 版本 | 日期 | 修改内容 |
|:----:|:----:|----------|
| 1.0 | 2026-04-24 | 初始版本，完成星级系统基础框架 |
