import { Schema } from "effect";
import { StatsSchema } from "../stats";
import { EquippedItemsSchema } from "./Equipment";

export const PlayerClassSchema = Schema.Literal("warrior", "mage", "rogue");

export const PlayerDataSchema = Schema.Struct({
	name: Schema.String,
	class: PlayerClassSchema,
	level: Schema.Number,
	currentExp: Schema.Number,
	expToNextLevel: Schema.Number,
	health: Schema.Number,
	currentHealth: Schema.Number,
	items: EquippedItemsSchema,
	stats: StatsSchema,
	gold: Schema.Number,
	location: Schema.String,
	timePlayed: Schema.Number,
	lastPlayed: Schema.Number,
});

export type PlayerData = typeof PlayerDataSchema.Type;
