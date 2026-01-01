import type { LucideIcon } from "lucide-react";
import { Sword, Wand2, Zap } from "lucide-react";
import type { Stats } from "@/engine/stats";

/**
 * Available hero classes
 */
export type HeroClass = "warrior" | "mage" | "rogue";

/**
 * Class information including base stats and description
 */
export interface ClassInfo {
	name: string;
	description: string;
	icon: LucideIcon;
	health: number;
	baseStats: Stats;
}

/**
 * Hero class definitions with their base stats and characteristics
 */
export const HERO_CLASSES: Record<HeroClass, ClassInfo> = {
	warrior: {
		name: "Warrior",
		description: "Strong and resilient, masters of melee combat",
		icon: Sword,
		baseStats: {
			strength: 8,
			dexterity: 4,
			intelligence: 3,
			willpower: 1,
			speed: 1,
			luck: 1,
		},
		health: 100,
	},
	mage: {
		name: "Mage",
		description: "Wielders of arcane power and mystical knowledge",
		icon: Wand2,
		baseStats: {
			strength: 3,
			dexterity: 4,
			intelligence: 8,
			willpower: 2,
			speed: 2,
			luck: 2,
		},
		health: 80,
	},
	rogue: {
		name: "Rogue",
		description: "Swift and cunning, experts in stealth and precision",
		icon: Zap,
		health: 100,
		baseStats: {
			strength: 4,
			dexterity: 8,
			intelligence: 3,
			willpower: 1,
			speed: 1,
			luck: 4,
		},
	},
};

/**
 * Get class icon component
 */
export function getClassIcon(heroClass: HeroClass): LucideIcon {
	return HERO_CLASSES[heroClass].icon;
}

/**
 * Get class display name
 */
export function getClassName(heroClass: HeroClass): string {
	return HERO_CLASSES[heroClass].name;
}

/**
 * Get base stats for a class
 */
export function getClassBaseStats(heroClass: HeroClass): Stats {
	return { ...HERO_CLASSES[heroClass].baseStats };
}
