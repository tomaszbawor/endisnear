import { Effect, Stream } from "effect";
import { BattleEventType } from "./battle-events";
import { BattleSystem } from "./battle-system";
import { type CombatStats, Entity } from "./entity";
import { Monster } from "./monster";
import { getMonsterTemplate } from "./monster-helpers";
import type { Stats } from "./stats";

class DemoPlayer extends Entity {
	name = "Hero";
	stats: Stats = {
		strength: 8,
		dexterity: 6,
		intelligence: 4,
		willpower: 5,
		luck: 3,
	};
	combatStats: CombatStats = {
		health: 100,
		maxHealth: 100,
		attack: 12,
		defense: 8,
		speed: 10,
	};
}

const runBattleDemo = Effect.gen(function* () {
	console.log("=== Effect-Based Battle System Demo ===\n");

	const player = new DemoPlayer();
	const enemy = new Monster(getMonsterTemplate("GOBLIN"));

	console.log(
		`${player.name} (HP: ${player.combatStats.health}/${player.combatStats.maxHealth})`,
	);
	console.log(
		`  ATK: ${player.combatStats.attack} | DEF: ${player.combatStats.defense} | SPD: ${player.combatStats.speed}`,
	);
	console.log(`\nVS\n`);
	console.log(
		`${enemy.name} (HP: ${enemy.combatStats.health}/${enemy.combatStats.maxHealth})`,
	);
	console.log(
		`  ATK: ${enemy.combatStats.attack} | DEF: ${enemy.combatStats.defense} | SPD: ${enemy.combatStats.speed}`,
	);
	console.log(`\n${"=".repeat(50)}\n`);

	const battle = yield* BattleSystem.make(player, enemy);
	const eventStream = battle.getEventStream();

	const _eventFiber = yield* Effect.fork(
		Stream.runForEach(eventStream, (event) =>
			Effect.sync(() => {
				switch (event.type) {
					case BattleEventType.LOG:
						console.log(`📋 ${event.message}`);
						break;
					case BattleEventType.ATTACK:
						console.log(`⚔️  ${event.attacker} attacks ${event.target}!`);
						break;
					case BattleEventType.DAMAGE:
						console.log(
							`💥 ${event.target} takes ${event.damage} damage! (${event.remainingHealth} HP remaining)`,
						);
						break;
					case BattleEventType.CRITICAL:
						console.log(
							`🎯 CRITICAL HIT! ${event.attacker} deals ${event.damage} damage!`,
						);
						break;
					case BattleEventType.DEATH:
						console.log(`💀 ${event.entity} has fallen!`);
						break;
					case BattleEventType.VICTORY:
						console.log(`🎉 Victory! Gained ${event.expGained} EXP!`);
						break;
					case BattleEventType.DEFEAT:
						console.log(`😵 Defeat...`);
						break;
				}
			}),
		),
	);

	const result = yield* battle.runAutoBattle();

	console.log(`\n${"=".repeat(50)}`);
	console.log("\n=== Battle Results ===");
	console.log(
		`Outcome: ${result.victory ? "VICTORY" : result.fled ? "FLED" : "DEFEAT"}`,
	);
	console.log(`Turns: ${result.turnCount}`);
	console.log(`EXP Gained: ${result.expGained}`);
});

const runConcurrentBattles = Effect.gen(function* () {
	console.log("\n\n=== Concurrent Battles Demo (Effect) ===\n");

	const player1 = new DemoPlayer();
	const player2 = new DemoPlayer();
	const player3 = new DemoPlayer();

	const enemy1 = new Monster(getMonsterTemplate("SLIME"));
	const enemy2 = new Monster(getMonsterTemplate("GOBLIN"));
	const enemy3 = new Monster(getMonsterTemplate("WOLF"));

	console.log("Starting 3 battles concurrently...\n");

	const [result1, result2, result3] = yield* Effect.all(
		[
			BattleSystem.runBattle(player1, enemy1),
			BattleSystem.runBattle(player2, enemy2),
			BattleSystem.runBattle(player3, enemy3),
		],
		{ concurrency: "unbounded" },
	);

	console.log("=== Results ===");
	console.log(
		`Battle 1 (vs Slime): ${result1.victory ? "Victory" : "Defeat"} - ${result1.turnCount} turns`,
	);
	console.log(
		`Battle 2 (vs Goblin): ${result2.victory ? "Victory" : "Defeat"} - ${result2.turnCount} turns`,
	);
	console.log(
		`Battle 3 (vs Wolf): ${result3.victory ? "Victory" : "Defeat"} - ${result3.turnCount} turns`,
	);
});

const main = Effect.gen(function* () {
	yield* runBattleDemo;
	yield* runConcurrentBattles;
});

if (import.meta.main) {
	await Effect.runPromise(main);
}
