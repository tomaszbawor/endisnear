import { Atom } from "@effect-atom/atom-react";
import { Schema } from "effect";
import { atomRuntime } from "./atomRuntime";

const GameSettingsSchema = Schema.Struct({
	volume: Schema.Number,
	isFullscreen: Schema.Boolean,
});

export const gameConfigAtom = Atom.kvs({
	runtime: atomRuntime,
	key: "ein-settings",
	schema: GameSettingsSchema,
	defaultValue: () => {
		return Schema.decodeSync(GameSettingsSchema)({
			volume: 50,
			isFullscreen: true,
		});
	},
});
