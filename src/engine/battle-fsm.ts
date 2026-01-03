import { Effect, Queue, Ref, Schema, Stream } from "effect";
import { InvalidActionError } from "./battle-errors";
import { type BattleEvent, BattleEventType } from "./battle-events";
import type { Entity } from "./entity";

export enum BattleState {
	INITIALIZING = "INITIALIZING",
	TURN_START = "TURN_START",
	PLAYER_TURN = "PLAYER_TURN",
	ENEMY_TURN = "ENEMY_TURN",
	PROCESSING_ACTION = "PROCESSING_ACTION",
	CHECKING_VICTORY = "CHECKING_VICTORY",
	VICTORY = "VICTORY",
	DEFEAT = "DEFEAT",
	FLED = "FLED",
}

export enum BattleAction {
	ATTACK = "ATTACK",
	DEFEND = "DEFEND",
	FLEE = "FLEE",
	ITEM = "ITEM",
}

export interface BattleContext {
	player: Entity;
	enemy: Entity;
	currentState: BattleState;
	turnNumber: number;
	playerAction?: BattleAction;
	isPlayerTurn: boolean;
	expReward: number;
}

const _BattleStateSchema = Schema.Literal(
	BattleState.TURN_START,
	BattleState.PLAYER_TURN,
	BattleState.ENEMY_TURN,
	BattleState.PROCESSING_ACTION,
	BattleState.CHECKING_VICTORY,
	BattleState.VICTORY,
	BattleState.DEFEAT,
	BattleState.FLED,
);

export class BattleFSM {
	private constructor(
		private readonly contextRef: Ref.Ref<BattleContext>,
		public readonly eventQueue: Queue.Queue<BattleEvent>,
	) {}

	static make(
		player: Entity,
		enemy: Entity,
		expReward: number,
	): Effect.Effect<BattleFSM> {
		return Effect.gen(function* () {
			const contextRef = yield* Ref.make<BattleContext>({
				player,
				enemy,
				currentState: BattleState.INITIALIZING,
				turnNumber: 0,
				isPlayerTurn: true,
				expReward,
			});

			const eventQueue = yield* Queue.unbounded<BattleEvent>();

			return new BattleFSM(contextRef, eventQueue);
		});
	}

	getState(): Effect.Effect<BattleState> {
		return Effect.gen(this, function* () {
			const context = yield* this.contextRef.get;
			return context.currentState;
		});
	}

	getContext(): Effect.Effect<Readonly<BattleContext>> {
		return this.contextRef.get;
	}

	getEventStream(): Stream.Stream<BattleEvent> {
		return Stream.fromQueue(this.eventQueue);
	}

	private emit(event: Omit<BattleEvent, "timestamp">): Effect.Effect<void> {
		return Effect.gen(this, function* () {
			const fullEvent = { ...event, timestamp: Date.now() } as BattleEvent;
			yield* Queue.offer(this.eventQueue, fullEvent);
		});
	}

	private transitionTo(newState: BattleState): Effect.Effect<void> {
		return Effect.gen(this, function* () {
			const context = yield* Ref.get(this.contextRef);
			const oldState = context.currentState;

			yield* Ref.set(this.contextRef, {
				...context,
				currentState: newState,
			});

			yield* this.emit({
				type: BattleEventType.STATE_CHANGE,
				from: oldState,
				to: newState,
			} as Omit<BattleEvent, "timestamp">);
		});
	}

