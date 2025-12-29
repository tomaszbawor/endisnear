import { Atom } from "@effect-atom/atom-react";
import {
	EquipmentSlot,
	type EquippedItems,
	type InventorySlot,
	type Item,
	type PlayerStats,
} from "@/types/equipment";

/**
 * Player stats atom - level, exp, base stats
 */
export const playerStatsAtom = Atom.make<PlayerStats>({
	level: 1,
	currentExp: 0,
	expToNextLevel: 100,
	baseStats: {
		attack: 10,
		defense: 5,
		health: 100,
		speed: 10,
		strength: 5,
		dexterity: 5,
		intelligence: 5,
	},
	totalStats: {
		attack: 10,
		defense: 5,
		health: 100,
		speed: 10,
		strength: 5,
		dexterity: 5,
		intelligence: 5,
	},
});

/**
 * Equipped items atom - current equipment in each slot
 */
export const equippedItemsAtom = Atom.make<EquippedItems>({
	[EquipmentSlot.HEAD]: undefined,
	[EquipmentSlot.TORSO]: undefined,
	[EquipmentSlot.LEGS]: undefined,
	[EquipmentSlot.MAINHAND]: undefined,
	[EquipmentSlot.OFFHAND]: undefined,
	[EquipmentSlot.RING]: undefined,
	[EquipmentSlot.NECKLACE]: undefined,
});

/**
 * Inventory atom - 20 slot inventory grid
 */
export const inventoryAtom = Atom.make<InventorySlot[]>(
	Array.from({ length: 21 }, () => ({ item: null, quantity: 0 })),
);

/**
 * Current gold amount
 */
export const goldAtom = Atom.make<number>(100000);

/**
 * Current game view (battle, map, inventory, shop, settings)
 */
export type GameView = "battle" | "map" | "inventory" | "shop" | "settings";
export const currentViewAtom = Atom.make<GameView>("battle");

/**
 * Selected area for combat
 */
export const selectedAreaAtom = Atom.make<string | null>(null);

/**
 * Shop items - rotates every 5 minutes
 */
export const shopItemsAtom = Atom.make<Item[]>([]);

/**
 * Last shop rotation timestamp
 */
export const lastShopRotationAtom = Atom.make<number>(Date.now());

/**
 * Helper: Calculate total stats from base stats + equipment bonuses
 */
export function calculateTotalStats(
	baseStats: PlayerStats["baseStats"],
	equipment: EquippedItems,
): PlayerStats["totalStats"] {
	const total = { ...baseStats };

	// Add bonuses from each equipped item
	for (const item of Object.values(equipment)) {
		if (item?.stats) {
			total.attack = (total.attack ?? 0) + (item.stats.attack ?? 0);
			total.defense = (total.defense ?? 0) + (item.stats.defense ?? 0);
			total.health = (total.health ?? 0) + (item.stats.health ?? 0);
			total.speed = (total.speed ?? 0) + (item.stats.speed ?? 0);
			total.strength = (total.strength ?? 0) + (item.stats.strength ?? 0);
			total.dexterity = (total.dexterity ?? 0) + (item.stats.dexterity ?? 0);
			total.intelligence =
				(total.intelligence ?? 0) + (item.stats.intelligence ?? 0);
		}
	}

	return total;
}
