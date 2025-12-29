import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import React from "react";
import GameContainer from "@/components/custom/GameContainer";
import { CharacterStats } from "@/components/game/CharacterStats";
import { EquipmentSlotComponent } from "@/components/game/EquipmentSlot";
import { ItemCard } from "@/components/game/ItemCard";
import { NavigationBar } from "@/components/game/NavigationBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateShopItems } from "@/data/items";
import {
	currentViewAtom,
	equippedItemsAtom,
	goldAtom,
	inventoryAtom,
	lastShopRotationAtom,
	playerStatsAtom,
	shopItemsAtom,
} from "@/state/gameState";
import type { Item } from "@/types/equipment";
import { EquipmentSlot } from "@/types/equipment";

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
	const playerStats = useAtomValue(playerStatsAtom);
	const equippedItems = useAtomValue(equippedItemsAtom);
	const inventory = useAtomValue(inventoryAtom);
	const gold = useAtomValue(goldAtom);
	const shopItems = useAtomValue(shopItemsAtom);
	const lastShopRotation = useAtomValue(lastShopRotationAtom);

	const setCurrentView = useAtomSet(currentViewAtom);
	const setEquippedItems = useAtomSet(equippedItemsAtom);
	const setInventory = useAtomSet(inventoryAtom);
	const setPlayerStats = useAtomSet(playerStatsAtom);
	const setGold = useAtomSet(goldAtom);
	const setShopItems = useAtomSet(shopItemsAtom);
	const setLastShopRotation = useAtomSet(lastShopRotationAtom);

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
			<div className="h-full max-w-7xl mx-auto flex flex-col gap-4">
				{/* Navigation Bar */}
				<NavigationBar
					currentView={currentView}
					onViewChange={setCurrentView}
					gold={gold}
				/>

				<div className="flex-1 flex gap-4 overflow-hidden">
					{/* Left Sidebar - Character Stats */}
					<div className="w-64 flex-shrink-0 overflow-y-auto">
						<CharacterStats stats={playerStats} />
					</div>

					{/* Main Content Area */}
					<div className="flex-1 overflow-y-auto">
						{currentView === "map" && <MapView />}
						{currentView === "inventory" && (
							<InventoryView
								inventory={inventory}
								equippedItems={equippedItems}
								onEquipItem={handleEquipItem}
								onUnequipItem={handleUnequipItem}
								onSellItem={handleSellItem}
							/>
						)}
						{currentView === "shop" && (
							<ShopView
								shopItems={shopItems}
								gold={gold}
								onBuyItem={handleBuyItem}
								lastRotation={lastShopRotation}
							/>
						)}
						{currentView === "settings" && <SettingsView />}
					</div>
				</div>
			</div>
		</GameContainer>
	);
}

// View Components

function MapView() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Map</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-center text-muted-foreground py-8">
					Map view coming soon...
				</div>
			</CardContent>
		</Card>
	);
}

interface InventoryViewProps {
	inventory: Array<{ item: Item | null; quantity: number }>;
	equippedItems: { [key in EquipmentSlot]?: Item };
	onEquipItem: (item: Item) => void;
	onUnequipItem: (slot: EquipmentSlot) => void;
	onSellItem: (item: Item) => void;
}

function InventoryView({
	inventory,
	equippedItems,
	onEquipItem,
	onUnequipItem,
}: InventoryViewProps) {
	return (
		<div className="space-y-4">
			{/* Equipment Panel */}
			<Card>
				<CardHeader>
					<CardTitle>Equipment</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
						{/* Top row */}
						<div />
						<EquipmentSlotComponent
							slot={EquipmentSlot.HEAD}
							item={equippedItems[EquipmentSlot.HEAD]}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem(EquipmentSlot.HEAD)}
						/>
						<div />

						{/* Middle row */}
						<EquipmentSlotComponent
							slot={EquipmentSlot.MAINHAND}
							item={equippedItems[EquipmentSlot.MAINHAND]}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem(EquipmentSlot.MAINHAND)}
						/>
						<EquipmentSlotComponent
							slot={EquipmentSlot.TORSO}
							item={equippedItems[EquipmentSlot.TORSO]}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem(EquipmentSlot.TORSO)}
						/>
						<EquipmentSlotComponent
							slot={EquipmentSlot.OFFHAND}
							item={equippedItems[EquipmentSlot.OFFHAND]}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem(EquipmentSlot.OFFHAND)}
						/>

						{/* Bottom row */}
						<EquipmentSlotComponent
							slot={EquipmentSlot.RING}
							item={equippedItems[EquipmentSlot.RING]}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem(EquipmentSlot.RING)}
						/>
						<EquipmentSlotComponent
							slot={EquipmentSlot.LEGS}
							item={equippedItems[EquipmentSlot.LEGS]}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem(EquipmentSlot.LEGS)}
						/>
						<EquipmentSlotComponent
							slot={EquipmentSlot.NECKLACE}
							item={equippedItems[EquipmentSlot.NECKLACE]}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem(EquipmentSlot.NECKLACE)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Inventory Grid */}
			<Card>
				<CardHeader>
					<CardTitle>Inventory</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-5 gap-2">
						{inventory.map((inventorySlot, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: Fixed inventory slots - index represents slot position
							<div key={`inventory-${index}`}>
								{inventorySlot.item ? (
									<ItemCard
										item={inventorySlot.item}
										onClick={() => {
											if (inventorySlot.item) {
												onEquipItem(inventorySlot.item);
											}
										}}
										draggable={true}
										compact={true}
									/>
								) : (
									<Card className="h-20 border-2 border-dashed border-muted flex items-center justify-center">
										<span className="text-xs text-muted-foreground">Empty</span>
									</Card>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

interface ShopViewProps {
	shopItems: Item[];
	gold: number;
	onBuyItem: (item: Item) => void;
	lastRotation: number;
}

function ShopView({ shopItems, onBuyItem, lastRotation }: ShopViewProps) {
	const [timeUntilRotation, setTimeUntilRotation] = React.useState("");

	React.useEffect(() => {
		const updateTimer = () => {
			const now = Date.now();
			const timeSinceRotation = now - lastRotation;
			const fiveMinutes = 5 * 60 * 1000;
			const remaining = fiveMinutes - timeSinceRotation;

			if (remaining <= 0) {
				setTimeUntilRotation("Rotating soon...");
			} else {
				const minutes = Math.floor(remaining / 60000);
				const seconds = Math.floor((remaining % 60000) / 1000);
				setTimeUntilRotation(
					`${minutes}:${seconds.toString().padStart(2, "0")}`,
				);
			}
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [lastRotation]);

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<CardTitle>Shop</CardTitle>
					<div className="text-sm text-muted-foreground">
						Next rotation: {timeUntilRotation}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{shopItems.map((item) => (
						<ItemCard
							key={item.id}
							item={item}
							onClick={() => onBuyItem(item)}
							showPrice={true}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function SettingsView() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Settings</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="text-sm text-muted-foreground">
						Game settings coming soon...
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