	initialize(): Effect.Effect<void> {
		return Effect.gen(this, function* () {
			const context = yield* Ref.get(this.contextRef);

			yield* this.emit({
				type: BattleEventType.BATTLE_START,
				player: context.player.name,
				enemy: context.enemy.name,
			} as Omit<BattleEvent, "timestamp">);

			yield* this.emit({
				type: BattleEventType.LOG,
				message: `Battle started! ${context.player.name} vs ${context.enemy.name}`,
			} as Omit<BattleEvent, "timestamp">);

			const playerSpeed =
				context.player.combatStats.speed + context.player.stats.dexterity;
			const enemySpeed =
				context.enemy.combatStats.speed + context.enemy.stats.dexterity;

			const isPlayerFirst = playerSpeed >= enemySpeed;

			yield* Ref.set(this.contextRef, {
				...context,
				isPlayerTurn: isPlayerFirst,
			});

			yield* this.emit({
				type: BattleEventType.LOG,
				message: isPlayerFirst
					? `${context.player.name} moves first!`
					: `${context.enemy.name} moves first!`,
			} as Omit<BattleEvent, "timestamp">);

			yield* this.transitionTo(BattleState.TURN_START);
		});
	}

	startTurn(): Effect.Effect<void> {
		return Effect.gen(this, function* () {
			const context = yield* Ref.get(this.contextRef);

			yield* Ref.set(this.contextRef, {
				...context,
				turnNumber: context.turnNumber + 1,
			});

			const updatedContext = yield* Ref.get(this.contextRef);
			const actor = updatedContext.isPlayerTurn
				? updatedContext.player
				: updatedContext.enemy;

			yield* this.emit({
				type: BattleEventType.TURN_START,
				actor: actor.name,
				turnNumber: updatedContext.turnNumber,
			} as Omit<BattleEvent, "timestamp">);

			yield* this.transitionTo(
				updatedContext.isPlayerTurn
					? BattleState.PLAYER_TURN
					: BattleState.ENEMY_TURN,
			);
		});
	}

	executeAction(action: BattleAction): Effect.Effect<void, InvalidActionError> {
		return Effect.gen(this, function* () {
			const context = yield* Ref.get(this.contextRef);

			if (context.currentState !== BattleState.PLAYER_TURN) {
				return yield* Effect.fail(
					new InvalidActionError({
						action,
						currentState: context.currentState,
						message: `Cannot execute action ${action} in state ${context.currentState}`,
					}),
				);
			}

			yield* Ref.set(this.contextRef, {
				...context,
				playerAction: action,
			});

			yield* this.transitionTo(BattleState.PROCESSING_ACTION);

			const updatedContext = yield* Ref.get(this.contextRef);

			switch (action) {
				case BattleAction.ATTACK:
					yield* this.processAttack(
						updatedContext.player,
						updatedContext.enemy,
					);
					break;
				case BattleAction.FLEE:
					yield* this.processFlee();
					break;
				default:
					yield* this.emit({
						type: BattleEventType.LOG,
						message: `${action} not yet implemented`,
					} as Omit<BattleEvent, "timestamp">);
			}

			const currentContext = yield* Ref.get(this.contextRef);
			if (currentContext.currentState === BattleState.PROCESSING_ACTION) {
				yield* this.transitionTo(BattleState.CHECKING_VICTORY);
			}
		});
	}

	executeEnemyTurn(): Effect.Effect<void> {
		return Effect.gen(this, function* () {
			yield* this.transitionTo(BattleState.PROCESSING_ACTION);

			const context = yield* Ref.get(this.contextRef);
			yield* this.processAttack(context.enemy, context.player);

			const currentContext = yield* Ref.get(this.contextRef);
			if (currentContext.currentState === BattleState.PROCESSING_ACTION) {
				yield* this.transitionTo(BattleState.CHECKING_VICTORY);
			}
		});
	}

