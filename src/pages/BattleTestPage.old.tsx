import { Effect } from "effect";
import React from "react";
import { BattleLog, SimpleCombatantCard } from "@/components/battle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { BattleEvent } from "@/engine/battle-events";
import { BattleEventType } from "@/engine/battle-events";
import { BattleSystem } from "@/engine/battle-system";
import type { CombatStats } from "@/engine/entity";
import { Entity } from "@/engine/entity";
import { Monster } from "@/engine/monster";
import { MONSTER_TEMPLATES } from "@/engine/monster-database";
import { getMonsterTemplate } from "@/engine/monster-helpers";
import type { Stats } from "@/engine/stats";

// Hero class that extends Entity for combat
class Hero extends Entity {
	name = "Hero";
	stats: Stats = {
		strength: 10,
		dexterity: 8,
		intelligence: 5,
		willpower: 6,
		luck: 4,
		speed: 1,
	};
	combatStats: CombatStats = {
		health: 120,
		maxHealth: 120,
		attack: 15,
		defense: 10,
		speed: 12,
	};
}

export default function BattleTestPage() {
	const [selectedMonster, setSelectedMonster] = React.useState<string>("SLIME");
	const [turnSpeed, setTurnSpeed] = React.useState(500);
	const [battleLog, setBattleLog] = React.useState<string[]>([]);
	const [isRunning, setIsRunning] = React.useState(false);
	const [, forceRender] = React.useReducer((x: number) => x + 1, 0);

	const battleSystemRef = React.useRef<BattleSystem | null>(null);
	const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
	const heroRef = React.useRef<Hero | null>(null);
	const monsterRef = React.useRef<Monster | null>(null);
	const battleIdRef = React.useRef<number>(0);

	// Monster list for selection
	const monsterList = Object.keys(MONSTER_TEMPLATES);

	const logIdCounter = React.useRef(0);

	const addLog = (message: string) => {
		const id = logIdCounter.current++;
		const logEntry = `${id}|[${new Date().toLocaleTimeString()}] ${message}`;
		setBattleLog((prev) => [...prev, logEntry].slice(-20)); // Keep last 20 logs
	};

	const handleEventLog = (event: BattleEvent) => {
		switch (event.type) {
			case BattleEventType.BATTLE_START:
				addLog(`⚔️ Battle started!`);
				break;
			case BattleEventType.TURN_START:
				addLog(`--- Turn ${event.turnNumber} ---`);
				break;
			case BattleEventType.ATTACK:
				addLog(`⚔️ ${event.attacker} attacks ${event.target}!`);
				break;
			case BattleEventType.DAMAGE:
				addLog(
					`💥 ${event.target} takes ${event.damage} damage! (${event.remainingHealth} HP)`,
				);
				break;
			case BattleEventType.MISS:
				addLog(`💨 ${event.attacker} missed!`);
				break;
			case BattleEventType.CRITICAL:
				addLog(
					`🎯 CRITICAL HIT! ${event.attacker} deals ${event.damage} damage!`,
				);
				break;
			case BattleEventType.DEATH:
				addLog(`💀 ${event.entity} has been defeated!`);
				break;
			case BattleEventType.VICTORY:
				addLog(`🎉 Victory! Gained ${event.expGained} EXP!`);
				break;
			case BattleEventType.DEFEAT:
				addLog(`😵 Defeat...`);
				break;
			case BattleEventType.LOG:
				addLog(event.message);
				break;
		}
	};

	const startBattle = async () => {
		if (isRunning) return;

		// Clear any existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		// Increment battle ID to invalidate old battle instances
		battleIdRef.current += 1;
		const currentBattleId = battleIdRef.current;

		// Clear old battle reference
		battleSystemRef.current = null;

		// Reset hero and create new monster
		const newHero = new Hero();
		const newMonster = new Monster(
			getMonsterTemplate(selectedMonster as keyof typeof MONSTER_TEMPLATES),
		);

		heroRef.current = newHero;
		monsterRef.current = newMonster;
		setBattleLog([]);
		setIsRunning(true);
		forceRender(); // Initial render with new entities

		try {
			// Create battle system
			const program = Effect.gen(function* () {
				const battle = yield* BattleSystem.make(newHero, newMonster);
				yield* battle.start();
				return battle;
			});

			const battle = await Effect.runPromise(program);

			// Check if this battle is still the current one
			if (currentBattleId !== battleIdRef.current) {
				return; // A newer battle has started, abandon this one
			}

			battleSystemRef.current = battle;

			let lastEventCount = 0;

			// Auto-play battle with turns
			intervalRef.current = setInterval(() => {
				// Check if this is still the current battle
				if (currentBattleId !== battleIdRef.current) {
					if (intervalRef.current) {
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					}
					return;
				}

				Effect.runPromise(
					Effect.gen(function* () {
						// First, process the turn
						const waitingForInput = yield* battle.isWaitingForPlayerInput();
						if (waitingForInput) {
							yield* battle.playerAttack();
						} else {
							yield* battle.tick();
						}

						// Then get and process new events
						const events = yield* battle.getEvents();
						for (let i = lastEventCount; i < events.length; i++) {
							const event = events[i];
							if (event) {
								handleEventLog(event);
							}
						}
						lastEventCount = events.length;

						// Check if battle finished
						const finished = yield* battle.isFinished();
						if (finished) {
							if (intervalRef.current) {
								clearInterval(intervalRef.current);
								intervalRef.current = null;
							}
							setIsRunning(false);
						}

						// Force UI update
						forceRender();
					}),
				).catch((error) => {
					// Only log errors for the current battle
					if (currentBattleId === battleIdRef.current) {
						console.error("Battle error:", error);
						if (intervalRef.current) {
							clearInterval(intervalRef.current);
							intervalRef.current = null;
						}
						setIsRunning(false);
					}
				});
			}, turnSpeed);
		} catch (error) {
			console.error("Failed to start battle:", error);
			setIsRunning(false);
		}
	};

	const stopBattle = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setIsRunning(false);
	};

	React.useEffect(() => {
		// Cleanup on unmount
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	return (
		<div className="container mx-auto p-4 space-y-4">
			<h1 className="text-3xl font-bold text-center mb-6">Battle Test Arena</h1>

			{/* Controls */}
			<Card>
				<CardHeader>
					<CardTitle>Battle Controls</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="monster-select">Select Monster</Label>
							<Select
								value={selectedMonster}
								onValueChange={setSelectedMonster}
								disabled={isRunning}
							>
								<SelectTrigger id="monster-select">
									<SelectValue placeholder="Choose a monster" />
								</SelectTrigger>
								<SelectContent>
									{monsterList.map((monsterKey) => {
										const template = MONSTER_TEMPLATES[monsterKey];
										return (
											<SelectItem key={monsterKey} value={monsterKey}>
												{template?.name} (Lv. {template?.level})
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="turn-speed">Turn Speed: {turnSpeed}ms</Label>
							<Slider
								id="turn-speed"
								min={100}
								max={2000}
								step={100}
								value={[turnSpeed]}
								onValueChange={(values) => setTurnSpeed(values[0] ?? 500)}
								disabled={isRunning}
							/>
						</div>
					</div>

					<div className="flex gap-2">
						<Button onClick={startBattle} disabled={isRunning}>
							Start Battle
						</Button>
						<Button
							onClick={stopBattle}
							disabled={!isRunning}
							variant="destructive"
						>
							Stop
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Battle Arena */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<SimpleCombatantCard
					combatant={heroRef.current}
					icon="🦸"
					variant="hero"
					emptyMessage="Ready to battle!"
					additionalInfo={
						heroRef.current
							? { "💪 STR": heroRef.current.stats.strength }
							: undefined
					}
				/>
				<SimpleCombatantCard
					combatant={monsterRef.current}
					icon="👹"
					variant="enemy"
					emptyMessage="Select a monster and start battle"
					additionalInfo={
						monsterRef.current
							? { "📊 LVL": MONSTER_TEMPLATES[selectedMonster]?.level ?? 0 }
							: undefined
					}
				/>
			</div>

			{/* Battle Log */}
			<BattleLog logs={battleLog} />
		</div>
	);
}
