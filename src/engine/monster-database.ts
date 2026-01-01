import type { MonsterTemplate } from "./monster";
import { Stats } from "./stats";

export const MONSTER_TEMPLATES: Record<string, MonsterTemplate> = {
	SLIME: {
		name: "Slime",
		level: 1,
		stats: new Stats(),
		baseHealth: 20,
		baseAttack: 3,
		baseDefense: 1,
		baseSpeed: 3,
		expReward: 10,
	},

	GOBLIN: {
		name: "Goblin",
		level: 2,
		stats: {
			strength: 2,
			dexterity: 3,
			intelligence: 1,
			willpower: 1,
			luck: 2,
			speed: 1,
		},
		baseHealth: 35,
		baseAttack: 6,
		baseDefense: 2,
		baseSpeed: 7,
		expReward: 20,
	},

	WOLF: {
		name: "Wolf",
		level: 3,
		stats: {
			strength: 3,
			dexterity: 4,
			intelligence: 1,
			willpower: 2,
			luck: 2,
			speed: 2,
		},
		baseHealth: 45,
		baseAttack: 8,
		baseDefense: 3,
		baseSpeed: 9,
		expReward: 30,
	},

	ORC: {
		name: "Orc",
		level: 4,
		stats: {
			strength: 5,
			dexterity: 2,
			intelligence: 1,
			willpower: 3,
			luck: 1,
			speed: 3,
		},
		baseHealth: 70,
		baseAttack: 12,
		baseDefense: 5,
		baseSpeed: 5,
		expReward: 50,
	},

	DARK_KNIGHT: {
		name: "Dark Knight",
		level: 6,
		stats: {
			strength: 7,
			dexterity: 5,
			intelligence: 3,
			willpower: 6,
			luck: 3,
			speed: 4,
		},
		baseHealth: 120,
		baseAttack: 18,
		baseDefense: 10,
		baseSpeed: 8,
		expReward: 100,
	},

	SKELETON: {
		name: "Skeleton",
		level: 3,
		stats: {
			strength: 3,
			dexterity: 3,
			intelligence: 1,
			willpower: 1,
			luck: 1,
			speed: 4,
		},
		baseHealth: 40,
		baseAttack: 7,
		baseDefense: 2,
		baseSpeed: 6,
		expReward: 25,
	},

	SPIDER: {
		name: "Giant Spider",
		level: 4,
		stats: {
			strength: 4,
			dexterity: 6,
			intelligence: 1,
			willpower: 2,
			luck: 2,
			speed: 4,
		},
		baseHealth: 50,
		baseAttack: 10,
		baseDefense: 3,
		baseSpeed: 10,
		expReward: 40,
	},

	TROLL: {
		name: "Troll",
		level: 5,
		stats: {
			strength: 8,
			dexterity: 1,
			intelligence: 1,
			willpower: 5,
			luck: 1,
			speed: 3,
		},
		baseHealth: 100,
		baseAttack: 15,
		baseDefense: 8,
		baseSpeed: 4,
		expReward: 75,
	},

	DEMON: {
		name: "Demon",
		level: 7,
		stats: {
			strength: 8,
			dexterity: 6,
			intelligence: 7,
			willpower: 8,
			luck: 5,
			speed: 6,
		},
		baseHealth: 150,
		baseAttack: 22,
		baseDefense: 12,
		baseSpeed: 11,
		expReward: 150,
	},

	DRAGON: {
		name: "Dragon",
		level: 10,
		stats: {
			strength: 15,
			dexterity: 8,
			intelligence: 10,
			willpower: 12,
			luck: 8,
			speed: 10,
		},
		baseHealth: 300,
		baseAttack: 35,
		baseDefense: 20,
		baseSpeed: 12,
		expReward: 500,
	},
};

export function getMonstersByLevel(level: number): MonsterTemplate[] {
	return Object.values(MONSTER_TEMPLATES).filter(
		(monster) =>
			monster.level >= Math.max(1, level - 1) && monster.level <= level + 2,
	);
}

export function getRandomMonster(level: number): MonsterTemplate {
	const availableMonsters = getMonstersByLevel(level);
	const monster =
		availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
	if (!monster) {
		throw new Error(`No monsters available for level ${level}`);
	}
	return monster;
}
