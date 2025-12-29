import type { LucideIcon } from "lucide-react";
import { Sword, Wand2, Zap } from "lucide-react";

/**
 * Available hero classes
 */
export type HeroClass = "warrior" | "mage" | "rogue";

/**
 * Base stats for each attribute
 */
export interface BaseStats {
	strength: number;
	dexterity: number;
	intelligence: number;
	health: number;
	attack: number;
	defense: number;
}

/**
 * Class information including base stats and description
 */
export interface ClassInfo {
	name: string;
	description: string;
	icon: LucideIcon;
	baseStats: BaseStats;
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
			health: 120,
			attack: 12,
			defense: 8,
		},
	},
	mage: {
		name: "Mage",
		description: "Wielders of arcane power and mystical knowledge",
		icon: Wand2,
		baseStats: {
			strength: 3,
			dexterity: 4,
			intelligence: 8,
			health: 80,
			attack: 15,
			defense: 4,
		},
	},
	rogue: {
		name: "Rogue",
		description: "Swift and cunning, experts in stealth and precision",
		icon: Zap,
		baseStats: {
			strength: 4,
			dexterity: 8,
			intelligence: 3,
			health: 100,
			attack: 10,
			defense: 6,
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
export function getClassBaseStats(heroClass: HeroClass): BaseStats {
	return { ...HERO_CLASSES[heroClass].baseStats };
}
