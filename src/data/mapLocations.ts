/**
 * Map locations and monster data for the game world
 */

export interface MonsterStats {
	health: number;
	attack: number;
	defense: number;
	speed: number;
	experience: number;
	goldDrop: [number, number]; // min, max gold drop
}

export interface Monster {
	id: string;
	name: string;
	level: number;
	stats: MonsterStats;
	description: string;
}

export interface MapLocation {
	id: string;
	name: string;
	description: string;
	levelRequirement: number;
	coordinates: {
		x: number;
		y: number;
	};
	monsters: Monster[];
}

/**
 * Monster definitions
 */
const goblin: Monster = {
	id: "goblin",
	name: "Goblin",
	level: 1,
	stats: {
		health: 30,
		attack: 5,
		defense: 2,
		speed: 8,
		experience: 10,
		goldDrop: [5, 15],
	},
	description: "A small, green-skinned creature wielding a crude dagger",
};

const wolf: Monster = {
	id: "wolf",
	name: "Wolf",
	level: 2,
	stats: {
		health: 40,
		attack: 7,
		defense: 3,
		speed: 12,
		experience: 15,
		goldDrop: [8, 20],
	},
	description: "A fierce wolf with sharp fangs and gray fur",
};

const bandit: Monster = {
	id: "bandit",
	name: "Bandit",
	level: 3,
	stats: {
		health: 50,
		attack: 10,
		defense: 5,
		speed: 10,
		experience: 25,
		goldDrop: [15, 35],
	},
	description: "A ruthless outlaw armed with a short sword",
};

const orc: Monster = {
	id: "orc",
	name: "Orc",
	level: 5,
	stats: {
		health: 80,
		attack: 15,
		defense: 8,
		speed: 7,
		experience: 50,
		goldDrop: [30, 60],
	},
	description: "A brutish orc warrior with a massive axe",
};

const darkKnight: Monster = {
	id: "darkKnight",
	name: "Dark Knight",
	level: 7,
	stats: {
		health: 120,
		attack: 20,
		defense: 12,
		speed: 9,
		experience: 80,
		goldDrop: [50, 100],
	},
	description: "A fearsome knight clad in black armor",
};

const dragon: Monster = {
	id: "dragon",
	name: "Dragon",
	level: 10,
	stats: {
		health: 200,
		attack: 30,
		defense: 20,
		speed: 11,
		experience: 150,
		goldDrop: [100, 250],
	},
	description: "An ancient dragon with scales of crimson and gold",
};

export const MONSTERS = {
	goblin,
	wolf,
	bandit,
	orc,
	darkKnight,
	dragon,
} as const;

/**
 * Map locations with their coordinates and monsters
 */
export const MAP_LOCATIONS: MapLocation[] = [
	{
		id: "starting-village",
		name: "Starting Village",
		description:
			"A peaceful village where your journey begins. Safe from monsters.",
		levelRequirement: 1,
		coordinates: { x: 100, y: 300 },
		monsters: [],
	},
	{
		id: "goblin-forest",
		name: "Goblin Forest",
		description: "A dark forest inhabited by goblins and wolves.",
		levelRequirement: 1,
		coordinates: { x: 250, y: 200 },
		monsters: [MONSTERS.goblin, MONSTERS.wolf],
	},
	{
		id: "bandit-camp",
		name: "Bandit Camp",
		description: "A dangerous camp occupied by bandits and outlaws.",
		levelRequirement: 3,
		coordinates: { x: 400, y: 150 },
		monsters: [MONSTERS.bandit, MONSTERS.wolf],
	},
	{
		id: "orc-stronghold",
		name: "Orc Stronghold",
		description: "A fortified stronghold controlled by brutal orcs.",
		levelRequirement: 5,
		coordinates: { x: 550, y: 250 },
		monsters: [MONSTERS.orc, MONSTERS.bandit],
	},
	{
		id: "dark-castle",
		name: "Dark Castle",
		description: "An ominous castle guarded by dark knights.",
		levelRequirement: 7,
		coordinates: { x: 700, y: 200 },
		monsters: [MONSTERS.darkKnight, MONSTERS.orc],
	},
	{
		id: "dragon-peak",
		name: "Dragon's Peak",
		description: "The highest mountain peak, lair of an ancient dragon.",
		levelRequirement: 10,
		coordinates: { x: 850, y: 100 },
		monsters: [MONSTERS.dragon],
	},
];

/**
 * Get location by ID
 */
export function getLocationById(id: string): MapLocation | undefined {
	return MAP_LOCATIONS.find((loc) => loc.id === id);
}

/**
 * Get available locations for a player level
 */
export function getAvailableLocations(playerLevel: number): MapLocation[] {
	return MAP_LOCATIONS.filter((loc) => loc.levelRequirement <= playerLevel);
}
