import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Duration, Effect, Fiber, Schedule, Stream } from "effect";
import React from "react";
import { BattleLog, SimpleCombatantCard } from "@/components/battle";
import GameContainer from "@/components/custom/GameContainer";
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
import { BattleSystem } from "@/engine/battle-system";
import type { CombatStats } from "@/engine/entity";
import { Entity } from "@/engine/entity";
import { Monster } from "@/engine/monster";
import { MONSTER_TEMPLATES } from "@/engine/monster-database";
import { getMonsterTemplate } from "@/engine/monster-helpers";
import type { Stats } from "@/engine/stats";
import {
	battleEntitiesAtom,
	battleEventsAtom,
	battleStateAtom,
	logIdCounterAtom,
} from "@/state/battleAtoms";
import { formatBattleEvent } from "@/utils/battleEventFormatter";

// Hero class that extends Entity for combat
class Hero extends Entity {
	name = "Hero";
	stats: Stats = {
		strength: 10,
		dexterity: 8,
		intelligence: 5,
		willpower: 6,
		luck: 4,
		speed: 2,
	};
	combatStats: CombatStats = {
		health: 120,
		maxHealth: 120,
		attack: 15,
		defense: 10,
		speed: 12,
	};
}

// Local atoms for UI state
const selectedMonsterAtom = Atom.make<string>("SLIME");
const turnSpeedAtom = Atom.make<number>(500);

export default function BattleTestPage() {
	// Read state from atoms
	const selectedMonster = useAtomValue(selectedMonsterAtom);
	const turnSpeed = useAtomValue(turnSpeedAtom);
	const battleState = useAtomValue(battleStateAtom);
	const battleEntities = useAtomValue(battleEntitiesAtom);
	const battleLog = useAtomValue(battleEventsAtom);

	// Setters
	const setSelectedMonster = useAtomSet(selectedMonsterAtom);
	const setTurnSpeed = useAtomSet(turnSpeedAtom);
	const setBattleState = useAtomSet(battleStateAtom);
	const setBattleEvents = useAtomSet(battleEventsAtom);
	const setBattleEntities = useAtomSet(battleEntitiesAtom);
	const setLogIdCounter = useAtomSet(logIdCounterAtom);

	// Monster list for selection
	const monsterList = Object.keys(MONSTER_TEMPLATES);

	// Battle loop effect
	React.useEffect(() => {
		if (!battleState?.isRunning || !battleEntities.battleSystem) {
			return;
		}

		const battle = battleEntities.battleSystem;
		let battleLoopFiber: Fiber.RuntimeFiber<number, never> | null = null;
		let eventStreamFiber: Fiber.RuntimeFiber<void, never> | null = null;

		// Battle loop
		const battleLoop = Effect.gen(function* () {
			const finished = yield* battle.isFinished();
			if (finished) {
				setBattleState((current) =>
					current ? { ...current, isRunning: false } : null,
				);
				return yield* Effect.interrupt;
			}

			const waitingForInput = yield* battle.isWaitingForPlayerInput();
			if (waitingForInput) {
				yield* battle.playerAttack();
			} else {
				yield* battle.tick();
			}
		}).pipe(Effect.repeat(Schedule.spaced(Duration.millis(turnSpeed))));

		// Event stream
		const eventStream = Stream.runForEach(battle.getEventStream(), (event) =>
			Effect.sync(() => {
				setLogIdCounter((id) => {
					const formatted = formatBattleEvent(event, id);
					setBattleEvents((prev) => [...prev, formatted].slice(-20));
					return id + 1;
				});
			}),
		);

		// Start both fibers
		battleLoopFiber = Effect.runFork(battleLoop);
		eventStreamFiber = Effect.runFork(eventStream);

		// Cleanup
		return () => {
			if (battleLoopFiber) Effect.runFork(Fiber.interrupt(battleLoopFiber));
			if (eventStreamFiber) Effect.runFork(Fiber.interrupt(eventStreamFiber));
		};
	}, [
		battleState?.isRunning,
		battleEntities.battleSystem,
		setBattleState,
		setBattleEvents,
		setLogIdCounter,
		turnSpeed,
	]);

	const startBattle = async () => {
		if (battleState?.isRunning) return;

		const newBattleId = (battleState?.battleId ?? 0) + 1;
		const newHero = new Hero();
		const newMonster = new Monster(
			getMonsterTemplate(selectedMonster as keyof typeof MONSTER_TEMPLATES),
		);

		// Clear battle log and reset counter
		setBattleEvents([]);
		setLogIdCounter(0);

		// Create battle system
		const program = Effect.gen(function* () {
			const battle = yield* BattleSystem.make(newHero, newMonster);
			yield* battle.start();
			return battle;
		});

		const battle = await Effect.runPromise(program);

		// Update atoms - this will trigger the useEffect above
		setBattleEntities({
			hero: newHero,
			monster: newMonster,
			battleSystem: battle,
		});

		setBattleState({
			isRunning: true,
			battleId: newBattleId,
			turnSpeed,
			selectedMonster,
		});
	};

	const stopBattle = () => {
		if (battleState) {
			setBattleState({
				...battleState,
				isRunning: false,
			});
		}
	};

	return (
		<GameContainer>
			<div className="h-full space-y-4">
				<h1 className="text-3xl font-bold text-center mb-6">
					Battle Test Arena
				</h1>

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
									disabled={battleState?.isRunning ?? false}
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
									disabled={battleState?.isRunning ?? false}
								/>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={startBattle}
								disabled={battleState?.isRunning ?? false}
							>
								Start Battle
							</Button>
							<Button
								onClick={stopBattle}
								disabled={!battleState?.isRunning}
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
						combatant={battleEntities.hero}
						icon="🦸"
						variant="hero"
						emptyMessage="Ready to battle!"
						additionalInfo={
							battleEntities.hero
								? { "💪 STR": battleEntities.hero.stats.strength }
								: undefined
						}
					/>
					<SimpleCombatantCard
						combatant={battleEntities.monster}
						icon="👹"
						variant="enemy"
						emptyMessage="Select a monster and start battle"
						additionalInfo={
							battleEntities.monster
								? { "📊 LVL": MONSTER_TEMPLATES[selectedMonster]?.level ?? 0 }
								: undefined
						}
					/>
				</div>

				{/* Battle Log */}
				<BattleLog logs={battleLog} />
			</div>
		</GameContainer>
	);
}
