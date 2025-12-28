import { Atom } from "@effect-atom/atom-react";
import { Schema } from "effect";
import { atomRuntime } from "./atomRuntime";

export const gameConfigAtom = Atom.kvs({
	runtime: atomRuntime,
	key: "ein-settings",
	schema: Schema.Any,
	defaultValue: () => {
		return {
			volume: 50,
			fullScreen: true,
		};
	},
});
