import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Duration, Effect, Fiber, Schedule, Stream } from "effect";
import React from "react";
import { BattleLog, SimpleCombatantCard } from "@/components/battle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Monster as MonsterData } from "@/data/mapLocations";
import { getLocationById } from "@/data/mapLocations";
import { BattleSystem } from "@/engine/battle-system";
import type { CombatStats } from "@/engine/entity";
import { Entity } from "@/engine/entity";
import { Monster, type MonsterTemplate } from "@/engine/monster";
import type { ItemStats } from "@/engine/player/Equipment";
import type { PlayerData } from "@/engine/player/Player";
import type { Stats } from "@/engine/stats";
import {
	battleEntitiesAtom,
	battleEventsAtom,
	battleStateAtom,
	deathStateAtom,
	logIdCounterAtom,
} from "@/state/battleAtoms";
import { statsWithInventoryAtom } from "@/state/playerState";
import { formatBattleEvent } from "@/utils/battleEventFormatter";

// Hero class that uses player data
class HeroBattleInstance extends Entity {
	name: string;
	stats: Stats;
	combatStats: CombatStats;
	// TODO: Replace that type with non optional ones
	constructor(playerData: PlayerData, effectiveStats: ItemStats) {
		super();
		this.name = playerData.name;
		this.stats = playerData.stats;

		this.combatStats = {
			health: effectiveStats.health ?? playerData.health,
			maxHealth: effectiveStats.health ?? playerData.health,
			attack: effectiveStats.attack ?? playerData.stats.strength,
			defense: effectiveStats.defence ?? playerData.stats.willpower, // TODO: Is it really willpower??
			speed: effectiveStats.speed ?? playerData.stats.speed,
		};
	}
}

// Convert map monster data to engine monster template
function convertToMonsterTemplate(monster: MonsterData): MonsterTemplate {
	return {
		name: monster.name,
		level: monster.level,
		stats: {
			strength: Math.floor(monster.stats.attack / 2),
			dexterity: Math.floor(monster.stats.speed / 2),
			intelligence: 5,
			willpower: 5,
			speed: monster.stats.speed,
			luck: 3,
		},
		baseHealth: monster.stats.health,
		baseAttack: monster.stats.attack,
		baseDefense: monster.stats.defense,
		baseSpeed: monster.stats.speed,
		expReward: monster.stats.experience,
	};
}

// Store gold drops separately (not part of MonsterTemplate)
const monsterGoldDrops = new Map<string, [number, number]>();

interface BattleViewProps {
	currentPlayer: PlayerData;
	onBackToMap: () => void;
	onPlayerDeath: () => void;
	onMonsterDefeated: (exp: number, gold: number) => void;
}

