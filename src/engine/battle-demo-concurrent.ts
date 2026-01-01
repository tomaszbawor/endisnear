import { Effect } from "effect";
import { BattleSystem } from "./battle-system";
import { type CombatStats, Entity } from "./entity";
import { Monster } from "./monster";
import { getMonsterTemplate } from "./monster-helpers";
import type { Stats } from "./stats";

class Hero extends Entity {
	name: string;
	stats: Stats = {
		strength: 10,
		dexterity: 8,
		intelligence: 5,
		willpower: 6,
		speed: 1,
		luck: 4,
	};
	combatStats: CombatStats = {
		health: 120,
		maxHealth: 120,
		attack: 15,
		defense: 10,
		speed: 12,
	};

	constructor(name: string) {
		super();
		this.name = name;
	}
}

// Concurrent battles - multiple heroes fight simultaneously
const concurrentBattles = Effect.gen(function* () {
	console.log("=== Concurrent Battles Demo ===\n");
	console.log("Three heroes fight different monsters simultaneously...\n");

	const hero1 = new Hero("Alice");
	const hero2 = new Hero("Bob");
	const hero3 = new Hero("Charlie");

	const slime = new Monster(getMonsterTemplate("SLIME"));
	const goblin = new Monster(getMonsterTemplate("GOBLIN"));
	const wolf = new Monster(getMonsterTemplate("WOLF"));

	console.log("Starting battles:");
	console.log(`- ${hero1.name} vs ${slime.name}`);
	console.log(`- ${hero2.name} vs ${goblin.name}`);
	console.log(`- ${hero3.name} vs ${wolf.name}`);
	console.log("\nBattling...\n");

	const startTime = Date.now();

	// Run all three battles concurrently
	const [result1, result2, result3] = yield* Effect.all(
		[
			BattleSystem.runBattle(hero1, slime),
			BattleSystem.runBattle(hero2, goblin),
			BattleSystem.runBattle(hero3, wolf),
		],
		{ concurrency: "unbounded" },
	);

	const endTime = Date.now();
	const duration = endTime - startTime;

	console.log("=== Results ===");
	console.log(
		`${hero1.name} vs ${slime.name}: ${result1.victory ? "Victory" : "Defeat"} (${result1.turnCount} turns, +${result1.expGained} EXP)`,
	);
	console.log(
		`${hero2.name} vs ${goblin.name}: ${result2.victory ? "Victory" : "Defeat"} (${result2.turnCount} turns, +${result2.expGained} EXP)`,
	);
	console.log(
		`${hero3.name} vs ${wolf.name}: ${result3.victory ? "Victory" : "Defeat"} (${result3.turnCount} turns, +${result3.expGained} EXP)`,
	);

	const victories = [result1, result2, result3].filter((r) => r.victory).length;
	const totalExp = result1.expGained + result2.expGained + result3.expGained;

	console.log(`\nTotal: ${victories}/3 victories`);
	console.log(`Combined EXP: ${totalExp}`);
	console.log(`Completed in: ${duration}ms`);

	return { victories, totalExp, duration };
});

if (import.meta.main) {
	await Effect.runPromise(concurrentBattles);
}
