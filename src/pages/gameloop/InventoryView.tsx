import { EquipmentSlotComponent } from "@/components/game/EquipmentSlot";
import { ItemCard } from "@/components/game/ItemCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EquipmentSlot, Item } from "@/types/equipment";

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
							slot={"HEAD"}
							item={equippedItems.HEAD}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem("HEAD")}
						/>
						<div />

						{/* Middle row */}
						<EquipmentSlotComponent
							slot={"MAINHAND"}
							item={equippedItems.MAINHAND}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem("MAINHAND")}
						/>
						<EquipmentSlotComponent
							slot={"TORSO"}
							item={equippedItems.TORSO}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem("TORSO")}
						/>
						<EquipmentSlotComponent
							slot={"OFFHAND"}
							item={equippedItems.OFFHAND}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem("OFFHAND")}
						/>

						{/* Bottom row */}
						<EquipmentSlotComponent
							slot={"RING"}
							item={equippedItems.RING}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem("RING")}
						/>
						<EquipmentSlotComponent
							slot={"LEGS"}
							item={equippedItems.LEGS}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem("LEGS")}
						/>
						<EquipmentSlotComponent
							slot={"NECKLACE"}
							item={equippedItems.NECKLACE}
							onDrop={onEquipItem}
							onRemove={() => onUnequipItem("NECKLACE")}
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
