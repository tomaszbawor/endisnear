import type { Stats } from "./stats";

export interface CombatStats {
	health: number;
	maxHealth: number;
	attack: number;
	defense: number;
	speed: number;
}

export abstract class Entity {
	abstract name: string;
	abstract stats: Stats;
	abstract combatStats: CombatStats;

	isAlive(): boolean {
		return this.combatStats.health > 0;
	}

	takeDamage(damage: number): number {
		const actualDamage = Math.max(1, damage);
		this.combatStats.health = Math.max(
			0,
			this.combatStats.health - actualDamage,
		);
		return actualDamage;
	}

	heal(amount: number): number {
		const actualHealing = Math.min(
			amount,
			this.combatStats.maxHealth - this.combatStats.health,
		);
		this.combatStats.health += actualHealing;
		return actualHealing;
	}

	calculateDamage(target: Entity): number {
		const baseDamage = this.combatStats.attack + this.stats.strength * 2;
		const defense = target.combatStats.defense + target.stats.dexterity;
		const rawDamage = Math.max(1, baseDamage - defense * 0.5);
		const variance = 0.85 + Math.random() * 0.3;
		return Math.floor(rawDamage * variance);
	}
}
