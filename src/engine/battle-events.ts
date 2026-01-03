export enum BattleEventType {
	BATTLE_START = "BATTLE_START",
	TURN_START = "TURN_START",
	ATTACK = "ATTACK",
	DAMAGE = "DAMAGE",
	MISS = "MISS",
	CRITICAL = "CRITICAL",
	HEAL = "HEAL",
	DEATH = "DEATH",
	VICTORY = "VICTORY",
	DEFEAT = "DEFEAT",
	FLEE = "FLEE",
	STATE_CHANGE = "STATE_CHANGE",
	LOG = "LOG",
}

export interface BaseBattleEvent {
	type: BattleEventType;
	timestamp: number;
}

export interface BattleStartEvent extends BaseBattleEvent {
	type: BattleEventType.BATTLE_START;
	player: string;
	enemy: string;
}

export interface TurnStartEvent extends BaseBattleEvent {
	type: BattleEventType.TURN_START;
	actor: string;
	turnNumber: number;
}

export interface AttackEvent extends BaseBattleEvent {
	type: BattleEventType.ATTACK;
	attacker: string;
	target: string;
}

export interface DamageEvent extends BaseBattleEvent {
	type: BattleEventType.DAMAGE;
	target: string;
	damage: number;
	remainingHealth: number;
}

export interface MissEvent extends BaseBattleEvent {
	type: BattleEventType.MISS;
	attacker: string;
}

export interface CriticalEvent extends BaseBattleEvent {
	type: BattleEventType.CRITICAL;
	attacker: string;
	damage: number;
}

export interface HealEvent extends BaseBattleEvent {
	type: BattleEventType.HEAL;
	target: string;
	amount: number;
}

export interface DeathEvent extends BaseBattleEvent {
	type: BattleEventType.DEATH;
	entity: string;
}

export interface VictoryEvent extends BaseBattleEvent {
	type: BattleEventType.VICTORY;
	expGained: number;
}

export interface DefeatEvent extends BaseBattleEvent {
	type: BattleEventType.DEFEAT;
}

export interface FleeEvent extends BaseBattleEvent {
	type: BattleEventType.FLEE;
	success: boolean;
}

export interface StateChangeEvent extends BaseBattleEvent {
	type: BattleEventType.STATE_CHANGE;
	from: string;
	to: string;
}

export interface LogEvent extends BaseBattleEvent {
	type: BattleEventType.LOG;
	message: string;
}

export type BattleEvent =
	| BattleStartEvent
	| TurnStartEvent
	| AttackEvent
	| DamageEvent
	| MissEvent
	| CriticalEvent
	| HealEvent
	| DeathEvent
	| VictoryEvent
	| DefeatEvent
	| FleeEvent
	| StateChangeEvent
	| LogEvent;

export type BattleEventListener = (event: BattleEvent) => void;
