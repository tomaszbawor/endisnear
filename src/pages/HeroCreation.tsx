import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import React from "react";
import { useNavigate, useSearchParams } from "react-router";
import GameContainer from "@/components/custom/GameContainer";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HERO_CLASSES, type HeroClass } from "@/data/heroClasses";
import { useSavesSet, useSavesValues } from "@/state/gameSaves";
import { createPlayerData, currentPlayerAtom } from "@/state/playerState";

// Local atoms for hero creation state
const heroNameAtom = Atom.make<string>("");
const selectedClassAtom = Atom.make<HeroClass | null>(null);

export default function HeroCreationPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const slotId = searchParams.get("slot");

	const heroName = useAtomValue(heroNameAtom);
	const setHeroName = useAtomSet(heroNameAtom);
	const selectedClass = useAtomValue(selectedClassAtom);
	const setSelectedClass = useAtomSet(selectedClassAtom);
	const setCurrentPlayer = useAtomSet(currentPlayerAtom);
	const gameSaves = useSavesValues();
	const setGameSaves = useSavesSet();

	const handleClassSelect = (heroClass: HeroClass) => {
		setSelectedClass(heroClass);
	};

	const handleStartGame = () => {
		if (!heroName || !selectedClass || !slotId) return;

		// Create player data
		const playerData = createPlayerData(
			heroName,
			selectedClass,
			HERO_CLASSES[selectedClass],
		);

		// Save to the selected slot
		const slotIndex = Number.parseInt(slotId, 10);
		const newSaves = [...gameSaves];
		newSaves[slotIndex] = {
			playerName: playerData.name,
			playerClass: playerData.class,
			level: playerData.level,
			location: playerData.location,
			timePlayed: playerData.timePlayed,
			lastPlayed: playerData.lastPlayed,
			playerData: playerData,
		};
		setGameSaves(newSaves as unknown as typeof gameSaves);

		// Set as current player
		setCurrentPlayer(playerData);

		// Navigate to game loop
		navigate("/gameLoop");
	};

	const handleBack = () => {
		navigate("/newGame");
	};

	const canStart = heroName.trim().length > 0 && selectedClass !== null;

	return (
		<GameContainer>
			<div className="h-full flex flex-col gap-6 py-8">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-4xl font-semibold tracking-tight">
						Create Your Hero
					</h1>
					<p className="mt-2 text-base text-muted-foreground">
						Choose your path and begin your adventure
					</p>
				</div>

				{/* Main Content */}
				<div className="flex-1 flex flex-col gap-6 overflow-y-auto">
					{/* Name Input */}
					<Card>
						<CardHeader>
							<CardTitle>Hero Name</CardTitle>
							<CardDescription>
								Choose a name that will strike fear into your enemies
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Label htmlFor="hero-name">Name</Label>
								<Input
									id="hero-name"
									placeholder="Enter hero name..."
									value={heroName}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setHeroName(e.target.value)
									}
									maxLength={20}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Class Selection */}
					<Card>
						<CardHeader>
							<CardTitle>Choose Your Class</CardTitle>
							<CardDescription>
								Each class has unique strengths and abilities
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-4">
								{(Object.keys(HERO_CLASSES) as HeroClass[]).map((classKey) => {
									const classInfo = HERO_CLASSES[classKey];
									const isSelected = selectedClass === classKey;

									return (
										<Card
											key={classKey}
											className={`cursor-pointer transition-all hover:border-foreground/50 ${
												isSelected
													? "border-amber-300 ring-2 ring-foreground/20 bg-accent/10"
													: ""
											}`}
											onClick={() => handleClassSelect(classKey)}
										>
											<CardHeader className="text-center pb-3">
												<div className="flex justify-center mb-2 text-foreground">
													{React.createElement(classInfo.icon, {
														className: "h-8 w-8",
													})}
												</div>
												<CardTitle className="text-lg">
													{classInfo.name}
												</CardTitle>
												<CardDescription className="text-xs">
													{classInfo.description}
												</CardDescription>
											</CardHeader>
											<CardContent className="pt-0">
												<div className="space-y-1 text-xs">
													<div className="flex justify-between">
														<span className="text-muted-foreground">HP</span>
														<span className="font-medium">
															{classInfo.health}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">STR</span>
														<span className="font-medium">
															{classInfo.baseStats.strength}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">INT</span>
														<span className="font-medium">
															{classInfo.baseStats.intelligence}
														</span>
													</div>
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</CardContent>
					</Card>

					{/* Character Summary */}
					{canStart && (
						<Card className="border-amber-300/50 bg-accent/5">
							<CardHeader>
								<CardTitle>Hero Summary</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Name:</span>
										<span className="font-medium">{heroName}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Class:</span>
										<span className="font-medium">
											{selectedClass && HERO_CLASSES[selectedClass].name}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Save Slot:</span>
										<span className="font-medium">
											{slotId
												? `Slot ${Number.parseInt(slotId, 10) + 1}`
												: "N/A"}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Action Buttons */}
				<div className="flex justify-between gap-3">
					<Button variant="outline" size="lg" onClick={handleBack}>
						Back
					</Button>
					<Button size="lg" disabled={!canStart} onClick={handleStartGame}>
						Start Adventure
					</Button>
				</div>
			</div>
		</GameContainer>
	);
}
