import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import React from "react";
import GameContainer from "@/components/custom/GameContainer";
import { CharacterStats } from "@/components/game/CharacterStats";
import { NavigationBar } from "@/components/game/NavigationBar";
import { generateShopItems } from "@/data/items";
import type { EquipmentSlot, Item } from "@/engine/player/Equipment";
import {
	currentViewAtom,
	goldAtom,
	inventoryAtom,
	lastShopRotationAtom,
	shopItemsAtom,
} from "@/state/gameState";
import { currentPlayerAtom, equippedItemsAtom } from "@/state/playerState";
import { GameLoopSubview } from "./gameloop/GameLoopSubview";

export default function GameLoopPage() {
	const currentView = useAtomValue(currentViewAtom);
	const equippedItems = useAtomValue(equippedItemsAtom);
	const inventory = useAtomValue(inventoryAtom);
	const gold = useAtomValue(goldAtom);
	const shopItems = useAtomValue(shopItemsAtom);
	const lastShopRotation = useAtomValue(lastShopRotationAtom);
	const currentPlayer = useAtomValue(currentPlayerAtom);

	const setCurrentView = useAtomSet(currentViewAtom);
	const setEquippedItems = useAtomSet(equippedItemsAtom);
	const setInventory = useAtomSet(inventoryAtom);
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
		let statPoint = currentPlayer.freeStatPoints;

		// Level up if enough exp
		if (newExp >= expToNext) {
			newLevel += 1;
			statPoint += 5;
			expToNext = Math.floor(expToNext * 1.5);
		}

		setCurrentPlayer({
			...currentPlayer,
			level: newLevel,

			currentExp: newExp >= currentPlayer.expToNextLevel ? 0 : newExp,
			expToNextLevel: expToNext,
			freeStatPoints: statPoint,
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
		// TODO: Implement stat recalculation
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
						<CharacterStats />
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
