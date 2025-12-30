import { WorldMap } from "@/components/game/WorldMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MapLocation } from "@/data/mapLocations";
import type { PlayerData } from "@/engine/player/Player";

interface MapViewProps {
	currentPlayer: PlayerData | null;
	onLocationChange: (location: string) => void;
}

export function MapView({ currentPlayer, onLocationChange }: MapViewProps) {
	const handleLocationSelect = (location: MapLocation) => {
		onLocationChange(location.id);
	};

	if (!currentPlayer) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Map</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">
						No player data available
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>World Map</CardTitle>
			</CardHeader>
			<CardContent className="h-[500px]">
				<WorldMap
					currentLocation={currentPlayer.location}
					playerLevel={currentPlayer.level}
					onLocationSelect={handleLocationSelect}
				/>
			</CardContent>
		</Card>
	);
}
