import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import React from "react";
import GameContainer from "@/components/custom/GameContainer";
import { CharacterStats } from "@/components/game/CharacterStats";
import { NavigationBar } from "@/components/game/NavigationBar";
import { generateShopItems } from "@/data/items";
import {
	currentViewAtom,
	equippedItemsAtom,
	goldAtom,
	inventoryAtom,
	lastShopRotationAtom,
	shopItemsAtom,
} from "@/state/gameState";
import { currentPlayerAtom } from "@/state/playerState";
import type { EquipmentSlot, Item } from "@/types/equipment";
import { GameLoopSubview } from "./gameloop/GameLoopSubview";

/**
 * Calculate total stats from equipped items
 */
function calculateTotalStats(equipment: Record<string, Item | undefined>) {
	const baseStats = {
		attack: 10,
		defense: 5,
		health: 100,
		speed: 10,
		strength: 5,
		dexterity: 5,
		intelligence: 5,
	};

	const totalStats = { ...baseStats };

	for (const item of Object.values(equipment)) {
		if (!item) continue;
		if (item.stats.attack) totalStats.attack += item.stats.attack;
		if (item.stats.defense) totalStats.defense += item.stats.defense;
		if (item.stats.health) totalStats.health += item.stats.health;
		if (item.stats.speed) totalStats.speed += item.stats.speed;
		if (item.stats.strength) totalStats.strength += item.stats.strength;
		if (item.stats.dexterity) totalStats.dexterity += item.stats.dexterity;
		if (item.stats.intelligence)
			totalStats.intelligence += item.stats.intelligence;
	}

	return { baseStats, totalStats };
}

