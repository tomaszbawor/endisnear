import { Card } from "@/components/ui/card";
import type { Item } from "@/engine/player/Equipment";
import { RARITY_BORDER_COLORS, RARITY_COLORS } from "@/engine/player/Equipment";
import { cn } from "@/lib/utils";

interface ItemCardProps {
	item: Item;
	onClick?: () => void;
	draggable?: boolean;
	showPrice?: boolean;
	compact?: boolean;
}

export function ItemCard({
	item,
	onClick,
	draggable = false,
	showPrice = false,
	compact = false,
}: ItemCardProps) {
	const handleDragStart = (e: React.DragEvent) => {
		e.dataTransfer.setData("item", JSON.stringify(item));
	};

	return (
		<Card
			className={cn(
				"relative cursor-pointer min-h-20 transition-all hover:scale-105 border-2",
				RARITY_BORDER_COLORS[item.rarity],
				compact ? "p-2" : "p-3",
			)}
			onClick={onClick}
			draggable={draggable}
			onDragStart={handleDragStart}
		>
			<div className="space-y-1">
				<div
					className={cn(
						"font-semibold",
						RARITY_COLORS[item.rarity],
						compact ? "text-xs" : "text-sm",
					)}
				>
					{item.name}
				</div>

				{!compact && (
					<div className="text-xs text-muted-foreground line-clamp-2">
						{item.description}
					</div>
				)}

				<div className="flex flex-wrap gap-1 text-xs">
					{item.stats.attack && (
						<span className="text-red-400">⚔️ {item.stats.attack}</span>
					)}
					{item.stats.defence && (
						<span className="text-blue-400">🛡️ {item.stats.defence}</span>
					)}
					{item.stats.health && (
						<span className="text-green-400">❤️ {item.stats.health}</span>
					)}
					{item.stats.speed && (
						<span className="text-yellow-400">⚡ {item.stats.speed}</span>
					)}
				</div>

				{showPrice && (
					<div className="text-xs font-bold text-amber-400">
						💰 {item.price}g
					</div>
				)}
			</div>
		</Card>
	);
}
