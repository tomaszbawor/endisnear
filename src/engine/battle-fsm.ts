import {
	type BattleEvent,
	type BattleEventListener,
	BattleEventType,
} from "./battle-events";
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

export class BattleFSM {
	private context: BattleContext;
	private listeners: BattleEventListener[] = [];

	constructor(player: Entity, enemy: Entity, expReward: number) {
		this.context = {
			player,
			enemy,
			currentState: BattleState.INITIALIZING,
			turnNumber: 0,
			isPlayerTurn: true,
			expReward,
		};
	}

	getState(): BattleState {
		return this.context.currentState;
	}

	getContext(): Readonly<BattleContext> {
		return this.context;
	}

	subscribe(listener: BattleEventListener): () => void {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}

	private emit(event: Omit<BattleEvent, "timestamp">): void {
		const fullEvent = { ...event, timestamp: Date.now() } as BattleEvent;
		this.listeners.forEach((listener) => {
			listener(fullEvent);
		});
	}

	private transitionTo(newState: BattleState): void {
		const oldState = this.context.currentState;
		this.context.currentState = newState;
		this.emit({
			type: BattleEventType.STATE_CHANGE,
			from: oldState,
			to: newState,
		});
	}

	initialize(): void {
		this.emit({
			type: BattleEventType.BATTLE_START,
			player: this.context.player.name,
			enemy: this.context.enemy.name,
		});

		this.emit({
			type: BattleEventType.LOG,
			message: `Battle started! ${this.context.player.name} vs ${this.context.enemy.name}`,
		});

		const playerSpeed =
			this.context.player.combatStats.speed +
			this.context.player.stats.dexterity;
		const enemySpeed =
			this.context.enemy.combatStats.speed + this.context.enemy.stats.dexterity;

		this.context.isPlayerTurn = playerSpeed >= enemySpeed;

		this.emit({
			type: BattleEventType.LOG,
			message: this.context.isPlayerTurn
				? `${this.context.player.name} moves first!`
				: `${this.context.enemy.name} moves first!`,
		});

		this.transitionTo(BattleState.TURN_START);
	}

	startTurn(): void {
		this.context.turnNumber++;
		const actor = this.context.isPlayerTurn
			? this.context.player
			: this.context.enemy;

		this.emit({
			type: BattleEventType.TURN_START,
			actor: actor.name,
			turnNumber: this.context.turnNumber,
		});

		this.transitionTo(
			this.context.isPlayerTurn
				? BattleState.PLAYER_TURN
				: BattleState.ENEMY_TURN,
		);
	}

	executeAction(action: BattleAction): void {
		this.context.playerAction = action;
		this.transitionTo(BattleState.PROCESSING_ACTION);

		switch (action) {
			case BattleAction.ATTACK:
				this.processAttack(this.context.player, this.context.enemy);
				break;
			case BattleAction.FLEE:
				this.processFlee();
				break;
			default:
				this.emit({
					type: BattleEventType.LOG,
					message: `${action} not yet implemented`,
				});
		}

		if (this.context.currentState === BattleState.PROCESSING_ACTION) {
			this.transitionTo(BattleState.CHECKING_VICTORY);
		}
	}

	executeEnemyTurn(): void {
		this.transitionTo(BattleState.PROCESSING_ACTION);
		this.processAttack(this.context.enemy, this.context.player);
		if (this.context.currentState === BattleState.PROCESSING_ACTION) {
			this.transitionTo(BattleState.CHECKING_VICTORY);
		}
	}

	private processAttack(attacker: Entity, target: Entity): void {
		this.emit({
			type: BattleEventType.ATTACK,
			attacker: attacker.name,
			target: target.name,
		});

		const damage = attacker.calculateDamage(target);
		const isCritical = Math.random() < 0.1 + attacker.stats.luck * 0.02;

		if (isCritical) {
			const critDamage = Math.floor(damage * 1.5);
			this.emit({
				type: BattleEventType.CRITICAL,
				attacker: attacker.name,
				damage: critDamage,
			});
			target.takeDamage(critDamage);
			this.emit({
				type: BattleEventType.DAMAGE,
				target: target.name,
				damage: critDamage,
				remainingHealth: target.combatStats.health,
			});
			this.emit({
				type: BattleEventType.LOG,
				message: `Critical hit! ${attacker.name} deals ${critDamage} damage to ${target.name}!`,
			});
		} else {
			target.takeDamage(damage);
			this.emit({
				type: BattleEventType.DAMAGE,
				target: target.name,
				damage,
				remainingHealth: target.combatStats.health,
			});
			this.emit({
				type: BattleEventType.LOG,
				message: `${attacker.name} deals ${damage} damage to ${target.name}!`,
			});
		}

		if (!target.isAlive()) {
			this.emit({
				type: BattleEventType.DEATH,
				entity: target.name,
			});
			this.emit({
				type: BattleEventType.LOG,
				message: `${target.name} has been defeated!`,
			});
		}
	}

	private processFlee(): void {
		const playerSpeed =
			this.context.player.combatStats.speed +
			this.context.player.stats.dexterity;
		const enemySpeed =
			this.context.enemy.combatStats.speed + this.context.enemy.stats.dexterity;
		const fleeChance = 0.5 + (playerSpeed - enemySpeed) * 0.05;
		const success = Math.random() < Math.max(0.2, Math.min(0.9, fleeChance));

		this.emit({
			type: BattleEventType.FLEE,
			success,
		});

		if (success) {
			this.emit({
				type: BattleEventType.LOG,
				message: `${this.context.player.name} successfully fled from battle!`,
			});
			this.transitionTo(BattleState.FLED);
		} else {
			this.emit({
				type: BattleEventType.LOG,
				message: `${this.context.player.name} failed to flee!`,
			});
		}
	}

	checkVictoryConditions(): void {
		if (!this.context.enemy.isAlive()) {
			this.emit({
				type: BattleEventType.VICTORY,
				expGained: this.context.expReward,
			});
			this.emit({
				type: BattleEventType.LOG,
				message: `Victory! Gained ${this.context.expReward} experience!`,
			});
			this.transitionTo(BattleState.VICTORY);
			return;
		}

		if (!this.context.player.isAlive()) {
			this.emit({
				type: BattleEventType.DEFEAT,
			});
			this.emit({
				type: BattleEventType.LOG,
				message: `${this.context.player.name} has been defeated...`,
			});
			this.transitionTo(BattleState.DEFEAT);
			return;
		}

		this.context.isPlayerTurn = !this.context.isPlayerTurn;
		this.transitionTo(BattleState.TURN_START);
	}

	isFinished(): boolean {
		return (
			this.context.currentState === BattleState.VICTORY ||
			this.context.currentState === BattleState.DEFEAT ||
			this.context.currentState === BattleState.FLED
		);
	}
}
