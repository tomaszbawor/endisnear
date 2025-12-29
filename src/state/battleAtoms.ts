import { Atom } from "@effect-atom/atom-react";
import type { BattleSystem } from "@/engine/battle-system";
import type { Entity } from "@/engine/entity";

/**
 * Battle state atom - Tracks the current battle configuration and status
 *
 * This atom stores:
 * - isRunning: Whether a battle is currently active
 * - battleId: Unique ID for the current battle session (for cleanup/invalidation)
 * - turnSpeed: Battle animation speed in milliseconds
 * - selectedMonster: Key of the monster template to battle against
 */
export interface BattleState {
	isRunning: boolean;
	battleId: number;
	turnSpeed: number;
	selectedMonster: string;
}

export const battleStateAtom = Atom.make<BattleState | null>(null);

/**
 * Battle entities atom - Stores the active battle participants and system
 *
 * This atom stores:
 * - hero: The player's hero entity
 * - monster: The enemy monster entity
 * - battleSystem: The BattleSystem instance managing the battle logic
 */
export interface BattleEntities {
	hero: Entity | null;
	monster: Entity | null;
	battleSystem: BattleSystem | null;
}

export const battleEntitiesAtom = Atom.make<BattleEntities>({
	hero: null,
	monster: null,
	battleSystem: null,
});

/**
 * Battle events atom - Stores the battle log entries
 *
 * Each entry is a formatted string with timestamp and event details.
 * Limited to last 20 events for performance.
 */
export const battleEventsAtom = Atom.make<string[]>([]);

/**
 * Log ID counter atom - Tracks unique IDs for battle log entries
 */
export const logIdCounterAtom = Atom.make<number>(0);
