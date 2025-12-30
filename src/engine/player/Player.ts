import { Schema } from "effect";

export const PlayerDataSchema = Schema.Struct({
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

export type PlayerData = typeof PlayerDataSchema.Type;
