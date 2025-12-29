import { describe, expect, test } from "bun:test";
import { Effect, Stream } from "effect";
import { BattleEventType } from "./battle-events";
import { BattleState } from "./battle-fsm";
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
	test("should create battle system", async () => {
		const player = new TestPlayer();
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);

		const program = Effect.gen(function* () {
			const battle = yield* BattleSystem.make(player, slime);
			return battle;
		});

		const battle = await Effect.runPromise(program);
		expect(battle).toBeDefined();
	});

	test("should initialize battle correctly", async () => {
		const player = new TestPlayer();
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);

		const program = Effect.gen(function* () {
			const battle = yield* BattleSystem.make(player, slime);
			yield* battle.start();
			const state = yield* battle.getCurrentState();
			return state;
		});

		const state = await Effect.runPromise(program);
		expect(state).toBe(BattleState.TURN_START);
	});

	test.skip("should stream events during battle", async () => {
		const player = new TestPlayer();
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);

		const program = Effect.gen(function* () {
			const battle = yield* BattleSystem.make(player, slime);
			const eventStream = battle.getEventStream();

			const events: BattleEventType[] = [];

			const _eventFiber = yield* Effect.fork(
				Stream.runForEach(eventStream, (event) =>
					Effect.sync(() => {
						events.push(event.type);
					}),
				),
			);

			const result = yield* battle.runAutoBattle();

			yield* Effect.sleep("50 millis");

			return { events, result };
		});

		const { events, result } = await Effect.runPromise(program);

		expect(events).toContain(BattleEventType.BATTLE_START);
		expect(events).toContain(BattleEventType.ATTACK);
		expect(events).toContain(BattleEventType.DAMAGE);
		expect(result.victory || result.fled).toBe(true);
	});

	test.skip("should complete a full auto battle", async () => {
		const player = new TestPlayer();
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);

		const program = BattleSystem.runBattle(player, slime);

		const result = await Effect.runPromise(program);

		expect(result).toBeDefined();
		expect(result.victory || result.fled).toBe(true);
		expect(result.turnCount).toBeGreaterThan(0);
		expect(result.events.length).toBeGreaterThan(0);
	});

	test("player should defeat weak monster", async () => {
		const player = new TestPlayer();
		const slime = new Monster(MONSTER_TEMPLATES.SLIME);

		const program = BattleSystem.runBattle(player, slime);

		const result = await Effect.runPromise(program);

		expect(result.victory).toBe(true);
		expect(result.fled).toBe(false);
		expect(result.expGained).toBe(MONSTER_TEMPLATES.SLIME.expReward);
	});

	test("should handle player actions with Effect", async () => {
		const player = new TestPlayer();
		const goblin = new Monster(MONSTER_TEMPLATES.GOBLIN);

		const program = Effect.gen(function* () {
			const battle = yield* BattleSystem.make(player, goblin);
			yield* battle.start();

			while (true) {
				const waitingForInput = yield* battle.isWaitingForPlayerInput();
				const finished = yield* battle.isFinished();

				if (finished) break;

				if (!waitingForInput && !finished) {
					yield* battle.tick();
				}

				if (waitingForInput) {
					yield* battle.playerAttack();
					break;
				}
			}

			const waitingAfterAttack = yield* battle.isWaitingForPlayerInput();
			return waitingAfterAttack;
		});

		const waitingAfterAttack = await Effect.runPromise(program);
		expect(waitingAfterAttack).toBe(false);
	});

	test.skip("should collect all battle events", async () => {
		const player = new TestPlayer();
		const wolf = new Monster(MONSTER_TEMPLATES.WOLF);

		const program = BattleSystem.runBattle(player, wolf);

		const result = await Effect.runPromise(program);

		const logEvents = result.events.filter(
			(e) => e.type === BattleEventType.LOG,
		);
		expect(logEvents.length).toBeGreaterThan(0);

		const attackEvents = result.events.filter(
			(e) => e.type === BattleEventType.ATTACK,
		);
		expect(attackEvents.length).toBeGreaterThan(0);
	});

	test("should handle multiple battles in sequence", async () => {
		const player = new TestPlayer();

		const program = Effect.gen(function* () {
			const results = [];

			for (let i = 0; i < 3; i++) {
				const enemy = new Monster(MONSTER_TEMPLATES.SLIME);
				const result = yield* BattleSystem.runBattle(player, enemy);
				results.push(result);

				if (!player.isAlive()) break;

				player.combatStats.health = player.combatStats.maxHealth;
			}

			return results;
		});

		const results = await Effect.runPromise(program);

		expect(results.length).toBeGreaterThan(0);
		results.forEach((result) => {
			expect(result.victory || result.fled).toBe(true);
		});
	});

	test("should handle concurrent battles with Effect", async () => {
		const program = Effect.gen(function* () {
			const player1 = new TestPlayer();
			const player2 = new TestPlayer();
			const player3 = new TestPlayer();

			const slime1 = new Monster(MONSTER_TEMPLATES.SLIME);
			const slime2 = new Monster(MONSTER_TEMPLATES.SLIME);
			const slime3 = new Monster(MONSTER_TEMPLATES.SLIME);

			const [result1, result2, result3] = yield* Effect.all(
				[
					BattleSystem.runBattle(player1, slime1),
					BattleSystem.runBattle(player2, slime2),
					BattleSystem.runBattle(player3, slime3),
				],
				{ concurrency: "unbounded" },
			);

			return [result1, result2, result3];
		});

		const results = await Effect.runPromise(program);

		expect(results).toHaveLength(3);
		results.forEach((result) => {
			expect(result.victory).toBe(true);
		});
	});
});
