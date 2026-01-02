/**
 * Equipment System Type Definitions
 */

import { Schema } from "effect";
import { StatsSchema } from "../stats";

const ItemStatsSchema = Schema.extend(
	StatsSchema,
	Schema.Struct({
		attack: Schema.optional(Schema.Number),
		defence: Schema.optional(Schema.Number),
		health: Schema.optional(Schema.Number),
	}),
).pipe(Schema.partial);

export type ItemStats = typeof ItemStatsSchema.Type;

const EquipmentSlotSchema = Schema.Literal(
	"HEAD",
	"TORSO",
	"LEGS",
	"MAINHAND",
	"OFFHAND",
	"RING",
	"NECKLACE",
);

export type EquipmentSlot = typeof EquipmentSlotSchema.Type;

const ItemRaritySchema = Schema.Literal(
	"COMMON",
	"UNCOMMON",
	"RARE",
	"EPIC",
	"LEGENDARY",
);

type ItemRarity = typeof ItemRaritySchema.Type;

const ItemTypeSchema = Schema.Literal(
	"WEAPON",
	"ARMOR",
	"ACCESSORY",
	"CONSUMABLE",
);

const ItemSchema = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	description: Schema.String,
	type: ItemTypeSchema,
	rarity: ItemRaritySchema,
	slot: Schema.optional(EquipmentSlotSchema),
	stats: ItemStatsSchema,
	price: Schema.Number,
	iconUrl: Schema.optional(Schema.String),
});

export type Item = typeof ItemSchema.Type;

export const EquippedItemsSchema = Schema.Record({
	key: EquipmentSlotSchema,
	value: ItemSchema,
}).pipe(Schema.partial);

export type EquippedItems = typeof EquippedItemsSchema.Type;

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

//TODO: Remove it to some ui related logic
/**
 * Rarity colors for UI
 */
export const RARITY_COLORS: Record<ItemRarity, string> = {
	COMMON: "text-gray-400",
	UNCOMMON: "text-green-400",
	RARE: "text-blue-400",
	EPIC: "text-purple-400",
	LEGENDARY: "text-orange-400",
};

/**
 * Rarity border colors for UI
 */
export const RARITY_BORDER_COLORS: Record<ItemRarity, string> = {
	COMMON: "border-gray-400",
	UNCOMMON: "border-green-400",
	RARE: "border-blue-400",
	EPIC: "border-purple-400",
	LEGENDARY: "border-orange-400",
};

/**
 * Equipment slot display names
 */
export const SLOT_NAMES: Record<EquipmentSlot, string> = {
	HEAD: "Head",
	TORSO: "Torso",
	LEGS: "Legs",
	MAINHAND: "Main Hand",
	OFFHAND: "Off Hand",
	RING: "Ring",
	NECKLACE: "Necklace",
};
