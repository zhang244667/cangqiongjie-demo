/**
 * 《苍穹劫》统一游戏数据管理器
 * 负责所有游戏数据的存储、读取和同步
 */

const GameDataManager = {
    STORAGE_KEY: 'cangqiongjie_save',

    defaultData: {
        player: {
            name: '摸金传人',
            level: 1,
            gold: 125000,
            diamonds: 5000,
            lastSaveTime: Date.now()
        },
        heroes: {
            tieZhu: {
                id: 'tieZhu',
                name: '铁柱',
                icon: '💪',
                class: '搬山道人',
                rarity: 'R',
                stats: { hp: 120, atk: 20, def: 8, speed: 85, critRate: 5, critDamage: 150 },
                growth: { hp: 10, atk: 1.5, def: 0.8, speed: 0.5 },
                skills: {
                    normal: { name: '冲锋', desc: '对敌人造成120%攻击力伤害', level: 1 },
                    rage: { name: '破甲一击', desc: '对敌人造成200%攻击力伤害，30%穿甲', level: 1, rageCost: 100 },
                    passive: { name: '铜墙铁壁', desc: '受到伤害-15%', level: 1 }
                },
                level: 150,
                exp: 12345,
                breakLevel: 3,
                starLevel: 4,
                equippedTreasure: 'faYin'
            },
            xingJiSi: {
                id: 'xingJiSi',
                name: '星祭司',
                icon: '🔮',
                class: '秘法师',
                rarity: 'SR',
                stats: { hp: 75, atk: 24, def: 4, speed: 110, critRate: 10, critDamage: 160 },
                growth: { hp: 8, atk: 2, def: 0.5, speed: 1 },
                skills: {
                    normal: { name: '星芒', desc: '对敌人造成110%攻击力伤害', level: 1 },
                    rage: { name: '星辰坠落', desc: '对敌人造成250%攻击力伤害', level: 1, rageCost: 100 },
                    passive: { name: '星之守护', desc: '速度+15%', level: 1 }
                },
                level: 120,
                exp: 0,
                breakLevel: 2,
                starLevel: 3,
                equippedTreasure: null
            },
            moJinShou: {
                id: 'moJinShou',
                name: '摸金手',
                icon: '🔭',
                class: '摸金校尉',
                rarity: 'SR',
                stats: { hp: 90, atk: 22, def: 5, speed: 105, critRate: 8, critDamage: 155 },
                growth: { hp: 9, atk: 1.8, def: 0.6, speed: 0.8 },
                skills: {
                    normal: { name: '寻龙诀', desc: '对敌人造成115%攻击力伤害', level: 1 },
                    rage: { name: '分金定穴', desc: '对敌人造成220%攻击力伤害，发现宝藏', level: 1, rageCost: 100 },
                    passive: { name: '风水洞察', desc: '暴击率+10%', level: 1 }
                },
                level: 80,
                exp: 5000,
                breakLevel: 1,
                starLevel: 2,
                equippedTreasure: 'moJinFu'
            },
            banShanKe: {
                id: 'banShanKe',
                name: '搬山客',
                icon: '🔧',
                class: '搬山道人',
                rarity: 'R',
                stats: { hp: 95, atk: 21, def: 6, speed: 95, critRate: 6, critDamage: 152 },
                growth: { hp: 9.5, atk: 1.7, def: 0.7, speed: 0.6 },
                skills: {
                    normal: { name: '机关术', desc: '对敌人造成105%攻击力伤害', level: 1 },
                    rage: { name: '千斤坠', desc: '对敌人造成180%攻击力伤害，眩晕1回合', level: 1, rageCost: 100 },
                    passive: { name: '机关破解', desc: '对机关敌人伤害+30%', level: 1 }
                },
                level: 200,
                exp: 30000,
                breakLevel: 4,
                starLevel: 5,
                equippedTreasure: 'heiLvTi'
            }
        },
        treasures: {
            faYin: {
                id: 'faYin',
                name: '发丘印',
                icon: '💎',
                type: '法器',
                quality: 'SSR',
                level: 35,
                breakLevel: 3,
                exp: 15000,
                mainAttr: { type: 'atk', value: 18, isPercent: true },
                subAttr: { type: 'rageDmg', value: 25, isPercent: true },
                specialEffect: '怒攻必定暴击',
                ownerHeroId: 'tieZhu'
            },
            moJinFu: {
                id: 'moJinFu',
                name: '摸金符',
                icon: '📿',
                type: '法器',
                quality: 'SSR',
                level: 20,
                breakLevel: 2,
                exp: 8000,
                mainAttr: { type: 'critRate', value: 25, isPercent: true },
                subAttr: { type: 'critDmg', value: 30, isPercent: true },
                specialEffect: '暴击时无视防御',
                ownerHeroId: 'moJinShou'
            },
            heiLvTi: {
                id: 'heiLvTi',
                name: '黑驴蹄子',
                icon: '🦴',
                type: '防护',
                quality: 'SR',
                level: 40,
                breakLevel: 4,
                exp: 22000,
                mainAttr: { type: 'hp', value: 25, isPercent: true },
                subAttr: { type: 'resist', value: 15, isPercent: true },
                specialEffect: '免疫所有负面状态',
                ownerHeroId: 'banShanKe'
            },
            luoPan: {
                id: 'luoPan',
                name: '罗盘',
                icon: '🧭',
                type: '法器',
                quality: 'R',
                level: 15,
                breakLevel: 1,
                exp: 3000,
                mainAttr: { type: 'hit', value: 15, isPercent: true },
                subAttr: null,
                specialEffect: null,
                ownerHeroId: null
            },
            gongBinSha: {
                id: 'gongBinSha',
                name: '工兵铲',
                icon: '⛏️',
                type: '兵器',
                quality: 'R',
                level: 10,
                breakLevel: 1,
                exp: 1500,
                mainAttr: { type: 'atk', value: 12, isPercent: true },
                subAttr: { type: 'armorPen', value: 10, isPercent: true },
                specialEffect: null,
                ownerHeroId: null
            },
            bronzeMirror: {
                id: 'bronzeMirror',
                name: '青铜镜',
                icon: '🪞',
                type: '古董',
                quality: 'SR',
                level: 25,
                breakLevel: 2,
                exp: 10000,
                mainAttr: { type: 'def', value: 18, isPercent: true },
                subAttr: { type: 'reflect', value: 10, isPercent: true },
                specialEffect: '30%概率反弹伤害',
                ownerHeroId: null
            }
        },
        materials: {
            expPotionSmall: 50,
            expPotionMedium: 30,
            expPotionLarge: 10,
            breakStone: 500,
            heritageMaterial: 50,
            treasureExpStone: 200
        },
        heroFragments: {
            tieZhu: 45,
            xingJiSi: 30,
            moJinShou: 20,
            banShanKe: 80
        },
        summonData: {
            summonTickets: 1280,
            normalCount: 0,
            advanceCount: 0,
            history: []
        },
        backpack: {
            exp_potion_small: 50,
            exp_potion_medium: 30,
            exp_potion_large: 10,
            break_stone: 500,
            heritage_material: 50,
            treasure_exp_stone: 200,
            tieZhu_fragment: 45,
            xingJiSi_fragment: 30,
            moJinShou_fragment: 20,
            banShanKe_fragment: 80,
            gold_box_small: 5,
            first_aid: 3
        },
        dungeonProgress: {
            currentLevel: 1,
            maxUnlockedLevel: 1,
            completedLevels: []
        },
        tasks: {
            daily: [
                { id: 'DT001', name: '初探古墓', desc: '通关任意副本1次', type: 'combat', target: 1, progress: 0, claimed: false },
                { id: 'DT002', name: '古墓探险', desc: '通关任意副本3次', type: 'combat', target: 3, progress: 0, claimed: false },
                { id: 'DT003', name: '经验积累', desc: '使用经验药水5次', type: 'growth', target: 5, progress: 0, claimed: false },
                { id: 'DT004', name: '强化达人', desc: '强化装备3次', type: 'growth', target: 3, progress: 0, claimed: false },
                { id: 'DT005', name: '召唤试炼', desc: '进行召唤1次', type: 'resource', target: 1, progress: 0, claimed: false }
            ],
            weekly: [
                { id: 'WT001', name: '古墓探险家', desc: '通关副本50次', type: 'combat', target: 50, progress: 0, claimed: false },
                { id: 'WT002', name: '装备收集', desc: '获得10件紫色装备', type: 'resource', target: 10, progress: 0, claimed: false }
            ],
            achievements: [
                { id: 'AC001', name: '首次通关', desc: '通关第1章', type: 'main', target: 1, progress: 0, claimed: false },
                { id: 'AC002', name: '英雄收集', desc: '拥有3名英雄', type: 'main', target: 3, progress: 0, claimed: false },
                { id: 'AC003', name: '战力突破', desc: '总战力达到10000', type: 'power', target: 10000, progress: 0, claimed: false }
            ]
        },
        mail: {
            list: [
                { id: 'm001', type: 'system', title: '欢迎来到苍穹大陆', content: '欢迎入驻苍穹大陆！我们为您准备了新手大礼包，请查收。', hasAttachment: true, attachmentClaimed: false, items: [{ type: 'gold', amount: 1000 }, { type: 'item', id: 'summon_ticket_1', amount: 1 }], time: Date.now() - 86400000, expireTime: Date.now() + 604800000, isRead: false }
            ],
            unreadCount: 1
        },
        signIn: {
            consecutiveDays: 0,
            totalDays: 0,
            lastDate: null,
            makeupCards: 1,
            signedDays: []
        },
        arena: {
            tier: 'bronze',
            stars: 1,
            points: 0,
            seasonId: 'S1',
            seasonStart: Date.now(),
            dailyChallenges: 3,
            dailyFreeUsed: 0,
            totalBattles: 0,
            winCount: 0,
            loseCount: 0,
            currentStreak: 0,
            maxStreak: 0,
            lastBattleTime: null,
            opponentsRefreshTime: null
        },
        rankings: {
            powerRank: 0,
            arenaRank: 0
        },
        tutorial: {
            step: 0,
            phase: 1,
            completedPhases: [],
            skiped: false
        },
        teams: [
            { id: 0, name: '队伍一', isDefault: true, heroes: ['tieZhu', 'xingJiSi', 'moJinShou', 'banShanKe', null], formation: 'standard' },
            { id: 1, name: '队伍二', isDefault: false, heroes: [null, null, null, null, null], formation: 'standard' },
            { id: 2, name: '队伍三', isDefault: false, heroes: [null, null, null, null, null], formation: 'standard' }
        ]
    },

    data: null,

    init() {
        this.load();
        this.startAutoSave();
    },

    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = this.mergeWithDefault(parsed);
                console.log('游戏数据已加载');
            } else {
                this.data = JSON.parse(JSON.stringify(this.defaultData));
                console.log('使用默认数据');
            }
        } catch (e) {
            console.error('数据加载失败:', e);
            this.data = JSON.parse(JSON.stringify(this.defaultData));
        }
        return this.data;
    },

    save() {
        try {
            this.data.player.lastSaveTime = Date.now();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            console.log('游戏数据已保存');
            return true;
        } catch (e) {
            console.error('数据保存失败:', e);
            return false;
        }
    },

    mergeWithDefault(saved) {
        const merged = JSON.parse(JSON.stringify(this.defaultData));

        for (const key in saved) {
            if (typeof saved[key] === 'object' && saved[key] !== null) {
                merged[key] = this.deepMerge(merged[key], saved[key]);
            } else {
                merged[key] = saved[key];
            }
        }

        return merged;
    },

    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] === undefined) continue;
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                target[key] = target[key] || {};
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    },

    getPlayer() {
        return this.data.player;
    },

    getHeroes() {
        return this.data.heroes;
    },

    getHero(heroId) {
        return this.data.heroes[heroId];
    },

    updateHero(heroId, updates) {
        if (this.data.heroes[heroId]) {
            Object.assign(this.data.heroes[heroId], updates);
            this.save();
        }
    },

    getTreasures() {
        return this.data.treasures;
    },

    getTreasure(treasureId) {
        return this.data.treasures[treasureId];
    },

    getMaterials() {
        return this.data.materials;
    },

    getMaterial(materialId) {
        return this.data.materials[materialId] || 0;
    },

    addMaterial(materialId, amount) {
        this.data.materials[materialId] = (this.data.materials[materialId] || 0) + amount;
        this.save();
    },

    removeMaterial(materialId, amount) {
        if (this.data.materials[materialId] >= amount) {
            this.data.materials[materialId] -= amount;
            this.save();
            return true;
        }
        return false;
    },

    getBackpack() {
        return this.data.backpack;
    },

    addToBackpack(itemId, amount) {
        this.data.backpack[itemId] = (this.data.backpack[itemId] || 0) + amount;
        this.save();
    },

    removeFromBackpack(itemId, amount) {
        if (this.data.backpack[itemId] >= amount) {
            this.data.backpack[itemId] -= amount;
            if (this.data.backpack[itemId] <= 0) {
                delete this.data.backpack[itemId];
            }
            this.save();
            return true;
        }
        return false;
    },

    addGold(amount) {
        this.data.player.gold += amount;
        this.save();
    },

    removeGold(amount) {
        if (this.data.player.gold >= amount) {
            this.data.player.gold -= amount;
            this.save();
            return true;
        }
        return false;
    },

    addDiamonds(amount) {
        this.data.player.diamonds += amount;
        this.save();
    },

    removeDiamonds(amount) {
        if (this.data.player.diamonds >= amount) {
            this.data.player.diamonds -= amount;
            this.save();
            return true;
        }
        return false;
    },

    addSummonTickets(amount) {
        this.data.summonData.summonTickets += amount;
        this.save();
    },

    removeSummonTickets(amount) {
        if (this.data.summonData.summonTickets >= amount) {
            this.data.summonData.summonTickets -= amount;
            this.save();
            return true;
        }
        return false;
    },

    getTasks() {
        return this.data.tasks;
    },

    updateTaskProgress(taskId, amount = 1) {
        const allTasks = [...this.data.tasks.daily, ...this.data.tasks.weekly, ...this.data.tasks.achievements];
        const task = allTasks.find(t => t.id === taskId);
        if (task && task.progress < task.target) {
            task.progress = Math.min(task.progress + amount, task.target);
            this.save();
            return true;
        }
        return false;
    },

    claimTask(taskId) {
        const allTasks = [...this.data.tasks.daily, ...this.data.tasks.weekly, ...this.data.tasks.achievements];
        const task = allTasks.find(t => t.id === taskId);
        if (task && task.progress >= task.target && !task.claimed) {
            task.claimed = true;
            this.save();
            return true;
        }
        return false;
    },

    getMail() {
        return this.data.mail;
    },

    markMailAsRead(mailId) {
        const mail = this.data.mail.list.find(m => m.id === mailId);
        if (mail && !mail.isRead) {
            mail.isRead = true;
            this.data.mail.unreadCount = Math.max(0, this.data.mail.unreadCount - 1);
            this.save();
        }
    },

    claimMailAttachment(mailId) {
        const mail = this.data.mail.list.find(m => m.id === mailId);
        if (mail && mail.hasAttachment && !mail.attachmentClaimed) {
            mail.attachmentClaimed = true;
            if (mail.items) {
                mail.items.forEach(item => {
                    if (item.type === 'gold') this.addGold(item.amount);
                    else if (item.type === 'diamond') this.addDiamonds(item.amount);
                    else if (item.type === 'item') this.addToBackpack(item.id, item.amount);
                });
            }
            this.save();
            return true;
        }
        return false;
    },

    addMail(mail) {
        this.data.mail.list.unshift(mail);
        if (!mail.isRead) this.data.mail.unreadCount++;
        this.save();
    },

    getSignIn() {
        return this.data.signIn;
    },

    canSignInToday() {
        const today = new Date().toDateString();
        return this.data.signIn.lastDate !== today;
    },

    doSignIn() {
        if (!this.canSignInToday()) return false;
        const today = new Date();
        const todayStr = today.toDateString();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (this.data.signIn.lastDate === yesterday.toDateString()) {
            this.data.signIn.consecutiveDays++;
        } else if (this.data.signIn.lastDate !== todayStr) {
            this.data.signIn.consecutiveDays = 1;
        }

        this.data.signIn.lastDate = todayStr;
        this.data.signIn.totalDays++;
        this.data.signIn.signedDays.push(today.getDate());
        this.save();
        return true;
    },

    useMakeupCard() {
        if (this.data.signIn.makeupCards > 0) {
            this.data.signIn.makeupCards--;
            return true;
        }
        return false;
    },

    getArenaData() {
        return this.data.arena;
    },

    useArenaChallenge() {
        if (this.data.arena.dailyChallenges > this.data.arena.dailyFreeUsed) {
            this.data.arena.dailyFreeUsed++;
            this.save();
            return true;
        }
        return false;
    },

    getTeams() {
        return this.data.teams;
    },

    updateTeam(teamIndex, teamData) {
        if (this.data.teams[teamIndex]) {
            Object.assign(this.data.teams[teamIndex], teamData);
            this.save();
            return true;
        }
        return false;
    },

    setDefaultTeam(teamIndex) {
        this.data.teams.forEach((t, i) => t.isDefault = (i === teamIndex));
        this.save();
    },

    startAutoSave() {
        setInterval(() => {
            this.save();
        }, 30000);
    },

    resetData() {
        if (confirm('确定要重置所有游戏数据吗？此操作不可恢复！')) {
            localStorage.removeItem(this.STORAGE_KEY);
            this.data = JSON.parse(JSON.stringify(this.defaultData));
            this.save();
            location.reload();
        }
    },

    exportData() {
        return JSON.stringify(this.data, null, 2);
    },

    importData(jsonStr) {
        try {
            const imported = JSON.parse(jsonStr);
            this.data = this.mergeWithDefault(imported);
            this.save();
            return true;
        } catch (e) {
            console.error('数据导入失败:', e);
            return false;
        }
    }
};

window.GameDataManager = GameDataManager;
GameDataManager.init();