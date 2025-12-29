import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Schema } from "effect";
import { atomRuntime } from "./atomRuntime";

const GameSaveSchema = Schema.Struct({
	playerName: Schema.String,
	location: Schema.String,
	timePlayed: Schema.String,
});

const MaybeGameSaveSchema = Schema.Union(GameSaveSchema, Schema.Null);

const SavesSchema = Schema.Tuple(MaybeGameSaveSchema, MaybeGameSaveSchema);

const gameSavesAtom = Atom.kvs({
	runtime: atomRuntime,
	key: "ein-saves",
	schema: SavesSchema,
	defaultValue: () => {
		return Schema.decodeSync(SavesSchema)([null, null]);
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
