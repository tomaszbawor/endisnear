import React from "react";
import { ItemCard } from "@/components/game/ItemCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Item } from "@/engine/player/Equipment";

interface ShopViewProps {
	shopItems: Item[];
	gold: number;
	onBuyItem: (item: Item) => void;
	lastRotation: number;
}

export function ShopView({
	shopItems,
	onBuyItem,
	lastRotation,
}: ShopViewProps) {
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
