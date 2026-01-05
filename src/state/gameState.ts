import { Atom } from "@effect-atom/atom-react";
import type { InventorySlot, Item } from "@/engine/player/Equipment";

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
export type GameView =
	| "battle"
	| "map"
	| "inventory"
	| "shop"
	| "settings"
	| "levelup";

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
