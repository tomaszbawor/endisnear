import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EquipmentSlot, Item } from "@/types/equipment";
import { RARITY_BORDER_COLORS, SLOT_NAMES } from "@/types/equipment";

interface EquipmentSlotProps {
	slot: EquipmentSlot;
	item: Item | undefined;
	onDrop?: (item: Item) => void;
	onRemove?: () => void;
}

export function EquipmentSlotComponent({
	slot,
	item,
	onDrop,
	onRemove,
}: EquipmentSlotProps) {
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const itemData = e.dataTransfer.getData("item");
		if (itemData && onDrop) {
			const droppedItem: Item = JSON.parse(itemData);
			// Only allow items for this slot
			if (droppedItem.slot === slot) {
				onDrop(droppedItem);
			}
		}
	};

	return (
		<div className="space-y-1">
			<div className="text-xs font-medium text-muted-foreground">
				{SLOT_NAMES[slot]}
			</div>
			<Card
				className={cn(
					"relative h-20 w-20 flex items-center justify-center cursor-pointer transition-colors border-2",
					item ? RARITY_BORDER_COLORS[item.rarity] : "border-muted",
					"hover:border-foreground/50",
				)}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				onClick={item ? onRemove : undefined}
			>
				{item ? (
					<div className="text-center p-1">
						<div className="text-2xl">{getSlotIcon(slot)}</div>
						<div className="text-[10px] font-medium truncate">{item.name}</div>
					</div>
				) : (
					<div className="text-2xl opacity-30">{getSlotIcon(slot)}</div>
				)}
			</Card>
		</div>
	);
}

/**
 * Get icon for equipment slot
 */
function getSlotIcon(slot: EquipmentSlot): string {
	switch (slot) {
		case "HEAD":
			return "🎩";
		case "TORSO":
			return "👕";
		case "LEGS":
			return "👖";
		case "MAINHAND":
			return "⚔️";
		case "OFFHAND":
			return "🛡️";
		case "RING":
			return "💍";
		case "NECKLACE":
			return "📿";
		default:
			return "❓";
	}
}
