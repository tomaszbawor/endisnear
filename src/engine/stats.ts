import { Schema } from "effect";

export const StatsSchema = Schema.Struct({
	strength: Schema.Number,
	dexterity: Schema.Number,
	intelligence: Schema.Number,
	willpower: Schema.Number,
	speed: Schema.Number,
	luck: Schema.Number,
});

type _Stats = typeof StatsSchema.Type;

export class Stats implements _Stats {
	strength: number;
	dexterity: number;
	intelligence: number;
	willpower: number;
	speed: number;
	luck: number;

	constructor() {
		this.strength = 1;
		this.dexterity = 1;
		this.intelligence = 1;
		this.willpower = 1;
		this.luck = 1;
		this.speed = 1;
	}
}
