import { Atom } from "@effect-atom/atom";
import { Schema } from "effect";
import type { HeroClass } from "@/data/heroClasses";
import { type PlayerData, PlayerDataSchema } from "@/engine/player/Player";
import { atomRuntime } from "./atomRuntime";

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
