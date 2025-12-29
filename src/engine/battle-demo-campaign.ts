import { Effect } from "effect";
import { BattleSystem } from "./battle-system";
import { type CombatStats, Entity } from "./entity";
import { Monster } from "./monster";
import { getRandomMonster } from "./monster-database";
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

// Campaign - sequential battles
const campaign = Effect.gen(function* () {
	console.log("=== Campaign Demo ===\n");

	const player = new Hero();
	let victories = 0;
	let totalExp = 0;
	const maxBattles = 5;

	for (let battleNum = 1; battleNum <= maxBattles; battleNum++) {
		const enemyTemplate = getRandomMonster(battleNum);
		const enemy = new Monster(enemyTemplate);

		console.log(`\n--- Battle ${battleNum}/${maxBattles} ---`);
		console.log(`Opponent: ${enemy.name} (Level ${enemy.level})`);
		console.log(
			`Player HP: ${player.combatStats.health}/${player.combatStats.maxHealth}`,
		);

		const result = yield* BattleSystem.runBattle(player, enemy);

		if (result.victory) {
			victories++;
			totalExp += result.expGained;
			console.log(
				`✓ Victory! +${result.expGained} EXP (${result.turnCount} turns)`,
			);

			// Heal some HP between battles
			const healing = Math.floor(player.combatStats.maxHealth * 0.3);
			const actualHealing = player.heal(healing);
			if (actualHealing > 0) {
				console.log(`Restored ${actualHealing} HP`);
			}
		} else {
			console.log(`✗ Defeated!`);
			break;
		}

		if (!player.isAlive()) {
			console.log("\nPlayer has fallen. Campaign over.");
			break;
		}
	}

	console.log("\n=== Campaign Results ===");
	console.log(`Victories: ${victories}/${maxBattles}`);
	console.log(`Total EXP: ${totalExp}`);
	console.log(
		`Final HP: ${player.combatStats.health}/${player.combatStats.maxHealth}`,
	);

	return { victories, totalExp };
});

if (import.meta.main) {
	await Effect.runPromise(campaign);
}
