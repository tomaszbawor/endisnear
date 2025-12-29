import {
	EquipmentSlot,
	type Item,
	ItemRarity,
	ItemType,
} from "@/types/equipment";

/**
 * Sample items database
 */
export const ITEMS: Record<string, Item> = {
	// Weapons
	IRON_SWORD: {
		id: "iron_sword",
		name: "Iron Sword",
		description: "A sturdy iron sword",
		type: ItemType.WEAPON,
		rarity: ItemRarity.COMMON,
		slot: EquipmentSlot.MAINHAND,
		stats: { attack: 10 },
		price: 50,
	},
	STEEL_SWORD: {
		id: "steel_sword",
		name: "Steel Sword",
		description: "A well-crafted steel blade",
		type: ItemType.WEAPON,
		rarity: ItemRarity.UNCOMMON,
		slot: EquipmentSlot.MAINHAND,
		stats: { attack: 20 },
		price: 150,
	},
	LEGENDARY_BLADE: {
		id: "legendary_blade",
		name: "Legendary Blade",
		description: "A blade of ancient power",
		type: ItemType.WEAPON,
		rarity: ItemRarity.LEGENDARY,
		slot: EquipmentSlot.MAINHAND,
		stats: { attack: 100, strength: 20 },
		price: 5000,
	},

	// Shields
	WOODEN_SHIELD: {
		id: "wooden_shield",
		name: "Wooden Shield",
		description: "Basic wooden protection",
		type: ItemType.ARMOR,
		rarity: ItemRarity.COMMON,
		slot: EquipmentSlot.OFFHAND,
		stats: { defense: 5 },
		price: 30,
	},

	// Head
	LEATHER_CAP: {
		id: "leather_cap",
		name: "Leather Cap",
		description: "Simple leather headwear",
		type: ItemType.ARMOR,
		rarity: ItemRarity.COMMON,
		slot: EquipmentSlot.HEAD,
		stats: { defense: 3 },
		price: 40,
	},
	STEEL_HELMET: {
		id: "steel_helmet",
		name: "Steel Helmet",
		description: "Heavy steel protection",
		type: ItemType.ARMOR,
		rarity: ItemRarity.RARE,
		slot: EquipmentSlot.HEAD,
		stats: { defense: 15, health: 20 },
		price: 300,
	},

	// Torso
	CLOTH_ROBE: {
		id: "cloth_robe",
		name: "Cloth Robe",
		description: "Light cloth armor",
		type: ItemType.ARMOR,
		rarity: ItemRarity.COMMON,
		slot: EquipmentSlot.TORSO,
		stats: { defense: 5, intelligence: 5 },
		price: 60,
	},
	CHAINMAIL: {
		id: "chainmail",
		name: "Chainmail Armor",
		description: "Interlocking metal rings",
		type: ItemType.ARMOR,
		rarity: ItemRarity.UNCOMMON,
		slot: EquipmentSlot.TORSO,
		stats: { defense: 12, health: 15 },
		price: 200,
	},

	// Legs
	LEATHER_PANTS: {
		id: "leather_pants",
		name: "Leather Pants",
		description: "Flexible leather leg protection",
		type: ItemType.ARMOR,
		rarity: ItemRarity.COMMON,
		slot: EquipmentSlot.LEGS,
		stats: { defense: 4, speed: 2 },
		price: 45,
	},

	// Accessories
	SILVER_RING: {
		id: "silver_ring",
		name: "Silver Ring",
		description: "A simple silver band",
		type: ItemType.ACCESSORY,
		rarity: ItemRarity.UNCOMMON,
		slot: EquipmentSlot.RING,
		stats: { intelligence: 5 },
		price: 100,
	},
	GOLD_NECKLACE: {
		id: "gold_necklace",
		name: "Gold Necklace",
		description: "Ornate golden jewelry",
		type: ItemType.ACCESSORY,
		rarity: ItemRarity.RARE,
		slot: EquipmentSlot.NECKLACE,
		stats: { health: 25, defense: 5 },
		price: 250,
	},
	AMULET_OF_POWER: {
		id: "amulet_of_power",
		name: "Amulet of Power",
		description: "Radiates with magical energy",
		type: ItemType.ACCESSORY,
		rarity: ItemRarity.EPIC,
		slot: EquipmentSlot.NECKLACE,
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
