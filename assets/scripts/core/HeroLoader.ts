/**
 * 英雄配置加载器
 * 负责加载英雄数据和立绘资源
 */

import { resources } from 'cc';

export interface HeroData {
    id: string;
    name: string;
    quality: 'N' | 'R' | 'SR' | 'SSR' | 'UR';
    inheritance: '星纹摸金' | '璇玑搬山' | '辰宿卸岭' | '天枢发丘';
    position: string;
    portrait: string;
}

export class HeroLoader {
    private static instance: HeroLoader;
    private heroes: HeroData[] = [];
    private heroesMap: Map<string, HeroData> = new Map();
    private loaded: boolean = false;

    static getInstance(): HeroLoader {
        if (!this.instance) {
            this.instance = new HeroLoader();
        }
        return this.instance;
    }

    /**
     * 加载英雄配置数据
     */
    async loadHeroesConfig(): Promise<void> {
        if (this.loaded) return;

        return new Promise((resolve, reject) => {
            resources.load('config/heroes', (err: any, data: any) => {
                if (err) {
                    console.error('加载英雄配置失败:', err);
                    reject(err);
                    return;
                }
                
                this.heroes = data.json.heroes;
                this.heroes.forEach(hero => {
                    this.heroesMap.set(hero.id, hero);
                });
                this.loaded = true;
                console.log(`英雄配置加载完成，共 ${this.heroes.length} 个英雄`);
                resolve();
            });
        });
    }

    /**
     * 根据ID获取英雄数据
     */
    getHeroById(id: string): HeroData | undefined {
        return this.heroesMap.get(id);
    }

    /**
     * 获取所有英雄
     */
    getAllHeroes(): HeroData[] {
        return [...this.heroes];
    }

    /**
     * 按传承获取英雄列表
     */
    getHeroesByInheritance(inheritance: string): HeroData[] {
        return this.heroes.filter(h => h.inheritance === inheritance);
    }

    /**
     * 按品质获取英雄列表
     */
    getHeroesByQuality(quality: string): HeroData[] {
        return this.heroes.filter(h => h.quality === quality);
    }

    /**
     * 获取立绘资源路径
     */
    getPortraitPath(heroId: string): string | undefined {
        const hero = this.heroesMap.get(heroId);
        return hero ? hero.portrait : undefined;
    }
}

// 导出单例
export const heroLoader = HeroLoader.getInstance();
