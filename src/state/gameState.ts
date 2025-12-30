import { Atom } from "@effect-atom/atom-react";
import type {
	EquippedItems,
	InventorySlot,
	Item,
	PlayerStats,
} from "@/engine/player/Equipment";

/**
 * Equipped items atom - current equipment in each slot
 */
export const equippedItemsAtom = Atom.make<EquippedItems>({
	HEAD: undefined,
	TORSO: undefined,
	LEGS: undefined,
	MAINHAND: undefined,
	OFFHAND: undefined,
	RING: undefined,
	NECKLACE: undefined,
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