export function BattleView({
	currentPlayer,
	onBackToMap,
	onPlayerDeath,
	onMonsterDefeated,
}: BattleViewProps) {
	const battleState = useAtomValue(battleStateAtom);
	const battleEntities = useAtomValue(battleEntitiesAtom);
	const battleLog = useAtomValue(battleEventsAtom);
	const deathState = useAtomValue(deathStateAtom);

	const setBattleState = useAtomSet(battleStateAtom);
	const setBattleEvents = useAtomSet(battleEventsAtom);
	const setBattleEntities = useAtomSet(battleEntitiesAtom);
	const setLogIdCounter = useAtomSet(logIdCounterAtom);
	const setDeathState = useAtomSet(deathStateAtom);

	const turnSpeed = 500; // Fixed turn speed for auto-battle
	const handledBattleIdRef = React.useRef<number | null>(null);
	const onPlayerDeathRef = React.useRef(onPlayerDeath);
	const onMonsterDefeatedRef = React.useRef(onMonsterDefeated);

	const statsWithInventory = useAtomValue(statsWithInventoryAtom);

	// Get random monster from current location
	const getRandomMonster = React.useCallback((): MonsterData | null => {
		const location = getLocationById(currentPlayer.location);
		if (!location || location.monsters.length === 0) {
			return null;
		}
		const randomIndex = Math.floor(Math.random() * location.monsters.length);
		return location.monsters[randomIndex] ?? null;
	}, [currentPlayer.location]);

	// Start a new battle with a random monster
	const startNewBattle = React.useCallback(async () => {
		const monsterData = getRandomMonster();
		if (!monsterData) {
			console.warn("No monsters available at current location");
			return;
		}

		const newBattleId = (battleState?.battleId ?? 0) + 1;
		const newHero = new HeroBattleInstance(currentPlayer, {
			...statsWithInventory,
		});
		const monsterTemplate = convertToMonsterTemplate(monsterData);
		const newMonster = new Monster(monsterTemplate);

		// Store gold drop for this monster
		monsterGoldDrops.set(monsterData.id, monsterData.stats.goldDrop);

		// Create battle system
		const program = Effect.gen(function* () {
			const battle = yield* BattleSystem.make(newHero, newMonster);
			yield* battle.start();
			return battle;
		});

		const battle = await Effect.runPromise(program);

		// Update atoms
		setBattleEntities({
			hero: newHero,
			monster: newMonster,
			battleSystem: battle,
		});

		setBattleState({
			isRunning: true,
			battleId: newBattleId,
			turnSpeed,
			selectedMonster: monsterData.id,
		});
	}, [
		currentPlayer,
		battleState?.battleId,
		getRandomMonster,
		setBattleEntities,
		setBattleState,
		statsWithInventory,
	]);

	const startNewBattleRef = React.useRef(startNewBattle);

	React.useEffect(() => {
		onPlayerDeathRef.current = onPlayerDeath;
		onMonsterDefeatedRef.current = onMonsterDefeated;
		startNewBattleRef.current = startNewBattle;
	}, [onPlayerDeath, onMonsterDefeated, startNewBattle]);

	// Start initial battle on mount or location change
	React.useEffect(() => {
		if (!battleState?.isRunning) {
			setBattleEvents([]);
			setLogIdCounter(0);
			startNewBattle();
		}
	}, [
		battleState?.isRunning,
		setBattleEvents,
		setLogIdCounter,
		startNewBattle,
	]); // Restart when location changes

	// Battle loop effect
	React.useEffect(() => {
		if (!battleState?.isRunning || !battleEntities.battleSystem) {
			return;
		}

		const battle = battleEntities.battleSystem;
		let battleLoopFiber: Fiber.RuntimeFiber<unknown, never> | null = null;
		let eventStreamFiber: Fiber.RuntimeFiber<void, never> | null = null;

		// Battle loop
		const battleLoop = Effect.gen(function* () {
			const battleId = battleState?.battleId ?? null;
			const finished = yield* battle.isFinished();
			if (finished) {
				if (handledBattleIdRef.current === battleId) {
					return true;
				}
				handledBattleIdRef.current = battleId;

				// Check who won
				const heroAlive = battleEntities.hero
					? battleEntities.hero.combatStats.health > 0
					: false;
				const monsterAlive = battleEntities.monster
					? battleEntities.monster.combatStats.health > 0
					: false;

				if (!heroAlive) {
					// Player died
					setDeathState({
						isDead: true,
						deathTime: Date.now(),
					});
					onPlayerDeathRef.current();

					// Wait 5 seconds then revive and start new battle
					setTimeout(() => {
						setDeathState({
							isDead: false,
							deathTime: null,
						});
						// Start new battle after revival
						startNewBattleRef.current();
					}, 5000);
				} else if (!monsterAlive) {
					// Monster defeated - get rewards
					const monster = battleEntities.monster as Monster;
					const exp = monster.expReward || 0;
					const goldDrop = monsterGoldDrops.get(monster.name) || [0, 0];
					const [goldMin, goldMax] = goldDrop;
					const gold =
						Math.floor(Math.random() * (goldMax - goldMin + 1)) + goldMin;

					onMonsterDefeatedRef.current(exp, gold);

					//		Auto-start new battle after short delay
					setTimeout(() => {
						startNewBattle();
					}, 1500);
				}

				return true;
			}

			const waitingForInput = yield* battle.isWaitingForPlayerInput();
			if (waitingForInput) {
				yield* battle.playerAttack();
			} else {
				yield* battle.tick();
			}

			return false;
		}).pipe(
			Effect.repeat(
				Schedule.spaced(Duration.millis(turnSpeed)).pipe(
					Schedule.intersect(Schedule.recurWhile((finished) => !finished)),
				),
			),
		);

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
		battleState?.battleId,
		battleEntities.battleSystem,
		battleEntities.hero,
		battleEntities.monster,
		setBattleEvents,
		setLogIdCounter,
		setDeathState,
		startNewBattle,
	]);

	return (
		<div className="h-full space-y-4 relative">
			{/* Death Overlay */}
			{deathState.isDead && (
				<div className="absolute inset-0 bg-gray-900/80 z-50 flex items-center justify-center">
					<Card className="p-8 text-center">
						<h2 className="text-3xl font-bold text-red-500 mb-4">You Died</h2>
						<p className="text-muted-foreground">Respawning in 5 seconds...</p>
					</Card>
				</div>
			)}

			{/* Back to Map Button */}
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">Battle Arena</h2>
				<Button onClick={onBackToMap} variant="outline">
					Back to Map
				</Button>
			</div>

			{/* Battle Arena */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<SimpleCombatantCard
					combatant={battleEntities.hero}
					icon="🦸"
					variant="hero"
					emptyMessage="Loading hero..."
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
					emptyMessage="Loading monster..."
					additionalInfo={
						battleEntities.monster
							? { "📊 LVL": (battleEntities.monster as Monster).level }
							: undefined
					}
				/>
			</div>

			{/* Battle Log */}
			<BattleLog logs={battleLog} />
		</div>
	);
}
