import { Effect } from "effect";
import { BattleSystem } from "./battle-system";
import { type CombatStats, Entity } from "./entity";
import { Monster } from "./monster";
import { MONSTER_TEMPLATES } from "./monster-database";
import type { Stats } from "./stats";

class Hero extends Entity {
	name = "Hero";
	stats: Stats = {
		strength: 10,
		dexterity: 8,
		intelligence: 5,
		willpower: 6,
		luck: 4,
	};
	combatStats: CombatStats = {
		health: 120,
		maxHealth: 120,
		attack: 15,
		defense: 10,
		speed: 12,
	};
}

// Simple one-on-one battle
const simpleBattle = Effect.gen(function* () {
	console.log("=== Simple Battle Demo ===\n");

	const player = new Hero();
	const goblin = new Monster(MONSTER_TEMPLATES.GOBLIN);

	console.log(`${player.name} vs ${goblin.name}`);
	console.log(`Player HP: ${player.combatStats.health}`);
	console.log(`Enemy HP: ${goblin.combatStats.health}\n`);

	const result = yield* BattleSystem.runBattle(player, goblin);

	console.log(`\nBattle ${result.victory ? "Won" : "Lost"}!`);
	console.log(`Turns: ${result.turnCount}`);
	console.log(`EXP Gained: ${result.expGained}`);
	console.log(`Player HP Remaining: ${player.combatStats.health}`);

	return result;
});

if (import.meta.main) {
	await Effect.runPromise(simpleBattle);
}
