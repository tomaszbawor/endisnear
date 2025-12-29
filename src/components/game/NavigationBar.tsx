import { Backpack, Map as MapIcon, Settings, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GameView } from "@/state/gameState";

interface NavigationBarProps {
	currentView: GameView;
	onViewChange: (view: GameView) => void;
	gold: number;
}

export function NavigationBar({
	currentView,
	onViewChange,
	gold,
}: NavigationBarProps) {
	return (
		<Card className="p-2">
			<div className="flex items-center justify-between gap-2">
				<div className="flex gap-2">
					<NavButton
						icon={<MapIcon className="h-4 w-4" />}
						label="Map"
						active={currentView === "map"}
						onClick={() => onViewChange("map")}
					/>
					<NavButton
						icon={<Backpack className="h-4 w-4" />}
						label="Inventory"
						active={currentView === "inventory"}
						onClick={() => onViewChange("inventory")}
					/>
					<NavButton
						icon={<ShoppingBag className="h-4 w-4" />}
						label="Shop"
						active={currentView === "shop"}
						onClick={() => onViewChange("shop")}
					/>
					<NavButton
						icon={<Settings className="h-4 w-4" />}
						label="Settings"
						active={currentView === "settings"}
						onClick={() => onViewChange("settings")}
					/>
				</div>

				<div className="text-sm font-semibold text-amber-400">💰 {gold}g</div>
			</div>
		</Card>
	);
}

function NavButton({
	icon,
	label,
	active,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<Button
			variant={active ? "default" : "outline"}
			size="sm"
			className={cn("gap-1", active && "bg-primary")}
			onClick={onClick}
		>
			{icon}
			<span className="hidden sm:inline">{label}</span>
		</Button>
	);
}
