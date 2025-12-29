import { describe, expect, test } from "bun:test";
import { BattleEventType } from "./battle-events";
import { BattleSystem } from "./battle-system";
import { type CombatStats, Entity } from "./entity";
import { Monster } from "./monster";
import { MONSTER_TEMPLATES } from "./monster-database";
import type { Stats } from "./stats";

class TestPlayer extends Entity {
	name = "Test Hero";
	stats: Stats = {
		strength: 5,
		dexterity: 5,
		intelligence: 5,
		willpower: 5,
		luck: 5,
	};
	combatStats: CombatStats = {
		health: 100,
		maxHealth: 100,
		attack: 10,
		defense: 5,
		speed: 8,
	};
}

describe("Battle System", () => {
	test("should initialize battle correctly", () => {
		const player = new TestPlayer();
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);
		const battle = new BattleSystem(player, slime);

		battle.start();

		const events = battle.getEvents();
		expect(events.length).toBeGreaterThan(0);
		expect(events[0].type).toBe(BattleEventType.BATTLE_START);
	});

	test("should emit events during battle", () => {
		const player = new TestPlayer();
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);
		const battle = new BattleSystem(player, slime);

		const events: string[] = [];
		battle.subscribe((event) => {
			events.push(event.type);
		});

		battle.start();
		battle.tick();

		expect(events).toContain(BattleEventType.BATTLE_START);
		expect(events).toContain(BattleEventType.STATE_CHANGE);
	});

	test("should complete a full auto battle", async () => {
		const player = new TestPlayer();
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);
		const battle = new BattleSystem(player, slime);

		const result = await battle.runAutoBattle();

		expect(result).toBeDefined();
		expect(result.victory || result.fled).toBe(true);
		expect(result.turnCount).toBeGreaterThan(0);
	});

	test("should stream events", async () => {
		const player = new TestPlayer();
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);
		const battle = new BattleSystem(player, slime);

		const stream = battle.createEventStream();
		const events: BattleEventType[] = [];

		const reader = stream.getReader();
		const readEvents = async () => {
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					events.push(value.type);
				}
			} catch (_e) {
				// Stream closed
			}
		};

		const readPromise = readEvents();
		await battle.runAutoBattle();

		await readPromise;

		expect(events).toContain(BattleEventType.BATTLE_START);
		expect(events).toContain(BattleEventType.ATTACK);
		expect(events).toContain(BattleEventType.DAMAGE);
	});

	test("player should defeat weak monster", async () => {
		const player = new TestPlayer();
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);
		const battle = new BattleSystem(player, slime);

		const result = await battle.runAutoBattle();

		expect(result.victory).toBe(true);
		expect(result.fled).toBe(false);
		expect(result.expGained).toBe(MONSTER_TEMPLATES.SLIME.expReward);
	});

	test("should handle player actions", () => {
		const player = new TestPlayer();
		const goblin = new Monster(MONSTER_TEMPLATES.GOBLIN);
		const battle = new BattleSystem(player, goblin);

		battle.start();

		while (!battle.isWaitingForPlayerInput() && !battle.isFinished()) {
			battle.tick();
		}

		if (battle.isWaitingForPlayerInput()) {
			battle.playerAttack();
			expect(battle.isWaitingForPlayerInput()).toBe(false);
		}
	});

	test("different monsters have different stats", () => {
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);
		const dragon = new Monster(MONSTER_TEMPLATES.DRAGON);

		expect(dragon.combatStats.maxHealth).toBeGreaterThan(
			slime.combatStats.maxHealth,
		);
		expect(dragon.combatStats.attack).toBeGreaterThan(slime.combatStats.attack);
		expect(dragon.level).toBeGreaterThan(slime.level);
	});

	test("should log battle events", async () => {
		const player = new TestPlayer();
		const wolf = new Monster(MONSTER_TEMPLATES.WOLF);
		const battle = new BattleSystem(player, wolf);

		const logs: string[] = [];
		battle.subscribe((event) => {
			if (event.type === BattleEventType.LOG) {
				logs.push(event.message);
			}
		});

		await battle.runAutoBattle();

		expect(logs.length).toBeGreaterThan(0);
		expect(logs[0]).toContain("Battle started");
	});
});
