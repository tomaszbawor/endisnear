import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Schema } from "effect";
import { atomRuntime } from "./atomRuntime";
import type { PlayerData } from "./playerState";

const GameSaveSchema = Schema.Struct({
	playerName: Schema.String,
	playerClass: Schema.Literal("warrior", "mage", "rogue"),
	level: Schema.Number,
	location: Schema.String,
	timePlayed: Schema.Number,
	lastPlayed: Schema.Number,
	// Full player data for continuing the game
	playerData: Schema.Struct({
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
	}),
});

export interface GameSave {
	playerName: string;
	playerClass: "warrior" | "mage" | "rogue";
	level: number;
	location: string;
	timePlayed: number;
	lastPlayed: number;
	playerData: PlayerData;
}

const MaybeGameSaveSchema = Schema.Union(GameSaveSchema, Schema.Null);

const SavesSchema = Schema.Tuple(
	MaybeGameSaveSchema,
	MaybeGameSaveSchema,
	MaybeGameSaveSchema,
	MaybeGameSaveSchema,
);

const gameSavesAtom = Atom.kvs({
	runtime: atomRuntime,
	key: "ein-saves",
	schema: SavesSchema,
	defaultValue: () => {
		return Schema.decodeSync(SavesSchema)([null, null, null, null]);
	},
});

/**
 * Computed atom that checks if any save slot has a saved game
 */
export const hasSaveAtom = Atom.readable((get) => {
	const saves = get(gameSavesAtom);
	return saves.some((save) => save !== null);
});

export const useSavesValues = () => {
	return useAtomValue(gameSavesAtom);
};

export const useSavesSet = () => {
	return useAtomSet(gameSavesAtom);
};

/**
 * Get the gameSaves atom for direct access
 */
export function getGameSavesAtom() {
	return gameSavesAtom;
}
