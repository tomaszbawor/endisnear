import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Schema } from "effect";
import { type PlayerData, PlayerDataSchema } from "@/engine/player/Player";
import { atomRuntime } from "./atomRuntime";

const GameSaveSchema = Schema.Struct({
	playerName: Schema.String,
	playerClass: Schema.Literal("warrior", "mage", "rogue"),
	level: Schema.Number,
	location: Schema.String,
	timePlayed: Schema.Number,
	lastPlayed: Schema.Number,
	// Full player data for continuing the game
	// TODO: Replace with player Schema
	playerData: PlayerDataSchema,
});

export interface GameSave {
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
