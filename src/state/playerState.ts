import { Atom } from "@effect-atom/atom";
import { Schema } from "effect";
import type { ClassInfo, HeroClass } from "@/data/heroClasses";
import type { EquippedItems, ItemStats } from "@/engine/player/Equipment";
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

export const equippedItemsAtom = Atom.writable(
	(get) => {
		const p = get(currentPlayerAtom);
		if (!p) return {};
		return p.items;
	},
	(ctx, newItems: EquippedItems) => {
		const player = ctx.get(currentPlayerAtom);
		if (player) {
			const updatedPlayer = { ...player, items: newItems };
			ctx.set(currentPlayerAtom, { ...updatedPlayer });
		}
	},
);

export const statsWithInventoryAtom = Atom.make((get) => {
	const player = get(currentPlayerAtom);

	if (!player) return null;

	const totalStats = {
		...player.stats,
		attack: 1,
		defence: 1,
		health: player.health,
	};

	for (const item of Object.values(player.items)) {
		totalStats.attack += item.stats.attack ?? 0;
		totalStats.defence += item.stats.defense ?? 0;
		totalStats.health += item.stats.health ?? 0;

		totalStats.dexterity += item.stats.dexterity ?? 0;
		totalStats.strength += item.stats.strength ?? 0;
		totalStats.willpower += item.stats.willpower ?? 0;
		totalStats.speed += item.stats.speed ?? 0;
		totalStats.intelligence += item.stats.intelligence ?? 0;
		totalStats.luck += item.stats.luck ?? 0;
	}

	return totalStats as ItemStats;
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
		items: {},
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
