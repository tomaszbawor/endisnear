import React from "react";
import type { MapLocation } from "@/data/mapLocations";
import { MAP_LOCATIONS } from "@/data/mapLocations";

interface WorldMapProps {
	currentLocation: string;
	playerLevel: number;
	onLocationSelect: (location: MapLocation) => void;
}

export function WorldMap({
	currentLocation,
	playerLevel,
	onLocationSelect,
}: WorldMapProps) {
	const [hoveredLocation, setHoveredLocation] = React.useState<string | null>(
		null,
	);

	const isLocationAvailable = (location: MapLocation) => {
		return playerLevel >= location.levelRequirement;
	};

	const isLocationCurrent = (location: MapLocation) => {
		return currentLocation === location.id;
	};

	const handleLocationClick = (location: MapLocation) => {
		if (isLocationAvailable(location)) {
			onLocationSelect(location);
		}
	};

	return (
		<div className="relative w-full h-full flex items-center justify-center">
			<svg
				viewBox="0 0 1000 400"
				className="w-full h-full"
				style={{ maxHeight: "600px" }}
				role="img"
				aria-label="World map with clickable locations"
			>
				<title>World Map</title>
				{/* Background */}
				<rect width="1000" height="400" fill="#1a1a1a" />

				{/* Mountains background */}
				<path
					d="M 0 350 L 100 250 L 200 300 L 300 200 L 400 280 L 500 220 L 600 260 L 700 180 L 800 240 L 900 160 L 1000 200 L 1000 400 L 0 400 Z"
					fill="#2a2a2a"
					opacity="0.5"
				/>

				{/* Paths connecting locations */}
				<g stroke="#4a4a4a" strokeWidth="2" fill="none" strokeDasharray="5,5">
					{/* Starting Village -> Goblin Forest */}
					<line x1="100" y1="300" x2="250" y2="200" />
					{/* Goblin Forest -> Bandit Camp */}
					<line x1="250" y1="200" x2="400" y2="150" />
					{/* Bandit Camp -> Orc Stronghold */}
					<line x1="400" y1="150" x2="550" y2="250" />
					{/* Orc Stronghold -> Dark Castle */}
					<line x1="550" y1="250" x2="700" y2="200" />
					{/* Dark Castle -> Dragon Peak */}
					<line x1="700" y1="200" x2="850" y2="100" />
				</g>

				{/* Location markers */}
				{MAP_LOCATIONS.map((location) => {
					const available = isLocationAvailable(location);
					const current = isLocationCurrent(location);
					const hovered = hoveredLocation === location.id;

					return (
						// biome-ignore lint/a11y/useSemanticElements: SVG elements cannot use semantic HTML elements
						<g
							key={location.id}
							role="button"
							tabIndex={available ? 0 : -1}
							aria-label={`${location.name} - ${location.description}`}
							onMouseEnter={() => setHoveredLocation(location.id)}
							onMouseLeave={() => setHoveredLocation(null)}
							onClick={() => handleLocationClick(location)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									handleLocationClick(location);
								}
							}}
							style={{ cursor: available ? "pointer" : "not-allowed" }}
						>
							{/* Outer glow for current location */}
							{current && (
								<circle
									cx={location.coordinates.x}
									cy={location.coordinates.y}
									r="25"
									fill="none"
									stroke="#fbbf24"
									strokeWidth="2"
									opacity="0.6"
								>
									<animate
										attributeName="r"
										values="25;30;25"
										dur="2s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0.6;0.3;0.6"
										dur="2s"
										repeatCount="indefinite"
									/>
								</circle>
							)}

							{/* Location circle */}
							<circle
								cx={location.coordinates.x}
								cy={location.coordinates.y}
								r={hovered ? "18" : "15"}
								fill={
									!available
										? "#4a4a4a"
										: current
											? "#fbbf24"
											: hovered
												? "#60a5fa"
												: "#8b5cf6"
								}
								stroke={available ? "#fff" : "#666"}
								strokeWidth="2"
								className="transition-all duration-200"
							/>

							{/* Level requirement indicator for locked locations */}
							{!available && (
								<text
									x={location.coordinates.x}
									y={location.coordinates.y + 5}
									textAnchor="middle"
									fill="#fff"
									fontSize="12"
									fontWeight="bold"
								>
									{location.levelRequirement}
								</text>
							)}

							{/* Location name */}
							<text
								x={location.coordinates.x}
								y={location.coordinates.y - 25}
								textAnchor="middle"
								fill="#fff"
								fontSize="14"
								fontWeight="bold"
								className="pointer-events-none"
							>
								{location.name}
							</text>

							{/* Monster count badge */}
							{available && location.monsters.length > 0 && (
								<g>
									<circle
										cx={location.coordinates.x + 15}
										cy={location.coordinates.y - 15}
										r="10"
										fill="#dc2626"
										stroke="#fff"
										strokeWidth="1"
									/>
									<text
										x={location.coordinates.x + 15}
										y={location.coordinates.y - 11}
										textAnchor="middle"
										fill="#fff"
										fontSize="10"
										fontWeight="bold"
									>
										{location.monsters.length}
									</text>
								</g>
							)}
						</g>
					);
				})}
			</svg>

			{/* Location info panel */}
			{hoveredLocation && (
				<div className="absolute bottom-4 left-4 right-4 bg-background/95 border border-border rounded-lg p-4 shadow-lg">
					{(() => {
						const location = MAP_LOCATIONS.find(
							(loc) => loc.id === hoveredLocation,
						);
						if (!location) return null;

						const available = isLocationAvailable(location);

						return (
							<div>
								<h3 className="font-bold text-lg mb-1">{location.name}</h3>
								<p className="text-sm text-muted-foreground mb-2">
									{location.description}
								</p>
								<div className="flex items-center gap-4 text-sm">
									<div>
										<span className="text-muted-foreground">Level Req:</span>{" "}
										<span
											className={available ? "text-green-500" : "text-red-500"}
										>
											{location.levelRequirement}
										</span>
									</div>
									{location.monsters.length > 0 && (
										<div>
											<span className="text-muted-foreground">Monsters:</span>{" "}
											<span className="text-foreground">
												{location.monsters.map((m) => m.name).join(", ")}
											</span>
										</div>
									)}
								</div>
								{!available && (
									<div className="mt-2 text-xs text-yellow-500">
										Reach level {location.levelRequirement} to unlock this
										location
									</div>
								)}
							</div>
						);
					})()}
				</div>
			)}
		</div>
	);
}
