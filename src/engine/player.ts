import { Stats } from "./stats";

export class Player {
	name: string = "John";
	exp: number = 0;
	level: number = 1;
	baseStats: Stats = new Stats();
}
