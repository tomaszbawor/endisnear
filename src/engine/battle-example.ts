import { BattleEventType } from "./battle-events";
import { BattleSystem } from "./battle-system";
import { type CombatStats, Entity } from "./entity";
import { Monster } from "./monster";
import { getRandomMonster, MONSTER_TEMPLATES } from "./monster-database";
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

async function runBattleDemo() {
	console.log("=== Battle System Demo ===\n");

	const player = new DemoPlayer();
	const enemy = new Monster(MONSTER_TEMPLATES.GOBLIN);

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

	const battle = new BattleSystem(player, enemy);

	battle.subscribe((event) => {
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
	});

	const result = await battle.runAutoBattle();

	console.log(`\n${"=".repeat(50)}`);
	console.log("\n=== Battle Results ===");
	console.log(
		`Outcome: ${result.victory ? "VICTORY" : result.fled ? "FLED" : "DEFEAT"}`,
	);
	console.log(`Turns: ${result.turnCount}`);
	console.log(`EXP Gained: ${result.expGained}`);
	console.log(`Total Events: ${result.events.length}`);
}

async function runMultipleBattles() {
	console.log("\n\n=== Multiple Battles Demo ===\n");

	const player = new DemoPlayer();
	let totalExp = 0;
	let victories = 0;

	for (let i = 1; i <= 3; i++) {
		console.log(`\n--- Battle ${i} ---`);

		const monsterTemplate = getRandomMonster(i);
		const enemy = new Monster(monsterTemplate);

		console.log(`Encountered: ${enemy.name} (Level ${enemy.level})`);

		const battle = new BattleSystem(player, enemy);

		battle.subscribe((event) => {
			if (event.type === BattleEventType.LOG) {
				console.log(`  ${event.message}`);
			}
		});

		const result = await battle.runAutoBattle();

		if (result.victory) {
			victories++;
			totalExp += result.expGained;
		}

		if (!player.isAlive()) {
			console.log("\nPlayer defeated! Game Over.");
			break;
		}

		player.combatStats.health = player.combatStats.maxHealth;
	}

	console.log("\n=== Campaign Results ===");
	console.log(`Victories: ${victories}/3`);
	console.log(`Total EXP: ${totalExp}`);
}

async function streamingBattleDemo() {
	console.log("\n\n=== Event Streaming Demo ===\n");

	const player = new DemoPlayer();
	const enemy = new Monster(MONSTER_TEMPLATES.ORC);

	const battle = new BattleSystem(player, enemy);
	const stream = battle.createEventStream();

	const reader = stream.getReader();

	const processStream = async () => {
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				if (value.type === BattleEventType.DAMAGE) {
					console.log(
						`[STREAM] Damage event: ${value.damage} to ${value.target}`,
					);
				}
			}
		} catch (_e) {
			console.log("[STREAM] Stream closed");
		}
	};

	const streamPromise = processStream();
	const result = await battle.runAutoBattle();

	await streamPromise;

	console.log(`\nStream processed ${result.events.length} events`);
}

if (import.meta.main) {
	await runBattleDemo();
	await runMultipleBattles();
	await streamingBattleDemo();
}
