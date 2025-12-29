import type { MonsterTemplate } from "./monster";
import { MONSTER_TEMPLATES } from "./monster-database";

export function getMonsterTemplate(
	key: keyof typeof MONSTER_TEMPLATES,
): MonsterTemplate {
	const template = MONSTER_TEMPLATES[key];
	if (!template) {
		throw new Error(`Monster template '${key}' not found`);
	}
	return template;
}
