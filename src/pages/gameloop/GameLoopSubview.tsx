import { BattleView } from "@/components/game/BattleView";
import type { GameView } from "@/state/gameState";
import type { PlayerData } from "@/state/playerState";
import type { EquipmentSlot, Item } from "@/types/equipment";
import { InventoryView } from "./InventoryView";
import { MapView } from "./MapView";
import { SettingsView } from "./SettingsView";
import { ShopView } from "./ShopView";

interface GameLoopSubviewProps {
	currentView: GameView;
	currentPlayer: PlayerData | null;
	inventory: Array<{ item: Item | null; quantity: number }>;
	equippedItems: { [key in EquipmentSlot]?: Item };
	shopItems: Item[];
	gold: number;
	lastShopRotation: number;
	onLocationChange: (location: string) => void;
	onEquipItem: (item: Item) => void;
	onUnequipItem: (slot: EquipmentSlot) => void;
	onSellItem: (item: Item) => void;
	onBuyItem: (item: Item) => void;
	onBackToMap: () => void;
	onPlayerDeath: () => void;
	onMonsterDefeated: (exp: number, gold: number) => void;
}

export function GameLoopSubview({
	currentView,
	currentPlayer,
	inventory,
	equippedItems,
	shopItems,
	gold,
	lastShopRotation,
	onLocationChange,
	onEquipItem,
	onUnequipItem,
	onSellItem,
	onBuyItem,
	onBackToMap,
	onPlayerDeath,
	onMonsterDefeated,
}: GameLoopSubviewProps) {
	return (
		<>
			{currentView === "battle" && currentPlayer && (
				<BattleView
					currentPlayer={currentPlayer}
					onBackToMap={onBackToMap}
					onPlayerDeath={onPlayerDeath}
					onMonsterDefeated={onMonsterDefeated}
				/>
			)}
			{currentView === "map" && (
				<MapView
					currentPlayer={currentPlayer}
					onLocationChange={onLocationChange}
				/>
			)}
			{currentView === "inventory" && (
				<InventoryView
					inventory={inventory}
					equippedItems={equippedItems}
					onEquipItem={onEquipItem}
					onUnequipItem={onUnequipItem}
					onSellItem={onSellItem}
				/>
			)}
			{currentView === "shop" && (
				<ShopView
					shopItems={shopItems}
					gold={gold}
					onBuyItem={onBuyItem}
					lastRotation={lastShopRotation}
				/>
			)}
			{currentView === "settings" && <SettingsView />}
		</>
	);
}