export default function GameLoopPage() {
	const currentView = useAtomValue(currentViewAtom);
	const playerStats = useAtomValue(currentPlayerAtom);
	const equippedItems = useAtomValue(equippedItemsAtom);
	const inventory = useAtomValue(inventoryAtom);
	const gold = useAtomValue(goldAtom);
	const shopItems = useAtomValue(shopItemsAtom);
	const lastShopRotation = useAtomValue(lastShopRotationAtom);
	const currentPlayer = useAtomValue(currentPlayerAtom);

	const setCurrentView = useAtomSet(currentViewAtom);
	const setEquippedItems = useAtomSet(equippedItemsAtom);
	const setInventory = useAtomSet(inventoryAtom);
	const setPlayerStats = useAtomSet(currentPlayerAtom);
	const setGold = useAtomSet(goldAtom);
	const setShopItems = useAtomSet(shopItemsAtom);
	const setLastShopRotation = useAtomSet(lastShopRotationAtom);
	const setCurrentPlayer = useAtomSet(currentPlayerAtom);

	// Shop rotation timer (5 minutes)
	React.useEffect(() => {
		const checkRotation = () => {
			const now = Date.now();
			const timeSinceRotation = now - lastShopRotation;
			const fiveMinutes = 5 * 60 * 1000;

			if (timeSinceRotation >= fiveMinutes) {
				setShopItems(generateShopItems(6));
				setLastShopRotation(now);
			}
		};

		// Initial shop items if empty
		if (shopItems.length === 0) {
			setShopItems(generateShopItems(6));
		}

		// Check every minute
		const interval = setInterval(checkRotation, 60 * 1000);
		return () => clearInterval(interval);
	}, [lastShopRotation, shopItems.length, setShopItems, setLastShopRotation]);

	const handleLocationChange = (locationId: string) => {
		if (!currentPlayer) return;

		// Update player's location
		setCurrentPlayer({
			...currentPlayer,
			location: locationId,
		});

		// Switch to battle view when changing location
		setCurrentView("battle");
	};

	const handlePlayerDeath = () => {
		if (!currentPlayer) return;

		// Player dies - reset health to full after death
		// The BattleView handles the 5-second death screen
		setCurrentPlayer({
			...currentPlayer,
			stats: {
				...currentPlayer.stats,
				currentHealth: currentPlayer.stats.health,
			},
		});
	};

	const handleMonsterDefeated = (exp: number, gold: number) => {
		console.log("Monster defeated");
		if (!currentPlayer) return;

		// Add gold
		setGold((current) => current + gold);

		// Add experience
		const newExp = currentPlayer.currentExp + exp;
		let newLevel = currentPlayer.level;
		let expToNext = currentPlayer.expToNextLevel;

		// Level up if enough exp
		if (newExp >= expToNext) {
			newLevel += 1;
			expToNext = Math.floor(expToNext * 1.5);
		}

		setCurrentPlayer({
			...currentPlayer,
			level: newLevel,
			currentExp: newExp >= currentPlayer.expToNextLevel ? 0 : newExp,
			expToNextLevel: expToNext,
		});
	};

	const handleBackToMap = () => {
		setCurrentView("map");
	};

	const handleEquipItem = (item: Item) => {
		if (!item.slot) return;

		// Remove item from inventory
		const inventoryIndex = inventory.findIndex(
			(inventorySlot: { item: Item | null }) =>
				inventorySlot.item?.id === item.id,
		);
		if (inventoryIndex === -1) return;

		// Unequip current item in slot if exists
		const currentItem = equippedItems[item.slot];
		if (currentItem) {
			handleUnequipItem(item.slot);
		}

		// Equip new item
		const newEquipment = { ...equippedItems, [item.slot]: item };
		setEquippedItems(newEquipment);

		// Remove from inventory
		const newInventory = [...inventory];
		newInventory[inventoryIndex] = { item: null, quantity: 0 };
		setInventory(newInventory);

		// Recalculate stats
		const { baseStats, totalStats } = calculateTotalStats(newEquipment);
		setPlayerStats({
			...playerStats,
			baseStats,
			totalStats,
		});
	};

	const handleUnequipItem = (slot: EquipmentSlot) => {
		const item = equippedItems[slot];
		if (!item) return;

		// Find empty inventory slot
		const emptySlotIndex = inventory.findIndex(
			(inventorySlot: { item: Item | null }) => !inventorySlot.item,
		);
		if (emptySlotIndex === -1) {
			console.warn("Inventory is full!");
			return;
		}

		// Add to inventory
		const newInventory = [...inventory];
		newInventory[emptySlotIndex] = { item, quantity: 1 };
		setInventory(newInventory);

		// Remove from equipment
		const newEquipment = { ...equippedItems, [slot]: undefined };
		setEquippedItems(newEquipment);

		// Recalculate stats
		const { baseStats, totalStats } = calculateTotalStats(newEquipment);
		setPlayerStats({
			...playerStats,
			baseStats,
			totalStats,
		});
	};

	// Todo: remove to some global management class
	const handleBuyItem = (item: Item) => {
		if (gold < item.price) {
			console.warn("Not enough gold!");
			return;
		}

		// Find empty inventory slot
		const emptySlotIndex = inventory.findIndex(
			(inventorySlot: { item: Item | null }) => !inventorySlot.item,
		);
		if (emptySlotIndex === -1) {
			console.warn("Inventory is full!");
			return;
		}

		// Add to inventory
		const newInventory = [...inventory];
		newInventory[emptySlotIndex] = { item, quantity: 1 };
		setInventory(newInventory);

		// Deduct gold
		setGold(gold - item.price);
	};

	// Todo: remove to some global management class
	const handleSellItem = (item: Item) => {
		const inventoryIndex = inventory.findIndex(
			(inventorySlot: { item: Item | null }) =>
				inventorySlot.item?.id === item.id,
		);
		if (inventoryIndex === -1) return;

		// Remove from inventory
		const newInventory = [...inventory];
		newInventory[inventoryIndex] = { item: null, quantity: 0 };
		setInventory(newInventory);

		// Add gold (50% of price)
		setGold(gold + Math.floor(item.price * 0.5));
	};

	return (
		<GameContainer>
			<div className="h-full flex flex-col gap-4">
				{/* Navigation Bar */}
				<NavigationBar
					currentView={currentView}
					onViewChange={setCurrentView}
					gold={gold}
				/>

				<div className="flex-1 flex gap-4 overflow-hidden">
					{/* Left Sidebar - Character Stats */}
					<div className="w-64 shrink-0 overflow-y-auto">
						<CharacterStats stats={playerStats} />
					</div>

					{/* Main Content Area */}
					<div className="flex-1 overflow-y-auto">
						<GameLoopSubview
							currentView={currentView}
							currentPlayer={currentPlayer}
							inventory={inventory}
							equippedItems={equippedItems}
							shopItems={shopItems}
							gold={gold}
							lastShopRotation={lastShopRotation}
							onLocationChange={handleLocationChange}
							onEquipItem={handleEquipItem}
							onUnequipItem={handleUnequipItem}
							onSellItem={handleSellItem}
							onBuyItem={handleBuyItem}
							onBackToMap={handleBackToMap}
							onPlayerDeath={handlePlayerDeath}
							onMonsterDefeated={handleMonsterDefeated}
						/>
					</div>
				</div>
			</div>
		</GameContainer>
	);
}
