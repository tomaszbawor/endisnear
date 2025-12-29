import { type CombatStats, Entity } from "./entity";
import type { Stats } from "./stats";

export interface MonsterTemplate {
	name: string;
	stats: Stats;
	baseHealth: number;
	baseAttack: number;
	baseDefense: number;
	baseSpeed: number;
	expReward: number;
	level: number;
}

export class Monster extends Entity {
	name: string;
	stats: Stats;
	combatStats: CombatStats;
	expReward: number;
	level: number;

	constructor(template: MonsterTemplate) {
		super();
		this.name = template.name;
		this.stats = { ...template.stats };
		this.expReward = template.expReward;
		this.level = template.level;

		this.combatStats = {
			maxHealth: template.baseHealth,
			health: template.baseHealth,
			attack: template.baseAttack,
			defense: template.baseDefense,
			speed: template.baseSpeed,
		};
	}

	clone(): Monster {
		return new Monster({
			name: this.name,
			stats: { ...this.stats },
			baseHealth: this.combatStats.maxHealth,
			baseAttack: this.combatStats.attack,
			baseDefense: this.combatStats.defense,
			baseSpeed: this.combatStats.speed,
			expReward: this.expReward,
			level: this.level,
		});
	}
}
