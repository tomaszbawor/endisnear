/**
 * Equipment System Type Definitions
 */

export enum EquipmentSlot {
	HEAD = "head",
	TORSO = "torso",
	LEGS = "legs",
	MAINHAND = "mainhand",
	OFFHAND = "offhand",
	RING = "ring",
	NECKLACE = "necklace",
}

export enum ItemRarity {
	COMMON = "common",
	UNCOMMON = "uncommon",
	RARE = "rare",
	EPIC = "epic",
	LEGENDARY = "legendary",
}

export enum ItemType {
	WEAPON = "weapon",
	ARMOR = "armor",
	ACCESSORY = "accessory",
	CONSUMABLE = "consumable",
}

export interface ItemStats {
	attack?: number;
	defense?: number;
	health?: number;
	speed?: number;
	strength?: number;
	dexterity?: number;
	intelligence?: number;
}

export interface Item {
	id: string;
	name: string;
	description: string;
	type: ItemType;
	rarity: ItemRarity;
	slot?: EquipmentSlot; // Only for equippable items
	stats: ItemStats;
	price: number;
	iconUrl?: string; // For future icon support
}

export interface EquippedItems {
	[EquipmentSlot.HEAD]?: Item;
	[EquipmentSlot.TORSO]?: Item;
	[EquipmentSlot.LEGS]?: Item;
	[EquipmentSlot.MAINHAND]?: Item;
	[EquipmentSlot.OFFHAND]?: Item;
	[EquipmentSlot.RING]?: Item;
	[EquipmentSlot.NECKLACE]?: Item;
}

export interface InventorySlot {
	item: Item | null;
	quantity: number;
}

export interface PlayerStats {
	level: number;
	currentExp: number;
	expToNextLevel: number;
	baseStats: ItemStats;
	totalStats: ItemStats; // Base + equipment bonuses
}

/**
 * Rarity colors for UI
 */
export const RARITY_COLORS: Record<ItemRarity, string> = {
	[ItemRarity.COMMON]: "text-gray-400",
	[ItemRarity.UNCOMMON]: "text-green-400",
	[ItemRarity.RARE]: "text-blue-400",
	[ItemRarity.EPIC]: "text-purple-400",
	[ItemRarity.LEGENDARY]: "text-orange-400",
};

/**
 * Rarity border colors for UI
 */
export const RARITY_BORDER_COLORS: Record<ItemRarity, string> = {
	[ItemRarity.COMMON]: "border-gray-400",
	[ItemRarity.UNCOMMON]: "border-green-400",
	[ItemRarity.RARE]: "border-blue-400",
	[ItemRarity.EPIC]: "border-purple-400",
	[ItemRarity.LEGENDARY]: "border-orange-400",
};

/**
 * Equipment slot display names
 */
export const SLOT_NAMES: Record<EquipmentSlot, string> = {
	[EquipmentSlot.HEAD]: "Head",
	[EquipmentSlot.TORSO]: "Torso",
	[EquipmentSlot.LEGS]: "Legs",
	[EquipmentSlot.MAINHAND]: "Main Hand",
	[EquipmentSlot.OFFHAND]: "Off Hand",
	[EquipmentSlot.RING]: "Ring",
	[EquipmentSlot.NECKLACE]: "Necklace",
};
