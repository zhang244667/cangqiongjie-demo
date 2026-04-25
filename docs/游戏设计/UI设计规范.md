# 《苍穹劫·摸金传人》UI控件样式规范

> 版本：1.0 | 最后更新：2025年1月
> 文档类型：手游UI设计规范
> 适用项目：盗墓题材放置卡牌手游

---

## 目录

1. [视觉风格定位](#1-视觉风格定位)
2. [配色方案](#2-配色方案)
3. [字体规范](#3-字体规范)
4. [核心控件样式](#4-核心控件样式)
5. [图标风格](#5-图标风格)
6. [动效规范](#6-动效规范)
7. [阴影与质感](#7-阴影与质感)
8. [背景与纹理](#8-背景与纹理)
9. [附录：CSS变量速查表](#9-附录css变量速查表)

---

## 1. 视觉风格定位

### 1.1 整体风格描述

《苍穹劫·摸金传人》的UI设计以「星盘秘卷」为核心理念，将盗墓探险的神秘感与古风玄幻美学深度融合。整体视觉呈现出「暗夜古墓中星光流转」的意境——深邃的夜色为底，星盘符文为引，金紫青三色点缀其间，营造出既神秘庄重又不失精致的氛围。

### 1.2 参考游戏案例

| 参考游戏 | 借鉴要点 | 应用场景 |
|---------|---------|---------|
| 《原神》 | 分层信息架构、沉浸式地图交互、心流体验设计 | 界面布局、信息层级 |
| 《崩坏：星穹铁道》 | 暗色系配色、角色卡片设计、技能UI布局 | 卡牌样式、品质展示 |
| 《阴阳师》 | 古风元素运用、卷轴/纸艺质感、仪式感动效 | 弹窗背景、过渡动画 |
| 《云梦四时歌》 | 异型UI设计、沉浸式场景融合 | 界面异形化、氛围统一 |
| 《千年3》 | 武侠古风形制、卷轴装裱视觉 | 弹窗边框、装饰元素 |

### 1.3 核心设计原则

```
┌─────────────────────────────────────────────────────────────┐
│  设计原则                        释义                       │
├─────────────────────────────────────────────────────────────┤
│  1. 星盘秘卷美学                 以星盘、墓志铭、古卷为视觉符号│
│  2. 沉浸优先                     UI服务于剧情与氛围，减少割裂感│
│  3. 暗色基调+品质点缀            深色背景突显金色/紫色品质感  │
│  4. 传承主题差异化               四大传承各有独特配色与图标风格│
│  5. 微交互仪式感                 按钮点击、界面切换带仪式化反馈│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 配色方案

### 2.1 主色系

| 颜色名称 | 色值 | 使用场景 |
|---------|------|---------|
| **玄夜黑** | `#0A0D12` | 主背景、深色面板底 |
| **墓石灰** | `#1A1F28` | 卡片背景、次级面板 |
| **幽冥灰** | `#252B38` | 按钮背景、输入框底 |
| **星辰灰** | `#3A4150` | 分割线、禁用态 |
| **月光白** | `#E8E6E1` | 主要文字 |
| **银辉白** | `#F5F3EF` | 标题文字、高亮文字 |

### 2.2 辅助色系

| 颜色名称 | 色值 | 使用场景 |
|---------|------|---------|
| **古铜金** | `#C9A961` | 主要按钮、重要强调、图标描边 |
| **暗金** | `#8B7340` | 按钮按下态、次级强调 |
| **星辉金** | `#FFD700` | 高亮特效、SSR以上品质 |
| **玄紫** | `#6B4C9A` | 次要强调、紫色系道具 |
| **幽紫** | `#4A3568` | 紫色渐变底 |
| **天青** | `#4ECDC4` | 青色系道具、特殊状态 |
| **玄青** | `#2A8B84` | 青色渐变底 |

### 2.3 品质色（卡牌/道具品质）

```
品质等级与配色对应：

  N (普通)    ██ #8B8B8B  灰色 - 朴素无华
  R (稀有)    ██ #4A9EFF  蓝色 - 稀有光芒
  SR (超级稀有) ██ #9B59B6  紫色 - 神秘尊贵
  SSR (超级稀有) ██ #FFD700  金色 - 璀璨耀眼
  UR (终极稀有) ██ #FF6B35  橙色 - 炽热非凡
```

| 品质 | 主色 | 辅色/渐变 | 光效色 |
|------|------|----------|--------|
| N | `#8B8B8B` | `#6B6B6B` → `#9B9B9B` | 无 |
| R | `#4A9EFF` | `#2D7DD2` → `#6BB5FF` | `#4A9EFF` 微光 |
| SR | `#9B59B6` | `#7D3C98` → `#BB8FCE` | `#9B59B6` 柔光 |
| SSR | `#FFD700` | `#C9A961` → `#FFE066` | `#FFD700` 强光 + 粒子 |
| UR | `#FF6B35` | `#E74C3C` → `#FFB347` | `#FF6B35` 烈焰光 + 脉冲 |

### 2.4 传承主题色（四大传承）

```
┌─────────────────────────────────────────────────────────────┐
│                    四大传承主题色                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【星纹摸金】  主色：#C9A961 (古铜金)                        │
│  "北斗星指，金穴开启"                                       │
│  象征：指南针、星纹罗盘、探照灯火                            │
│  风格：沉稳厚重、金属质感                                    │
│                                                             │
│  【璇玑搬山】  主色：#4ECDC4 (天青)                          │
│  "璇玑运转，山门自现"                                       │
│  象征：星图、机关齿轮、玄玉                                 │
│  风格：精密灵动、翠玉通透                                    │
│                                                             │
│  【辰宿卸岭】  主色：#E74C3C (赤红)                          │
│  "辰宿列张，岭岳崩摧"                                       │
│  象征：血纹、火焰、山脉剪影                                  │
│  风格：刚猛热烈、熔岩纹理                                    │
│                                                             │
│  【天枢发丘】  主色：#9B59B6 (玄紫)                          │
│  "天枢定位，发丘点穴"                                       │
│  象征：星阵、符箓、紫电                                      │
│  风格：诡谲神秘、符文流转                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 功能色

| 功能 | 色值 | 使用场景 |
|------|------|---------|
| **成功** | `#2ECC71` | 领取成功、验证通过 |
| **警告** | `#F39C12` | 体力不足、材料不足 |
| **错误** | `#E74C3C` | 操作失败、输入错误 |
| **信息** | `#3498DB` | 提示信息、新手引导 |
| **禁用** | `#4A4A4A` | 不可点击、已过期 |

### 2.6 渐变色方案

```css
/* 背景渐变 */
--gradient-dark: linear-gradient(180deg, #0A0D12 0%, #1A1F28 100%);
--gradient-card: linear-gradient(180deg, #1A1F28 0%, #252B38 100%);
--gradient-modal: linear-gradient(180deg, rgba(26,31,40,0.95) 0%, rgba(10,13,18,0.98) 100%);

/* 品质渐变 */
--gradient-quality-r: linear-gradient(135deg, #2D7DD2 0%, #4A9EFF 50%, #6BB5FF 100%);
--gradient-quality-sr: linear-gradient(135deg, #7D3C98 0%, #9B59B6 50%, #BB8FCE 100%);
--gradient-quality-ssr: linear-gradient(135deg, #C9A961 0%, #FFD700 50%, #FFE066 100%);
--gradient-quality-ur: linear-gradient(135deg, #E74C3C 0%, #FF6B35 50%, #FFB347 100%);

/* 传承渐变 */
--gradient-xingwen: linear-gradient(135deg, #8B7340 0%, #C9A961 50%, #FFE066 100%);
--gradient-xuanji: linear-gradient(135deg, #2A8B84 0%, #4ECDC4 50%, #7EEEE6 100%);
--gradient-chenxiu: linear-gradient(135deg, #A93226 0%, #E74C3C 50%, #FF6B5B 100%);
--gradient-tianshu: linear-gradient(135deg, #4A3568 0%, #9B59B6 50%, #C39BD3 100%);

/* 按钮渐变 */
--gradient-btn-primary: linear-gradient(180deg, #D4B86A 0%, #C9A961 50%, #8B7340 100%);
--gradient-btn-secondary: linear-gradient(180deg, #3A4150 0%, #252B38 100%);
```

---

## 3. 字体规范

### 3.1 字体选择

```css
/* 中文字体栈 */
--font-family-cn: 
    "Noto Serif SC",      /* 思源宋体 - 标题、品质文字 */
    "Source Han Serif SC", 
    "SimSun", 
    "宋体",
    serif;

/* 无衬线字体栈 */
--font-family-sans: 
    "Noto Sans SC",       /* 思源黑体 - 正文、说明 */
    "Source Han Sans SC",
    "Microsoft YaHei",
    "PingFang SC",
    sans-serif;

/* 数字/英文装饰字体 */
--font-family-display: 
    "DIN Alternate",
    "Helvetica Neue",
    "Arial",
    sans-serif;

/* 等宽字体（用于代码/数字） */
--font-family-mono: 
    "SF Mono",
    "Menlo",
    monospace;
```

### 3.2 字号层级

| 层级 | 名称 | 字号 | 字重 | 行高 | 使用场景 |
|------|------|------|------|------|---------|
| 1 | 大标题 | 36px | 700 | 1.2 | 弹窗标题、重要标题 |
| 2 | 页面标题 | 28px | 600 | 1.3 | 界面标题、分区标题 |
| 3 | 卡片标题 | 22px | 600 | 1.3 | 角色名、道具名 |
| 4 | 正文大 | 18px | 500 | 1.5 | 重要说明、副标题 |
| 5 | 正文 | 16px | 400 | 1.6 | 主要内容 |
| 6 | 正文小 | 14px | 400 | 1.5 | 次要说明 |
| 7 | 辅助文字 | 12px | 400 | 1.4 | 标签、提示、时间等 |

### 3.3 字重规范

```css
/* 字重定义 */
--font-weight-thin: 100;
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* 使用场景 */
--font-weight-title: 700;      /* 标题文字 */
--font-weight-heading: 600;    /* 小标题、角色名 */
--font-weight-body: 400;       /* 正文内容 */
--font-weight-label: 500;      /* 按钮文字、标签 */
```

### 3.4 行高规范

```css
/* 行高定义 */
--line-height-tight: 1.2;      /* 紧凑 - 标题 */
--line-height-normal: 1.5;     /* 正常 - 正文 */
--line-height-relaxed: 1.8;    /* 宽松 - 说明文字 */
```

### 3.5 文字颜色规范

```css
/* 深色背景上的文字 */
--text-primary: #F5F3EF;       /* 主要文字 - 最高优先级 */
--text-secondary: #E8E6E1;     /* 次要文字 */
--text-tertiary: #9A9A9A;     /* 辅助文字 */
--text-disabled: #5A5A5A;      /* 禁用文字 */

/* 功能色文字 */
--text-gold: #C9A961;          /* 金色强调 */
--text-success: #2ECC71;       /* 成功提示 */
--text-warning: #F39C12;       /* 警告提示 */
--text-error: #E74C3C;         /* 错误提示 */
--text-info: #3498DB;         /* 信息提示 */

/* 品质色文字 */
--text-quality-n: #9A9A9A;
--text-quality-r: #4A9EFF;
--text-quality-sr: #BB8FCE;
--text-quality-ssr: #FFD700;
--text-quality-ur: #FF6B35;

/* 传承色文字 */
--text-xingwen: #C9A961;       /* 星纹摸金 */
--text-xuanji: #4ECDC4;       /* 璇玑搬山 */
--text-chenxiu: #E74C3C;       /* 辰宿卸岭 */
--text-tianshu: #9B59B6;       /* 天枢发丘 */
```

---

## 4. 核心控件样式

### 4.1 按钮

#### 4.1.1 主要按钮

```css
/* 主要按钮 - 用于核心操作 */
.cqj-btn-primary {
    /* 尺寸 */
    height: 56px;
    padding: 0 32px;
    border-radius: 8px;
    
    /* 背景 */
    background: linear-gradient(180deg, #D4B86A 0%, #C9A961 50%, #8B7340 100%);
    box-shadow: 
        0 4px 12px rgba(201, 169, 97, 0.3),    /* 外发光 */
        inset 0 1px 0 rgba(255, 255, 255, 0.2);  /* 高光边 */
    
    /* 边框 */
    border: 1px solid #FFE066;
    border-image: linear-gradient(180deg, #FFE066, #C9A961) 1;
    
    /* 文字 */
    font-family: var(--font-family-sans);
    font-size: 18px;
    font-weight: 600;
    color: #1A1F28;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
    
    /* 交互 */
    cursor: pointer;
    transition: all 0.2s ease;
}

/* 主要按钮 - 悬停态 */
.cqj-btn-primary:hover {
    background: linear-gradient(180deg, #E5C97B 0%, #D4B86A 50%, #9B8350 100%);
    box-shadow: 
        0 6px 20px rgba(201, 169, 97, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

/* 主要按钮 - 按下态 */
.cqj-btn-primary:active {
    background: linear-gradient(180deg, #8B7340 0%, #7A6535 100%);
    box-shadow: 
        0 2px 6px rgba(201, 169, 97, 0.2),
        inset 0 2px 4px rgba(0, 0, 0, 0.2);
    transform: translateY(1px);
}

/* 主要按钮 - 禁用态 */
.cqj-btn-primary:disabled {
    background: linear-gradient(180deg, #4A4A4A 0%, #3A3A3A 100%);
    border-color: #5A5A5A;
    color: #6A6A6A;
    text-shadow: none;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
}
```

**设计说明**：主要按钮采用古铜金渐变，体现尊贵感与仪式感。边缘高光模拟金属反光效果，按下时内凹表现按压反馈。

**使用场景**：确认领取、立即出战、十连抽卡等核心操作。

---

#### 4.1.2 次要按钮

```css
/* 次要按钮 - 用于次级操作 */
.cqj-btn-secondary {
    height: 48px;
    padding: 0 24px;
    border-radius: 6px;
    
    background: linear-gradient(180deg, #3A4150 0%, #252B38 100%);
    border: 1px solid #4A5568;
    box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    
    font-family: var(--font-family-sans);
    font-size: 16px;
    font-weight: 500;
    color: #E8E6E1;
    
    cursor: pointer;
    transition: all 0.2s ease;
}

/* 次要按钮 - 悬停态 */
.cqj-btn-secondary:hover {
    background: linear-gradient(180deg, #4A5568 0%, #3A4150 100%);
    border-color: #5A6A7A;
    color: #F5F3EF;
}

/* 次要按钮 - 按下态 */
.cqj-btn-secondary:active {
    background: linear-gradient(180deg, #252B38 0%, #1A1F28 100%);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 次要按钮 - 禁用态 */
.cqj-btn-secondary:disabled {
    background: #2A2A2A;
    border-color: #3A3A3A;
    color: #5A5A5A;
    cursor: not-allowed;
}
```

**设计说明**：次要按钮采用幽冥灰渐变，质感内敛稳重，与主要按钮形成主次对比。

**使用场景**：取消、返回、查看详情等辅助操作。

---

#### 4.1.3 文字按钮

```css
/* 文字按钮 - 轻量化操作 */
.cqj-btn-text {
    padding: 8px 16px;
    background: transparent;
    border: none;
    
    font-family: var(--font-family-sans);
    font-size: 14px;
    font-weight: 500;
    color: #C9A961;
    
    cursor: pointer;
    transition: all 0.2s ease;
}

/* 文字按钮 - 悬停态 */
.cqj-btn-text:hover {
    color: #FFE066;
    text-shadow: 0 0 8px rgba(201, 169, 97, 0.5);
}

/* 文字按钮 - 按下态 */
.cqj-btn-text:active {
    color: #8B7340;
}

/* 文字按钮 - 禁用态 */
.cqj-btn-text:disabled {
    color: #5A5A5A;
    cursor: not-allowed;
}
```

**设计说明**：文字按钮去除所有装饰，仅保留文字本身，按钮态通过颜色变化表达。

**使用场景**：辅助链接、关闭、更多操作等。

---

#### 4.1.4 图标按钮

```css
/* 图标按钮 */
.cqj-btn-icon {
    width: 48px;
    height: 48px;
    padding: 0;
    border-radius: 50%;
    
    background: rgba(37, 43, 56, 0.8);
    border: 1px solid rgba(201, 169, 97, 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    cursor: pointer;
    transition: all 0.2s ease;
}

/* 图标按钮 - 悬停态 */
.cqj-btn-icon:hover {
    background: rgba(201, 169, 97, 0.2);
    border-color: rgba(201, 169, 97, 0.6);
    box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.4),
        0 0 16px rgba(201, 169, 97, 0.2);
}

/* 图标按钮 - 按下态 */
.cqj-btn-icon:active {
    background: rgba(201, 169, 97, 0.3);
    transform: scale(0.95);
}

/* 图标按钮 - 禁用态 */
.cqj-btn-icon:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
```

**设计说明**：图标按钮采用圆形设计，模拟古铜钱币造型，悬停时边缘发光表现可交互。

**使用场景**：设置、邮件、背包、角色等导航入口。

---

#### 4.1.5 按钮尺寸变体

```css
/* 小尺寸按钮 */
.cqj-btn-sm {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
    border-radius: 4px;
}

/* 中尺寸按钮 */
.cqj-btn-md {
    height: 48px;
    padding: 0 24px;
    font-size: 16px;
    border-radius: 6px;
}

/* 大尺寸按钮 */
.cqj-btn-lg {
    height: 56px;
    padding: 0 32px;
    font-size: 18px;
    border-radius: 8px;
}

/* 全宽按钮 */
.cqj-btn-block {
    width: 100%;
}
```

---

### 4.2 弹窗

#### 4.2.1 模态弹窗

```css
/* 模态弹窗容器 */
.cqj-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 13, 18, 0.85);
    backdrop-filter: blur(8px);
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    z-index: 1000;
    animation: modalFadeIn 0.3s ease;
}

/* 模态弹窗主体 */
.cqj-modal {
    width: 90%;
    max-width: 480px;
    max-height: 85vh;
    overflow: hidden;
    
    background: linear-gradient(180deg, #1A1F28 0%, #0A0D12 100%);
    border: 1px solid rgba(201, 169, 97, 0.3);
    border-radius: 16px;
    
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.6),
        0 0 40px rgba(201, 169, 97, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    
    animation: modalSlideIn 0.3s ease;
}

/* 模态弹窗头部 */
.cqj-modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(201, 169, 97, 0.2);
    
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    /* 装饰元素 */
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(201, 169, 97, 0.1) 50%, 
        transparent 100%);
}

/* 模态弹窗标题 */
.cqj-modal-title {
    font-family: var(--font-family-cn);
    font-size: 22px;
    font-weight: 600;
    color: #F5F3EF;
    
    /* 星辉装饰 */
    text-shadow: 0 0 20px rgba(201, 169, 97, 0.5);
}

/* 模态弹窗关闭按钮 */
.cqj-modal-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    color: #9A9A9A;
    font-size: 20px;
    
    cursor: pointer;
    transition: all 0.2s ease;
}

.cqj-modal-close:hover {
    background: rgba(231, 76, 60, 0.2);
    border-color: rgba(231, 76, 60, 0.5);
    color: #E74C3C;
}

/* 模态弹窗内容区 */
.cqj-modal-body {
    padding: 24px;
    overflow-y: auto;
    max-height: calc(85vh - 140px);
}

/* 模态弹窗底部 */
.cqj-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(201, 169, 97, 0.2);
    
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    
    background: rgba(0, 0, 0, 0.2);
}

/* 弹窗装饰角 - 左上 */
.cqj-modal::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    width: 60px;
    height: 60px;
    
    background: linear-gradient(135deg, 
        rgba(201, 169, 97, 0.4) 0%, 
        transparent 60%);
    
    border-radius: 16px 0 0 0;
    pointer-events: none;
}

/* 弹窗装饰角 - 右下 */
.cqj-modal::after {
    content: '';
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 60px;
    height: 60px;
    
    background: linear-gradient(315deg, 
        rgba(201, 169, 97, 0.4) 0%, 
        transparent 60%);
    
    border-radius: 0 0 16px 0;
    pointer-events: none;
}
```

**设计说明**：模态弹窗以古卷展开为视觉隐喻，采用深色渐变底配合金色边框装饰，四角做淡化处理营造古卷质感。背景模糊增强层次感。

**使用场景**：角色详情、装备展示、活动规则等需要聚焦注意力的内容。

---

#### 4.2.2 确认弹窗

```css
/* 确认弹窗 */
.cqj-confirm {
    text-align: center;
}

.cqj-confirm-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    
    border-radius: 50%;
    background: linear-gradient(180deg, #1A1F28 0%, #0A0D12 100%);
    border: 2px solid rgba(201, 169, 97, 0.4);
    
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 30px rgba(201, 169, 97, 0.2);
}

.cqj-confirm-icon.warning {
    border-color: rgba(243, 156, 18, 0.4);
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 30px rgba(243, 156, 18, 0.2);
}

.cqj-confirm-icon.danger {
    border-color: rgba(231, 76, 60, 0.4);
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 30px rgba(231, 76, 60, 0.2);
}

.cqj-confirm-title {
    font-family: var(--font-family-cn);
    font-size: 20px;
    font-weight: 600;
    color: #F5F3EF;
    margin-bottom: 12px;
}

.cqj-confirm-message {
    font-size: 14px;
    color: #B0B0B0;
    line-height: 1.6;
    margin-bottom: 24px;
}

.cqj-confirm-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
}
```

**设计说明**：确认弹窗采用居中聚焦设计，图标与文字垂直排列，强调视觉重心。警告/危险态通过边框与光晕颜色区分。

**使用场景**：二次确认、资源不足提示、危险操作警告等。

---

#### 4.2.3 底部抽屉

```css
/* 底部抽屉容器 */
.cqj-drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 13, 18, 0.7);
    
    z-index: 1000;
    animation: drawerFadeIn 0.2s ease;
}

/* 底部抽屉主体 */
.cqj-drawer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 80vh;
    
    background: linear-gradient(180deg, #1A1F28 0%, #0A0D12 100%);
    border-top: 1px solid rgba(201, 169, 97, 0.3);
    border-radius: 20px 20px 0 0;
    
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
    
    animation: drawerSlideUp 0.3s ease;
}

/* 抽屉把手 */
.cqj-drawer-handle {
    width: 60px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    
    margin: 12px auto;
}

/* 抽屉内容区 */
.cqj-drawer-content {
    padding: 0 20px 34px;  /* 34px = 底部安全区 */
}
```

**设计说明**：底部抽屉适配移动端单手操作习惯，圆角顶边模拟从底部拉出的古卷展开效果。

**使用场景**：筛选面板、角色选择、道具详情等需要频繁操作的内容。

---

#### 4.2.4 Toast提示

```css
/* Toast提示容器 */
.cqj-toast {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    
    padding: 14px 24px;
    border-radius: 8px;
    
    background: rgba(26, 31, 40, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(0, 0, 0, 0.2);
    
    display: flex;
    align-items: center;
    gap: 12px;
    
    z-index: 2000;
    animation: toastIn 0.3s ease;
}

/* Toast - 成功态 */
.cqj-toast.success {
    border-color: rgba(46, 204, 113, 0.4);
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(46, 204, 113, 0.2);
}

.cqj-toast.success::before {
    content: '✓';
    color: #2ECC71;
    font-size: 18px;
}

/* Toast - 警告态 */
.cqj-toast.warning {
    border-color: rgba(243, 156, 18, 0.4);
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(243, 156, 18, 0.2);
}

.cqj-toast.warning::before {
    content: '⚠';
    color: #F39C12;
    font-size: 18px;
}

/* Toast - 错误态 */
.cqj-toast.error {
    border-color: rgba(231, 76, 60, 0.4);
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(231, 76, 60, 0.2);
}

.cqj-toast.error::before {
    content: '✕';
    color: #E74C3C;
    font-size: 18px;
}

/* Toast - 信息态 */
.cqj-toast.info {
    border-color: rgba(52, 152, 219, 0.4);
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(52, 152, 219, 0.2);
}

.cqj-toast.info::before {
    content: 'ℹ';
    color: #3498DB;
    font-size: 18px;
}

/* Toast文字 */
.cqj-toast-text {
    font-size: 14px;
    color: #E8E6E1;
}
```

**设计说明**：Toast提示采用轻量化设计，快速出现快速消失，底部留白避免与底部Tab冲突。

**使用场景**：操作反馈、资源变化提示、网络状态提示等。

---

### 4.3 卡片

#### 4.3.1 英雄卡片

```css
/* 英雄卡片容器 */
.cqj-card-hero {
    width: 120px;
    position: relative;
    
    cursor: pointer;
    transition: all 0.3s ease;
}

/* 卡片边框 - 品质色 */
.cqj-card-hero::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    
    border-radius: 12px;
    background: linear-gradient(135deg, var(--quality-color) 0%, transparent 50%, var(--quality-color) 100%);
    
    opacity: 0.6;
    transition: opacity 0.3s ease;
}

/* 卡片选中态 */
.cqj-card-hero.selected::before {
    opacity: 1;
    animation: borderGlow 1.5s ease-in-out infinite;
}

/* 卡片主体 */
.cqj-card-hero-inner {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    background: linear-gradient(180deg, #252B38 0%, #1A1F28 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 卡片头像区 */
.cqj-card-hero-avatar {
    width: 100%;
    aspect-ratio: 1;
    background: linear-gradient(180deg, #2A3040 0%, #1A1F28 100%);
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    position: relative;
    overflow: hidden;
}

/* 头像背景光效 */
.cqj-card-hero-avatar::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80%;
    height: 80%;
    transform: translate(-50%, -50%);
    
    background: radial-gradient(circle, var(--quality-color-soft) 0%, transparent 70%);
    opacity: 0.3;
}

/* 卡片信息区 */
.cqj-card-hero-info {
    padding: 8px;
    text-align: center;
}

/* 角色名称 */
.cqj-card-hero-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--quality-color);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 角色等级 */
.cqj-card-hero-level {
    font-size: 11px;
    color: #9A9A9A;
}

/* 品质标识 */
.cqj-card-hero-quality {
    position: absolute;
    top: 4px;
    right: 4px;
    
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--quality-color);
    
    font-size: 10px;
    font-weight: 700;
    color: #0A0D12;
    text-transform: uppercase;
}

/* 传承标识 */
.cqj-card-hero-heritage {
    position: absolute;
    bottom: 50px;
    left: 4px;
    
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--heritage-color);
    
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
}

/* 悬停效果 */
.cqj-card-hero:hover {
    transform: translateY(-4px) scale(1.02);
}

.cqj-card-hero:hover::before {
    opacity: 1;
}

.cqj-card-hero:hover .cqj-card-hero-inner {
    box-shadow: 
        0 10px 30px rgba(0, 0, 0, 0.5),
        0 0 20px var(--quality-glow);
}
```

**设计说明**：英雄卡片采用立绘展示为主的设计，边框品质色渐变环绕，悬停时立体浮起并放大。传承标识与品质标签形成双重识别。

**使用场景**：英雄列表、编队选择、英雄详情入口等。

---

#### 4.3.2 宝物卡片

```css
/* 宝物卡片 */
.cqj-card-treasure {
    width: 80px;
    position: relative;
    
    cursor: pointer;
    transition: all 0.3s ease;
}

.cqj-card-treasure::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    border-radius: 8px;
    background: var(--quality-color);
    opacity: 0.4;
    transition: opacity 0.3s ease;
}

.cqj-card-treasure.selected::before {
    opacity: 1;
}

.cqj-card-treasure-inner {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: linear-gradient(180deg, #252B38 0%, #1A1F28 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.cqj-card-treasure-icon {
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    
    /* 宝物发光效果 */
    filter: drop-shadow(0 0 8px var(--quality-glow));
}

.cqj-card-treasure-count {
    position: absolute;
    bottom: 4px;
    right: 4px;
    
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.8);
    
    font-size: 11px;
    font-weight: 600;
    color: #F5F3EF;
}

.cqj-card-treasure:hover {
    transform: scale(1.08);
}

.cqj-card-treasure:hover::before {
    opacity: 0.8;
}
```

**设计说明**：宝物卡片更紧凑，图标为中心，品质色描边。数量角标避免遮挡图标。

**使用场景**：宝物背包、装备穿戴、背包列表等。

---

#### 4.3.3 道具卡片

```css
/* 道具卡片 */
.cqj-card-item {
    width: 64px;
    height: 64px;
    position: relative;
    
    cursor: pointer;
    transition: all 0.2s ease;
}

.cqj-card-item-inner {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(180deg, #252B38 0%, #1A1F28 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    position: relative;
    overflow: hidden;
}

.cqj-card-item-icon {
    font-size: 28px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.cqj-card-item-count {
    position: absolute;
    bottom: 2px;
    right: 2px;
    
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.8);
    
    font-size: 10px;
    font-weight: 600;
    color: #F5F3EF;
    
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 锁定状态 */
.cqj-card-item.locked .cqj-card-item-inner {
    background: rgba(30, 30, 30, 0.8);
    opacity: 0.5;
}

/* 新获得标识 */
.cqj-card-item.new::after {
    content: 'NEW';
    position: absolute;
    top: -4px;
    right: -4px;
    
    padding: 2px 4px;
    border-radius: 4px;
    background: #E74C3C;
    
    font-size: 8px;
    font-weight: 700;
    color: #FFF;
}

.cqj-card-item:hover {
    transform: scale(1.1);
    z-index: 10;
}
```

**设计说明**：道具卡片最小尺寸，信息密度最高。锁定态与新标识满足背包管理需求。

**使用场景**：道具背包、材料合成、商店物品等。

---

### 4.4 列表

#### 4.4.1 普通列表

```css
/* 普通列表项 */
.cqj-list-item {
    display: flex;
    align-items: center;
    padding: 16px;
    
    background: rgba(37, 43, 56, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    
    cursor: pointer;
    transition: all 0.2s ease;
}

.cqj-list-item:hover {
    background: rgba(201, 169, 97, 0.1);
    border-color: rgba(201, 169, 97, 0.2);
}

.cqj-list-item.selected {
    background: rgba(201, 169, 97, 0.15);
    border-color: rgba(201, 169, 97, 0.4);
}

.cqj-list-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

/* 列表分隔线 */
.cqj-list-divider {
    height: 1px;
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.1) 50%, 
        transparent 100%);
    margin: 8px 16px;
}
```

#### 4.4.2 英雄列表

```css
/* 英雄列表容器 */
.cqj-list-hero {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 12px;
    padding: 16px;
}

/* 或横向滚动式 */
.cqj-list-hero-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 16px;
    
    /* 滚动条样式 */
    scrollbar-width: none;  /* Firefox */
    -ms-overflow-style: none;  /* IE/Edge */
}

.cqj-list-hero-scroll::-webkit-scrollbar {
    display: none;  /* Chrome/Safari */
}
```

#### 4.4.3 可滚动列表

```css
/* 可滚动列表容器 */
.cqj-scroll-list {
    max-height: 400px;
    overflow-y: auto;
    
    /* 滚动条轨道 */
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

/* 滚动条滑块 */
.cqj-scroll-list::-webkit-scrollbar {
    width: 6px;
}

.cqj-scroll-list::-webkit-scrollbar-track {
    background: transparent;
}

.cqj-scroll-list::-webkit-scrollbar-thumb {
    background: rgba(201, 169, 97, 0.3);
    border-radius: 3px;
}

.cqj-scroll-list::-webkit-scrollbar-thumb:hover {
    background: rgba(201, 169, 97, 0.5);
}

/* 触摸滚动优化 */
.cqj-scroll-list {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
}
```

---

### 4.5 标签

#### 4.5.1 品质标签

```css
/* 品质标签 */
.cqj-tag-quality {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 4px;
    
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* N - 普通 */
.cqj-tag-quality.n {
    background: rgba(139, 139, 139, 0.2);
    color: #9A9A9A;
    border: 1px solid rgba(139, 139, 139, 0.3);
}

/* R - 稀有 */
.cqj-tag-quality.r {
    background: rgba(74, 158, 255, 0.2);
    color: #4A9EFF;
    border: 1px solid rgba(74, 158, 255, 0.4);
}

/* SR - 超级稀有 */
.cqj-tag-quality.sr {
    background: rgba(155, 89, 182, 0.2);
    color: #BB8FCE;
    border: 1px solid rgba(155, 89, 182, 0.4);
}

/* SSR - 超级稀有 */
.cqj-tag-quality.ssr {
    background: linear-gradient(135deg, rgba(201, 169, 97, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%);
    color: #FFD700;
    border: 1px solid rgba(255, 215, 0, 0.5);
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

/* UR - 终极稀有 */
.cqj-tag-quality.ur {
    background: linear-gradient(135deg, rgba(231, 76, 60, 0.3) 0%, rgba(255, 107, 53, 0.2) 100%);
    color: #FF6B35;
    border: 1px solid rgba(255, 107, 53, 0.5);
    text-shadow: 0 0 8px rgba(255, 107, 53, 0.5);
}
```

#### 4.5.2 状态标签

```css
/* 状态标签 */
.cqj-tag-status {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    
    font-size: 11px;
    font-weight: 500;
}

/* 状态 - 冷却中 */
.cqj-tag-status.cooldown {
    background: rgba(74, 74, 74, 0.4);
    color: #8A8A8A;
}

/* 状态 - 可用 */
.cqj-tag-status.ready {
    background: rgba(46, 204, 113, 0.2);
    color: #2ECC71;
}

/* 状态 - 进行中 */
.cqj-tag-status.active {
    background: rgba(52, 152, 219, 0.2);
    color: #3498DB;
}

/* 状态 - 锁定 */
.cqj-tag-status.locked {
    background: rgba(231, 76, 60, 0.2);
    color: #E74C3C;
}
```

#### 4.5.3 数量标签

```css
/* 数量标签 */
.cqj-tag-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    
    background: rgba(201, 169, 97, 0.8);
    
    font-size: 11px;
    font-weight: 600;
    color: #0A0D12;
}

/* 数量不足 */
.cqj-tag-count.insufficient {
    background: rgba(231, 76, 60, 0.8);
    color: #FFF;
}

/* 红点提示 */
.cqj-badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #E74C3C;
    
    position: absolute;
    top: -2px;
    right: -2px;
    
    animation: badgePulse 1.5s ease-in-out infinite;
}
```

---

### 4.6 进度条

#### 4.6.1 经验条

```css
/* 经验条 */
.cqj-progress-exp {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.4);
    
    overflow: hidden;
    position: relative;
}

.cqj-progress-exp-bar {
    height: 100%;
    border-radius: 4px;
    
    background: linear-gradient(90deg, 
        #4A9EFF 0%, 
        #6BB5FF 50%,
        #9B59B6 100%);
    
    transition: width 0.5s ease;
    
    position: relative;
}

/* 经验条光效 */
.cqj-progress-exp-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.3) 50%,
        transparent 100%);
    
    animation: expShine 2s ease-in-out infinite;
}

/* 经验条满级态 */
.cqj-progress-exp.max {
    background: linear-gradient(90deg, 
        rgba(255, 215, 0, 0.2) 0%, 
        rgba(201, 169, 97, 0.2) 100%);
}

.cqj-progress-exp.max .cqj-progress-exp-bar {
    background: linear-gradient(90deg, 
        #C9A961 0%, 
        #FFD700 50%,
        #FFE066 100%);
}
```

#### 4.6.2 体力条

```css
/* 体力条 */
.cqj-progress-stamina {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.4);
    
    overflow: hidden;
}

.cqj-progress-stamina-bar {
    height: 100%;
    border-radius: 3px;
    
    background: linear-gradient(90deg, 
        #E74C3C 0%, 
        #FF6B5B 100%);
    
    transition: width 0.3s ease;
}

/* 体力不足警告 */
.cqj-progress-stamina.low .cqj-progress-stamina-bar {
    animation: staminaPulse 1s ease-in-out infinite;
}

/* 体力恢复提示 */
.cqj-progress-stamina-ripple {
    position: absolute;
    right: 0;
    width: 20px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(231, 76, 60, 0.5));
    
    animation: staminaRecover 3s linear infinite;
}
```

#### 4.6.3 血条

```css
/* 血条 */
.cqj-progress-hp {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.5);
    
    overflow: hidden;
}

.cqj-progress-hp-bar {
    height: 100%;
    border-radius: 2px;
    
    background: linear-gradient(90deg, 
        #2ECC71 0%, 
        #58D68D 100%);
    
    transition: width 0.2s ease;
}

/* 血量危险态 */
.cqj-progress-hp.danger .cqj-progress-hp-bar {
    background: linear-gradient(90deg, 
        #E74C3C 0%, 
        #FF6B5B 100%);
}

/* 血量护盾 */
.cqj-progress-hp-shield {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 2px;
    
    background: rgba(74, 158, 255, 0.5);
    border: 1px solid rgba(74, 158, 255, 0.8);
}
```

#### 4.6.4 怒气条

```css
/* 怒气条 */
.cqj-progress-rage {
    width: 100%;
    height: 10px;
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.4);
    
    overflow: hidden;
    position: relative;
}

.cqj-progress-rage-bar {
    height: 100%;
    border-radius: 5px;
    
    background: linear-gradient(90deg, 
        #9B59B6 0%, 
        #BB8FCE 100%);
    
    transition: width 0.3s ease;
    
    box-shadow: 0 0 10px rgba(155, 89, 182, 0.5);
}

/* 怒气满释放态 */
.cqj-progress-rage.full .cqj-progress-rage-bar {
    background: linear-gradient(90deg, 
        #FFD700 0%, 
        #FFE066 100%);
    
    animation: rageGlow 0.5s ease-in-out infinite alternate;
}

/* 怒气格 */
.cqj-progress-rage-segment {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(0, 0, 0, 0.3);
}
```

---

### 4.7 输入框

#### 4.7.1 搜索框

```css
/* 搜索框容器 */
.cqj-input-search {
    position: relative;
    width: 100%;
}

.cqj-input-search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    
    color: #6A6A6A;
    font-size: 16px;
    
    pointer-events: none;
}

.cqj-input-search input {
    width: 100%;
    height: 44px;
    padding: 0 44px;
    
    background: rgba(37, 43, 56, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 22px;
    
    font-family: var(--font-family-sans);
    font-size: 14px;
    color: #E8E6E1;
    
    transition: all 0.2s ease;
}

.cqj-input-search input::placeholder {
    color: #6A6A6A;
}

.cqj-input-search input:focus {
    outline: none;
    background: rgba(37, 43, 56, 1);
    border-color: rgba(201, 169, 97, 0.4);
    box-shadow: 0 0 12px rgba(201, 169, 97, 0.15);
}

/* 搜索框清除按钮 */
.cqj-input-search-clear {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    
    color: #9A9A9A;
    font-size: 14px;
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    cursor: pointer;
    transition: all 0.2s ease;
}

.cqj-input-search-clear:hover {
    background: rgba(231, 76, 60, 0.2);
    color: #E74C3C;
}
```

#### 4.7.2 数字输入

```css
/* 数字输入框组 */
.cqj-input-number {
    display: inline-flex;
    align-items: center;
    
    background: rgba(37, 43, 56, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    
    overflow: hidden;
}

.cqj-input-number-btn {
    width: 36px;
    height: 36px;
    
    background: transparent;
    border: none;
    
    color: #C9A961;
    font-size: 18px;
    
    cursor: pointer;
    transition: all 0.2s ease;
}

.cqj-input-number-btn:hover {
    background: rgba(201, 169, 97, 0.1);
}

.cqj-input-number-btn:active {
    background: rgba(201, 169, 97, 0.2);
}

.cqj-input-number-btn:disabled {
    color: #4A4A4A;
    cursor: not-allowed;
}

.cqj-input-number-value {
    width: 60px;
    height: 36px;
    
    background: transparent;
    border: none;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    
    font-family: var(--font-family-display);
    font-size: 16px;
    font-weight: 600;
    color: #F5F3EF;
    text-align: center;
}

.cqj-input-number-value:focus {
    outline: none;
    background: rgba(201, 169, 97, 0.05);
}

/* 最大最小提示 */
.cqj-input-number-tip {
    font-size: 11px;
    color: #6A6A6A;
    margin-left: 8px;
}

.cqj-input-number-tip.max {
    color: #E74C3C;
}
```

---

### 4.8 导航

#### 4.8.1 底部Tab

```css
/* 底部Tab容器 */
.cqj-tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    padding-bottom: env(safe-area-inset-bottom);
    
    background: linear-gradient(180deg, 
        rgba(26, 31, 40, 0.95) 0%, 
        rgba(10, 13, 18, 0.98) 100%);
    border-top: 1px solid rgba(201, 169, 97, 0.2);
    
    display: flex;
    align-items: center;
    justify-content: space-around;
    
    z-index: 100;
}

/* Tab项 */
.cqj-tabbar-item {
    flex: 1;
    height: 100%;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    
    color: #6A6A6A;
    text-decoration: none;
    
    position: relative;
    transition: all 0.2s ease;
}

.cqj-tabbar-item-icon {
    font-size: 24px;
    transition: transform 0.2s ease;
}

.cqj-tabbar-item-label {
    font-size: 10px;
    font-weight: 500;
}

.cqj-tabbar-item.active {
    color: #C9A961;
}

.cqj-tabbar-item.active .cqj-tabbar-item-icon {
    transform: scale(1.1);
}

/* Tab激活指示器 */
.cqj-tabbar-item.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    
    width: 30px;
    height: 2px;
    background: linear-gradient(90deg, 
        transparent 0%, 
        #C9A961 50%, 
        transparent 100%);
    
    border-radius: 1px;
}

/* 红点提示 */
.cqj-tabbar-item-badge {
    position: absolute;
    top: 8px;
    right: calc(50% - 18px);
    
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background: #E74C3C;
    
    font-size: 10px;
    font-weight: 600;
    color: #FFF;
    
    display: flex;
    align-items: center;
    justify-content: center;
}
```

#### 4.8.2 顶部导航

```css
/* 顶部导航栏 */
.cqj-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 48px;
    padding-top: env(safe-area-inset-top);
    
    background: linear-gradient(180deg, 
        rgba(10, 13, 18, 0.98) 0%, 
        rgba(10, 13, 18, 0) 100%);
    
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    z-index: 100;
}

/* 返回按钮 */
.cqj-navbar-back {
    width: 44px;
    height: 44px;
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    color: #C9A961;
    font-size: 20px;
    
    cursor: pointer;
    transition: all 0.2s ease;
}

.cqj-navbar-back:hover {
    color: #FFE066;
}

/* 导航标题 */
.cqj-navbar-title {
    font-family: var(--font-family-cn);
    font-size: 18px;
    font-weight: 600;
    color: #F5F3EF;
    
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* 右侧操作区 */
.cqj-navbar-actions {
    display: flex;
    gap: 4px;
}
```

#### 4.8.3 面包屑

```css
/* 面包屑导航 */
.cqj-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    
    padding: 12px 16px;
    
    font-size: 12px;
    color: #6A6A6A;
}

.cqj-breadcrumb-item {
    color: #9A9A9A;
    text-decoration: none;
    
    transition: color 0.2s ease;
}

.cqj-breadcrumb-item:hover {
    color: #C9A961;
}

.cqj-breadcrumb-item.current {
    color: #F5F3EF;
    cursor: default;
}

.cqj-breadcrumb-separator {
    color: #4A4A4A;
    font-size: 10px;
}
```

---

## 5. 图标风格

### 5.1 图标设计风格

```
┌─────────────────────────────────────────────────────────────┐
│                    图标设计规范                              │
├─────────────────────────────────────────────────────────────┤
│  1. 风格定位                                                 │
│     - 主风格：古风线描 + 轻质感填充                          │
│     - 线条：2px描边，圆角端点                                │
│     - 填充：单色或双色渐变，与背景形成对比                   │
│                                                             │
│  2. 视觉特征                                                 │
│     - 简洁抽象：去除细节，突出轮廓识别性                     │
│     - 象征隐喻：借用传统符号（星盘/罗盘/墓志铭等）            │
│     - 统一比例：视觉重量保持一致                             │
│                                                             │
│  3. 细节处理                                                 │
│     - 关键特征放大，便于小尺寸识别                           │
│     - 负空间运用，增强可辨识度                               │
│     - 适当留白，避免视觉拥挤                                 │
│                                                             │
│  4. 设计参考                                                 │
│     - 《阴阳师》：简洁线条 + 特色形状                        │
│     - 《原神》：几何化 + 色彩编码                            │
│     - 《崩坏：星穹铁道》：扁平 + 渐变质感                    │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 图标尺寸规范

| 图标类型 | 尺寸 | 使用场景 |
|---------|------|---------|
| 装饰图标 | 20px | 内联文字、辅助说明 |
| 功能图标 | 24px | Tab栏、导航、操作按钮 |
| 列表图标 | 32px | 列表项、菜单项 |
| 展示图标 | 48px | 大按钮、详情入口 |
| 卡片图标 | 64-80px | 道具、宝物卡片 |
| 头像图标 | 96-120px | 角色头像、英雄卡片 |
| 特大图标 | 160px+ | 空状态、错误提示 |

### 5.3 图标颜色规范

```css
/* 图标颜色变量 */
--icon-color-default: #9A9A9A;      /* 默认态 */
--icon-color-hover: #C9A961;        /* 悬停态 */
--icon-color-active: #FFE066;       /* 激活态 */
--icon-color-disabled: #4A4A4A;     /* 禁用态 */

/* 功能色图标 */
--icon-color-success: #2ECC71;
--icon-color-warning: #F39C12;
--icon-color-error: #E74C3C;
--icon-color-info: #3498DB;

/* 品质色图标 */
--icon-color-n: #9A9A9A;
--icon-color-r: #4A9EFF;
--icon-color-sr: #BB8FCE;
--icon-color-ssr: #FFD700;
--icon-color-ur: #FF6B35;

/* 传承色图标 */
--icon-color-xingwen: #C9A961;
--icon-color-xuanji: #4ECDC4;
--icon-color-chenxiu: #E74C3C;
--icon-color-tianshu: #9B59B6;
```

### 5.4 图标使用示例

```css
/* 图标容器 */
.cqj-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    width: 24px;
    height: 24px;
    
    font-size: 20px;
    color: var(--icon-color-default);
    
    transition: color 0.2s ease;
}

.cqj-icon:hover {
    color: var(--icon-color-hover);
}

/* 带描边的图标 */
.cqj-icon-outline {
    background: transparent;
    border-radius: 50%;
    box-shadow: 
        0 0 0 2px currentColor,
        inset 0 0 0 1px currentColor;
}

/* 带背景的图标 */
.cqj-icon-bg {
    background: rgba(201, 169, 97, 0.15);
    border-radius: 8px;
}

/* 发光图标 */
.cqj-icon-glow {
    filter: drop-shadow(0 0 6px currentColor);
}
```

---

## 6. 动效规范

### 6.1 过渡动画

```css
/* 基础过渡时长 */
--transition-fast: 0.15s;      /* 微交互：hover、toggle */
--transition-normal: 0.25s;    /* 标准：展开、收起 */
--transition-slow: 0.4s;       /* 大型：页面切换 */

/* 缓动函数 */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* 弹性缓动 - 按钮按下、弹窗 */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* 关键帧动画 */

/* 淡入 */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* 淡出 */
@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

/* 从下方滑入 */
@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY(30px); 
    }
    to { 
        opacity: 1;
        transform: translateY(0); 
    }
}

/* 从上方滑入 */
@keyframes slideDown {
    from { 
        opacity: 0;
        transform: translateY(-30px); 
    }
    to { 
        opacity: 1;
        transform: translateY(0); 
    }
}

/* 缩放淡入 */
@keyframes scaleIn {
    from { 
        opacity: 0;
        transform: scale(0.9); 
    }
    to { 
        opacity: 1;
        transform: scale(1); 
    }
}

/* 旋转淡入 */
@keyframes spinIn {
    from { 
        opacity: 0;
        transform: rotate(-10deg) scale(0.95); 
    }
    to { 
        opacity: 1;
        transform: rotate(0) scale(1); 
    }
}
```

### 6.2 弹窗动画

```css
/* 弹窗淡入 */
@keyframes modalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* 弹窗滑入 */
@keyframes modalSlideIn {
    from { 
        opacity: 0;
        transform: scale(0.95) translateY(20px);
    }
    to { 
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* 抽屉上滑 */
@keyframes drawerSlideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

/* 抽屉淡入 */
@keyframes drawerFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* 弹窗关闭 */
@keyframes modalClose {
    from { 
        opacity: 1;
        transform: scale(1); 
    }
    to { 
        opacity: 0;
        transform: scale(0.95); 
    }
}
```

### 6.3 按钮反馈

```css
/* 按钮按下缩放 */
@keyframes btnPress {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
}

/* 按钮点击涟漪效果 */
.cqj-btn-ripple {
    position: relative;
    overflow: hidden;
}

.cqj-btn-ripple::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.4s ease, height 0.4s ease, opacity 0.4s ease;
}

.cqj-btn-ripple:active::after {
    width: 200%;
    height: 200%;
    opacity: 0;
}
```

### 6.4 列表动画

```css
/* 列表项依次出现 */
@keyframes listItemIn {
    from { 
        opacity: 0;
        transform: translateX(-20px); 
    }
    to { 
        opacity: 1;
        transform: translateX(0); 
    }
}

.cqj-list-animate .cqj-list-item:nth-child(1) { animation-delay: 0ms; }
.cqj-list-animate .cqj-list-item:nth-child(2) { animation-delay: 50ms; }
.cqj-list-animate .cqj-list-item:nth-child(3) { animation-delay: 100ms; }
.cqj-list-animate .cqj-list-item:nth-child(4) { animation-delay: 150ms; }
.cqj-list-animate .cqj-list-item:nth-child(5) { animation-delay: 200ms; }

/* 卡片翻转 */
@keyframes cardFlip {
    0% { transform: rotateY(0deg); }
    50% { transform: rotateY(90deg); }
    100% { transform: rotateY(0deg); }
}

/* 卡片抽卡特效 */
@keyframes cardReveal {
    0% { 
        transform: translateY(-100px) rotateX(30deg);
        opacity: 0;
    }
    60% { 
        transform: translateY(10px) rotateX(-5deg);
        opacity: 1;
    }
    100% { 
        transform: translateY(0) rotateX(0);
        opacity: 1;
    }
}

/* 品质光效动画 */
@keyframes qualityGlow {
    0%, 100% { 
        filter: brightness(1) drop-shadow(0 0 8px var(--quality-glow));
    }
    50% { 
        filter: brightness(1.2) drop-shadow(0 0 16px var(--quality-glow));
    }
}

.cqj-card-hero.ssr .cqj-card-hero-inner {
    animation: qualityGlow 2s ease-in-out infinite;
}
```

### 6.5 特殊动效

```css
/* 星光闪烁 */
@keyframes starShine {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
}

/* 加载旋转 */
@keyframes loadingSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* 脉冲动画 */
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* 边框流光 */
@keyframes borderFlow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

.cqj-glow-border {
    background: linear-gradient(90deg, 
        var(--quality-color) 0%, 
        transparent 25%, 
        transparent 75%, 
        var(--quality-color) 100%);
    background-size: 200% 100%;
    animation: borderFlow 2s linear infinite;
}
```

---

## 7. 阴影与质感

### 7.1 卡片阴影

```css
/* 卡片默认阴影 */
.cqj-shadow-card {
    box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.2);
}

/* 卡片悬停阴影 */
.cqj-shadow-card-hover {
    box-shadow: 
        0 12px 32px rgba(0, 0, 0, 0.4),
        0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 卡片选中阴影 */
.cqj-shadow-card-selected {
    box-shadow: 
        0 0 0 2px var(--quality-color),
        0 12px 32px rgba(0, 0, 0, 0.4),
        0 0 24px var(--quality-glow);
}
```

### 7.2 弹窗阴影

```css
/* 弹窗阴影 */
.cqj-shadow-modal {
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.6),
        0 0 40px rgba(0, 0, 0, 0.3);
}

/* 底部抽屉阴影 */
.cqj-shadow-drawer {
    box-shadow: 
        0 -10px 40px rgba(0, 0, 0, 0.5),
        0 -2px 10px rgba(0, 0, 0, 0.3);
}
```

### 7.3 发光效果

```css
/* 品质发光 */
.cqj-glow-n { --quality-glow: transparent; }
.cqj-glow-r { --quality-glow: rgba(74, 158, 255, 0.4); }
.cqj-glow-sr { --quality-glow: rgba(155, 89, 182, 0.4); }
.cqj-glow-ssr { --quality-glow: rgba(255, 215, 0, 0.5); }
.cqj-glow-ur { --quality-glow: rgba(255, 107, 53, 0.5); }

/* 外发光 */
.cqj-outer-glow {
    box-shadow: 
        0 0 10px var(--quality-glow),
        0 0 20px var(--quality-glow),
        0 0 30px var(--quality-glow);
}

/* 内发光 */
.cqj-inner-glow {
    box-shadow: 
        inset 0 0 15px var(--quality-glow);
}

/* 文字发光 */
.cqj-text-glow {
    text-shadow: 
        0 0 10px var(--quality-glow),
        0 0 20px var(--quality-glow);
}
```

### 7.4 边框样式

```css
/* 渐变边框 */
.cqj-border-gradient {
    border: 1px solid transparent;
    background: 
        linear-gradient(#1A1F28, #1A1F28) padding-box,
        linear-gradient(135deg, var(--quality-color) 0%, transparent 50%, var(--quality-color) 100%) border-box;
}

/* 金属边框 */
.cqj-border-metal {
    border: 1px solid rgba(201, 169, 97, 0.4);
    box-shadow: 
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

/* 发光边框 */
.cqj-border-glow {
    border: 1px solid var(--quality-color);
    box-shadow: 
        0 0 8px var(--quality-glow),
        inset 0 0 8px var(--quality-glow);
}

/* 虚线边框 */
.cqj-border-dashed {
    border: 1px dashed rgba(255, 255, 255, 0.2);
}
```

---

## 8. 背景与纹理

### 8.1 弹窗背景

```css
/* 弹窗背景 - 古卷质感 */
.cqj-bg-modal {
    background: linear-gradient(180deg, 
        #1A1F28 0%, 
        #151920 50%,
        #0A0D12 100%);
    
    /* 纸张纹理叠加 */
    position: relative;
}

.cqj-bg-modal::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    
    opacity: 0.03;
    pointer-events: none;
}

/* 弹窗边缘晕影 */
.cqj-bg-modal::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    background: radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.3) 100%);
    
    pointer-events: none;
}
```

### 8.2 卡片背景

```css
/* 卡片背景 - 深邃质感 */
.cqj-bg-card {
    background: linear-gradient(180deg, 
        #252B38 0%, 
        #1A1F28 100%);
    
    position: relative;
}

/* 卡片顶部高光 */
.cqj-bg-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    
    background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.03) 0%, 
        transparent 100%);
    
    pointer-events: none;
}

/* 品质边框光效 */
.cqj-bg-card.quality::after {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    
    border-radius: inherit;
    background: linear-gradient(135deg, var(--quality-color) 0%, transparent 50%, var(--quality-color) 100%);
    
    opacity: 0.3;
    z-index: -1;
}
```

### 8.3 按钮背景

```css
/* 主要按钮背景 */
.cqj-bg-btn-primary {
    background: linear-gradient(180deg, 
        #D4B86A 0%, 
        #C9A961 50%, 
        #8B7340 100%);
    
    /* 金属光泽 */
    position: relative;
}

.cqj-bg-btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    
    background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.25) 0%, 
        transparent 100%);
    
    border-radius: inherit;
    pointer-events: none;
}

/* 次要按钮背景 */
.cqj-bg-btn-secondary {
    background: linear-gradient(180deg, 
        #3A4150 0%, 
        #252B38 100%);
    
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 次要按钮悬停 */
.cqj-bg-btn-secondary:hover {
    background: linear-gradient(180deg, 
        #4A5568 0%, 
        #3A4150 100%);
}
```

### 8.4 装饰元素

```css
/* 星辉装饰 - 右上角 */
.cqj-deco-star-top {
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    
    background: radial-gradient(ellipse at top right, 
        rgba(201, 169, 97, 0.15) 0%, 
        transparent 70%);
    
    pointer-events: none;
}

/* 星辉装饰 - 左下角 */
.cqj-deco-star-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 60px;
    
    background: radial-gradient(ellipse at bottom left, 
        rgba(201, 169, 97, 0.1) 0%, 
        transparent 70%);
    
    pointer-events: none;
}

/* 祥云装饰 */
.cqj-deco-cloud {
    position: absolute;
    
    background-repeat: no-repeat;
    background-size: contain;
    opacity: 0.1;
    
    pointer-events: none;
}

/* 符纹装饰线 */
.cqj-deco-line {
    height: 1px;
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(201, 169, 97, 0.3) 20%, 
        rgba(201, 169, 97, 0.5) 50%, 
        rgba(201, 169, 97, 0.3) 80%, 
        transparent 100%);
}

/* 角花装饰 */
.cqj-deco-corner {
    position: absolute;
    width: 24px;
    height: 24px;
    
    border-color: rgba(201, 169, 97, 0.4);
    border-style: solid;
    border-width: 0;
}

.cqj-deco-corner.top-left {
    top: 0;
    left: 0;
    border-top-width: 2px;
    border-left-width: 2px;
}

.cqj-deco-corner.top-right {
    top: 0;
    right: 0;
    border-top-width: 2px;
    border-right-width: 2px;
}

.cqj-deco-corner.bottom-left {
    bottom: 0;
    left: 0;
    border-bottom-width: 2px;
    border-left-width: 2px;
}

.cqj-deco-corner.bottom-right {
    bottom: 0;
    right: 0;
    border-bottom-width: 2px;
    border-right-width: 2px;
}
```

---

## 9. 附录：CSS变量速查表

```css
/* ============================================
   《苍穹劫·摸金传人》CSS变量完整定义
   ============================================ */

/* === 基础颜色 === */
:root {
    /* 玄夜色系 */
    --color-bg-primary: #0A0D12;
    --color-bg-secondary: #1A1F28;
    --color-bg-tertiary: #252B38;
    --color-bg-quaternary: #3A4150;
    
    /* 文字色 */
    --color-text-primary: #F5F3EF;
    --color-text-secondary: #E8E6E1;
    --color-text-tertiary: #9A9A9A;
    --color-text-disabled: #5A5A5A;
    
    /* 强调色 */
    --color-gold: #C9A961;
    --color-gold-light: #D4B86A;
    --color-gold-dark: #8B7340;
    --color-gold-shine: #FFD700;
    
    --color-purple: #6B4C9A;
    --color-purple-light: #9B59B6;
    --color-cyan: #4ECDC4;
    
    /* 功能色 */
    --color-success: #2ECC71;
    --color-warning: #F39C12;
    --color-error: #E74C3C;
    --color-info: #3498DB;
    
    /* 品质色 */
    --color-n: #8B8B8B;
    --color-r: #4A9EFF;
    --color-sr: #9B59B6;
    --color-ssr: #FFD700;
    --color-ur: #FF6B35;
    
    /* 传承色 */
    --color-xingwen: #C9A961;     /* 星纹摸金 */
    --color-xuanji: #4ECDC4;     /* 璇玑搬山 */
    --color-chenxiu: #E74C3C;     /* 辰宿卸岭 */
    --color-tianshu: #9B59B6;     /* 天枢发丘 */
    
    /* === 字体 === */
    --font-family-cn: "Noto Serif SC", "SimSun", serif;
    --font-family-sans: "Noto Sans SC", "Microsoft YaHei", sans-serif;
    --font-family-display: "DIN Alternate", "Helvetica Neue", sans-serif;
    --font-family-mono: "SF Mono", "Menlo", monospace;
    
    /* 字号 */
    --font-size-xl: 36px;
    --font-size-lg: 28px;
    --font-size-md: 22px;
    --font-size-base: 16px;
    --font-size-sm: 14px;
    --font-size-xs: 12px;
    
    /* 字重 */
    --font-weight-bold: 700;
    --font-weight-semibold: 600;
    --font-weight-medium: 500;
    --font-weight-regular: 400;
    
    /* === 间距 === */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 24px;
    --spacing-xxl: 32px;
    
    /* === 圆角 === */
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --radius-xl: 12px;
    --radius-full: 9999px;
    
    /* === 阴影 === */
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
    --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.5);
    
    /* === 动画 === */
    --transition-fast: 0.15s;
    --transition-normal: 0.25s;
    --transition-slow: 0.4s;
    --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    
    /* === Z-Index === */
    --z-dropdown: 100;
    --z-sticky: 200;
    --z-fixed: 300;
    --z-modal-backdrop: 900;
    --z-modal: 1000;
    --z-toast: 2000;
    --z-tooltip: 3000;
}
```

---

## 修订记录

| 版本 | 日期 | 修订内容 | 修订人 |
|------|------|---------|--------|
| 1.0 | 2025-01 | 初始版本，完成基础控件规范 | UI设计组 |

---

> **设计理念**：「星盘秘卷，古墓探幽」——《苍穹劫·摸金传人》的UI设计致力于为玩家营造沉浸式的盗墓探险氛围，在神秘古风中融入现代交互体验，让每一次点击都如同翻开一页尘封的古卷。
