import { EquipmentSlotComponent } from "@/components/game/EquipmentSlot";
import { ItemCard } from "@/components/game/ItemCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Item } from "@/types/equipment";
import { EquipmentSlot } from "@/types/equipment";

interface InventoryViewProps {
	inventory: Array<{ item: Item | null; quantity: number }>;
	equippedItems: { [key in EquipmentSlot]?: Item };
	onEquipItem: (item: Item) => void;
	onUnequipItem: (slot: EquipmentSlot) => void;
	onSellItem: (item: Item) => void;
}

export function InventoryView({
	inventory,
	equippedItems,
	onEquipItem,
	onUnequipItem,
}: InventoryViewProps) {
	return (
		<div className="grid grid-cols-2 space-x-4">
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
					<div className="grid grid-cols-3 gap-2">
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
