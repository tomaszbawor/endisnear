import type { Item } from "@/types/equipment";

/**
 * Sample items database
 */
export const ITEMS: Record<string, Item> = {
	// Weapons
	IRON_SWORD: {
		id: "iron_sword",
		name: "Iron Sword",
		description: "A sturdy iron sword",
		type: "WEAPON",
		rarity: "COMMON",
		slot: "MAINHAND",
		stats: { attack: 10 },
		price: 50,
	},
	STEEL_SWORD: {
		id: "steel_sword",
		name: "Steel Sword",
		description: "A well-crafted steel blade",
		type: "WEAPON",
		rarity: "UNCOMMON",
		slot: "MAINHAND",
		stats: { attack: 20 },
		price: 150,
	},
	LEGENDARY_BLADE: {
		id: "legendary_blade",
		name: "Legendary Blade",
		description: "A blade of ancient power",
		type: "WEAPON",
		rarity: "LEGENDARY",
		slot: "MAINHAND",
		stats: { attack: 100, strength: 20 },
		price: 5000,
	},

	// Shields
	WOODEN_SHIELD: {
		id: "wooden_shield",
		name: "Wooden Shield",
		description: "Basic wooden protection",
		type: "ARMOR",
		rarity: "COMMON",
		slot: "OFFHAND",
		stats: { defense: 5 },
		price: 30,
	},

	// Head
	LEATHER_CAP: {
		id: "leather_cap",
		name: "Leather Cap",
		description: "Simple leather headwear",
		type: "ARMOR",
		rarity: "COMMON",
		slot: "HEAD",
		stats: { defense: 3 },
		price: 40,
	},
	STEEL_HELMET: {
		id: "steel_helmet",
		name: "Steel Helmet",
		description: "Heavy steel protection",
		type: "ARMOR",
		rarity: "RARE",
		slot: "HEAD",
		stats: { defense: 15, health: 20 },
		price: 300,
	},

	// Torso
	CLOTH_ROBE: {
		id: "cloth_robe",
		name: "Cloth Robe",
		description: "Light cloth armor",
		type: "ARMOR",
		rarity: "COMMON",
		slot: "TORSO",
		stats: { defense: 5, intelligence: 5 },
		price: 60,
	},
	CHAINMAIL: {
		id: "chainmail",
		name: "Chainmail Armor",
		description: "Interlocking metal rings",
		type: "ARMOR",
		rarity: "UNCOMMON",
		slot: "TORSO",
		stats: { defense: 12, health: 15 },
		price: 200,
	},

	// Legs
	LEATHER_PANTS: {
		id: "leather_pants",
		name: "Leather Pants",
		description: "Flexible leather leg protection",
		type: "ARMOR",
		rarity: "COMMON",
		slot: "LEGS",
		stats: { defense: 4, speed: 2 },
		price: 45,
	},

	// Accessories
	SILVER_RING: {
		id: "silver_ring",
		name: "Silver Ring",
		description: "A simple silver band",
		type: "ACCESSORY",
		rarity: "UNCOMMON",
		slot: "RING",
		stats: { intelligence: 5 },
		price: 100,
	},
	GOLD_NECKLACE: {
		id: "gold_necklace",
		name: "Gold Necklace",
		description: "Ornate golden jewelry",
		type: "ACCESSORY",
		rarity: "RARE",
		slot: "NECKLACE",
		stats: { health: 25, defense: 5 },
		price: 250,
	},
	AMULET_OF_POWER: {
		id: "amulet_of_power",
		name: "Amulet of Power",
		description: "Radiates with magical energy",
		type: "ACCESSORY",
		rarity: "EPIC",
		slot: "NECKLACE",
		stats: { attack: 15, intelligence: 20, strength: 10 },
		price: 1000,
	},
};

/**
 * Get random items for shop
 */
export function generateShopItems(count: number): Item[] {
	const allItems = Object.values(ITEMS);
	const shopItems: Item[] = [];

	for (let i = 0; i < count; i++) {
		const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
		if (randomItem) {
			shopItems.push(randomItem);
		}
	}

	return shopItems;
}
