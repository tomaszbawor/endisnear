import { Atom } from "@effect-atom/atom";
import { Schema } from "effect";
import type { ClassInfo, HeroClass } from "@/data/heroClasses";
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
	classInfo: ClassInfo,
): PlayerData {
	return {
		name,
		class: heroClass,
		level: 1,
		currentExp: 0,
		health: classInfo.health,
		currentHealth: classInfo.health,

		expToNextLevel: 100,
		stats: {
			...classInfo.baseStats,
		},
		gold: 100,
		location: "Starting Village",
		timePlayed: 0,
		lastPlayed: Date.now(),
	};
}
