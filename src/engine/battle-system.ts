import { Effect, Ref, Stream } from "effect";
import { BattleAlreadyFinishedError } from "./battle-errors";
import type { BattleEvent } from "./battle-events";
import { BattleAction, BattleFSM, BattleState } from "./battle-fsm";
import type { Entity } from "./entity";
import type { Monster } from "./monster";

export interface BattleResult {
	victory: boolean;
	fled: boolean;
	expGained: number;
	turnCount: number;
	events: BattleEvent[];
}

export class BattleSystem {
	private constructor(
		private readonly fsm: BattleFSM,
		private readonly eventsRef: Ref.Ref<BattleEvent[]>,
	) {}

	static make(player: Entity, enemy: Monster): Effect.Effect<BattleSystem> {
		return Effect.gen(function* () {
			const fsm = yield* BattleFSM.make(player, enemy, enemy.expReward);
			const eventsRef = yield* Ref.make<BattleEvent[]>([]);

			const eventStream = Stream.fromQueue(fsm.eventQueue);
			yield* Effect.fork(
				Stream.runForEach(eventStream, (event) =>
					Ref.update(eventsRef, (events) => [...events, event]),
				),
			);

			return new BattleSystem(fsm, eventsRef);
		});
	}

	getEventStream(): Stream.Stream<BattleEvent> {
		return this.fsm.getEventStream();
	}

	start(): Effect.Effect<void> {
		return Effect.gen(this, function* () {
			const state = yield* this.fsm.getState();
			if (state === BattleState.INITIALIZING) {
				yield* this.fsm.initialize();
			}
		});
	}

	tick(): Effect.Effect<void> {
		return Effect.gen(this, function* () {
			const state = yield* this.fsm.getState();

			switch (state) {
				case BattleState.TURN_START:
					yield* this.fsm.startTurn();
					break;

				case BattleState.ENEMY_TURN:
					yield* this.fsm.executeEnemyTurn();
					break;

				case BattleState.CHECKING_VICTORY:
					yield* this.fsm.checkVictoryConditions();
					break;

				default:
					break;
			}
		});
	}

	playerAttack(): Effect.Effect<void, never> {
		return Effect.gen(this, function* () {
			const state = yield* this.fsm.getState();
			if (state === BattleState.PLAYER_TURN) {
				yield* Effect.catchAll(
					this.fsm.executeAction(BattleAction.ATTACK),
					() => Effect.void,
				);
			}
		});
	}

	playerFlee(): Effect.Effect<void, never> {
		return Effect.gen(this, function* () {
			const state = yield* this.fsm.getState();
			if (state === BattleState.PLAYER_TURN) {
				yield* Effect.catchAll(
					this.fsm.executeAction(BattleAction.FLEE),
					() => Effect.void,
				);
			}
		});
	}

	isWaitingForPlayerInput(): Effect.Effect<boolean> {
		return Effect.gen(this, function* () {
			const state = yield* this.fsm.getState();
			return state === BattleState.PLAYER_TURN;
		});
	}

	isFinished(): Effect.Effect<boolean> {
		return this.fsm.isFinished();
	}

	getEvents(): Effect.Effect<BattleEvent[]> {
		return Ref.get(this.eventsRef);
	}

	getResult(): Effect.Effect<BattleResult, BattleAlreadyFinishedError> {
		return Effect.gen(this, function* () {
			const isFinished = yield* this.fsm.isFinished();

			if (!isFinished) {
				return yield* Effect.fail(
					new BattleAlreadyFinishedError({
						message: "Battle is not finished yet",
					}),
				);
			}

			const state = yield* this.fsm.getState();
			const context = yield* this.fsm.getContext();
			const events = yield* Ref.get(this.eventsRef);

			return {
				victory: state === BattleState.VICTORY,
				fled: state === BattleState.FLED,
				expGained: state === BattleState.VICTORY ? context.expReward : 0,
				turnCount: context.turnNumber,
				events,
			};
		});
	}

	getCurrentState(): Effect.Effect<BattleState> {
		return this.fsm.getState();
	}

	runAutoBattle(): Effect.Effect<BattleResult> {
		return Effect.gen(this, function* () {
			yield* this.start();

			while (true) {
				const finished = yield* this.isFinished();
				if (finished) break;

				const waitingForInput = yield* this.isWaitingForPlayerInput();
				if (waitingForInput) {
					yield* this.playerAttack();
				}

				yield* this.tick();
			}

			yield* this.fsm.closeEventQueue();

			yield* Effect.sleep("100 millis");

			const state = yield* this.fsm.getState();
			const context = yield* this.fsm.getContext();
			const events = yield* Ref.get(this.eventsRef);

			return {
				victory: state === BattleState.VICTORY,
				fled: state === BattleState.FLED,
				expGained: state === BattleState.VICTORY ? context.expReward : 0,
				turnCount: context.turnNumber,
				events,
			};
		});
	}

	static runBattle(
		player: Entity,
		enemy: Monster,
	): Effect.Effect<BattleResult> {
		return Effect.gen(function* () {
			const battle = yield* BattleSystem.make(player, enemy);
			return yield* battle.runAutoBattle();
		});
	}
}
