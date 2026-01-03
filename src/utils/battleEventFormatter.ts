import type { BattleEvent } from "@/engine/battle-events";
import { BattleEventType } from "@/engine/battle-events";

/**
 * Format a battle event into a human-readable log entry with timestamp
 *
 * @param event - The battle event to format
 * @param logId - Unique ID for this log entry
 * @returns Formatted log string in format "id|[timestamp] message"
 */
export function formatBattleEvent(event: BattleEvent, logId: number): string {
	const timestamp = new Date(event.timestamp).toLocaleTimeString();
	let message = "";

	switch (event.type) {
		case BattleEventType.BATTLE_START:
			message = "⚔️ Battle started!";
			break;
		case BattleEventType.TURN_START:
			message = `--- Turn ${event.turnNumber} ---`;
			break;
		case BattleEventType.ATTACK:
			message = `⚔️ ${event.attacker} attacks ${event.target}!`;
			break;
		case BattleEventType.DAMAGE:
			message = `💥 ${event.target} takes ${event.damage} damage! (${event.remainingHealth} HP)`;
			break;
		case BattleEventType.MISS:
			message = `💨 ${event.attacker} missed!`;
			break;
		case BattleEventType.CRITICAL:
			message = `🎯 CRITICAL HIT! ${event.attacker} deals ${event.damage} damage!`;
			break;
		case BattleEventType.DEATH:
			message = `💀 ${event.entity} has been defeated!`;
			break;
		case BattleEventType.VICTORY:
			message = `🎉 Victory! Gained ${event.expGained} EXP!`;
			break;
		case BattleEventType.DEFEAT:
			message = `😵 Defeat...`;
			break;
		case BattleEventType.LOG:
			message = event.message;
			break;
	}

	return `${logId}|[${timestamp}] ${message}`;
}
