import { Atom } from "@effect-atom/atom";
import { Schema } from "effect";
import type { HeroClass } from "@/data/heroClasses";
import { atomRuntime } from "./atomRuntime";

/**
 * Player character data
 */
export interface PlayerData {
	name: string;
	class: HeroClass;
	level: number;
	currentExp: number;
	expToNextLevel: number;
	stats: {
		strength: number;
		dexterity: number;
		intelligence: number;
		health: number;
		currentHealth: number;
		attack: number;
		defense: number;
		speed: number;
	};
	gold: number;
	location: string;
	timePlayed: number; // in seconds
	lastPlayed: number; // timestamp
}

/**
 * Schema for player data validation
 */
const PlayerDataSchema = Schema.Struct({
	name: Schema.String,
	class: Schema.Literal("warrior", "mage", "rogue"),
	level: Schema.Number,
	currentExp: Schema.Number,
	expToNextLevel: Schema.Number,
	stats: Schema.Struct({
		strength: Schema.Number,
		dexterity: Schema.Number,
		intelligence: Schema.Number,
		health: Schema.Number,
		currentHealth: Schema.Number,
		attack: Schema.Number,
		defense: Schema.Number,
		speed: Schema.Number,
	}),
	gold: Schema.Number,
	location: Schema.String,
	timePlayed: Schema.Number,
	lastPlayed: Schema.Number,
});

/**
 * Current player state atom (null when no active game)
 */
export const currentPlayerAtom = Atom.kvs({
	runtime: atomRuntime,
	key: "ein-current-player",
	schema: Schema.Union(PlayerDataSchema, Schema.Null),
	defaultValue: () => null,
});

/**
 * Create initial player data from hero creation
 */
export function createPlayerData(
	name: string,
	heroClass: HeroClass,
	baseStats: {
		strength: number;
		dexterity: number;
		intelligence: number;
		health: number;
		attack: number;
		defense: number;
	},
): PlayerData {
	return {
		name,
		class: heroClass,
		level: 1,
		currentExp: 0,
		expToNextLevel: 100,
		stats: {
			...baseStats,
			currentHealth: baseStats.health,
			speed: 10,
		},
		gold: 100,
		location: "Starting Village",
		timePlayed: 0,
		lastPlayed: Date.now(),
	};
}

/**
 * Format time played for display
 */
export function formatTimePlayed(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m`;
}