	private processAttack(attacker: Entity, target: Entity): Effect.Effect<void> {
		return Effect.gen(this, function* () {
			yield* this.emit({
				type: BattleEventType.ATTACK,
				attacker: attacker.name,
				target: target.name,
			} as Omit<BattleEvent, "timestamp">);

			const damage = attacker.calculateDamage(target);
			const isCritical = Math.random() < 0.1 + attacker.stats.luck * 0.02;

			if (isCritical) {
				const critDamage = Math.floor(damage * 1.5);
				yield* this.emit({
					type: BattleEventType.CRITICAL,
					attacker: attacker.name,
					damage: critDamage,
				} as Omit<BattleEvent, "timestamp">);

				target.takeDamage(critDamage);

				yield* this.emit({
					type: BattleEventType.DAMAGE,
					target: target.name,
					damage: critDamage,
					remainingHealth: target.combatStats.health,
				} as Omit<BattleEvent, "timestamp">);

				yield* this.emit({
					type: BattleEventType.LOG,
					message: `Critical hit! ${attacker.name} deals ${critDamage} damage to ${target.name}!`,
				} as Omit<BattleEvent, "timestamp">);
			} else {
				target.takeDamage(damage);

				yield* this.emit({
					type: BattleEventType.DAMAGE,
					target: target.name,
					damage,
					remainingHealth: target.combatStats.health,
				} as Omit<BattleEvent, "timestamp">);

				yield* this.emit({
					type: BattleEventType.LOG,
					message: `${attacker.name} deals ${damage} damage to ${target.name}!`,
				} as Omit<BattleEvent, "timestamp">);
			}

			if (!target.isAlive()) {
				yield* this.emit({
					type: BattleEventType.DEATH,
					entity: target.name,
				} as Omit<BattleEvent, "timestamp">);

				yield* this.emit({
					type: BattleEventType.LOG,
					message: `${target.name} has been defeated!`,
				} as Omit<BattleEvent, "timestamp">);
			}
		});
	}

	private processFlee(): Effect.Effect<void> {
		return Effect.gen(this, function* () {
			const context = yield* Ref.get(this.contextRef);

			const playerSpeed =
				context.player.combatStats.speed + context.player.stats.dexterity;
			const enemySpeed =
				context.enemy.combatStats.speed + context.enemy.stats.dexterity;

			const fleeChance = 0.5 + (playerSpeed - enemySpeed) * 0.05;
			const success = Math.random() < Math.max(0.2, Math.min(0.9, fleeChance));

			yield* this.emit({
				type: BattleEventType.FLEE,
				success,
			} as Omit<BattleEvent, "timestamp">);

			if (success) {
				yield* this.emit({
					type: BattleEventType.LOG,
					message: `${context.player.name} successfully fled from battle!`,
				} as Omit<BattleEvent, "timestamp">);
				yield* this.transitionTo(BattleState.FLED);
			} else {
				yield* this.emit({
					type: BattleEventType.LOG,
					message: `${context.player.name} failed to flee!`,
				} as Omit<BattleEvent, "timestamp">);
			}
		});
	}

	checkVictoryConditions(): Effect.Effect<void> {
		return Effect.gen(this, function* () {
			const context = yield* Ref.get(this.contextRef);

			if (!context.enemy.isAlive()) {
				yield* this.emit({
					type: BattleEventType.VICTORY,
					expGained: context.expReward,
				} as Omit<BattleEvent, "timestamp">);

				yield* this.emit({
					type: BattleEventType.LOG,
					message: `Victory! Gained ${context.expReward} experience!`,
				} as Omit<BattleEvent, "timestamp">);

				yield* this.transitionTo(BattleState.VICTORY);
				return;
			}

			if (!context.player.isAlive()) {
				yield* this.emit({
					type: BattleEventType.DEFEAT,
				} as Omit<BattleEvent, "timestamp">);

				yield* this.emit({
					type: BattleEventType.LOG,
					message: `${context.player.name} has been defeated...`,
				} as Omit<BattleEvent, "timestamp">);

				yield* this.transitionTo(BattleState.DEFEAT);
				return;
			}

			yield* Ref.set(this.contextRef, {
				...context,
				isPlayerTurn: !context.isPlayerTurn,
			});

			yield* this.transitionTo(BattleState.TURN_START);
		});
	}

	isFinished(): Effect.Effect<boolean> {
		return Effect.gen(this, function* () {
			const state = yield* this.getState();
			return (
				state === BattleState.VICTORY ||
				state === BattleState.DEFEAT ||
				state === BattleState.FLED
			);
		});
	}

	closeEventQueue(): Effect.Effect<void> {
		return Queue.shutdown(this.eventQueue);
	}
}
