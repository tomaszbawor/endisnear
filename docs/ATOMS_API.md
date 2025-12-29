# Atoms API Reference

Complete reference for all atoms and custom hooks in this project.

## Custom Hooks

### useEffectSubscription

Run an Effect in component lifecycle with automatic cleanup.

```typescript
function useEffectSubscription<A, E>(
  effect: Effect.Effect<A, E>,
  deps: React.DependencyList
): void
```

**Example:**
```typescript
useEffectSubscription(
  Effect.gen(function* () {
    yield* Effect.log("Component mounted");
    yield* someEffect();
  }),
  [] // Run once on mount
);
```

### useStream

Consume an Effect Stream and return the latest value.

```typescript
function useStream<A, E>(
  stream: Stream.Stream<A, E>,
  initialValue?: A
): A | undefined
```

**Example:**
```typescript
const eventStream = battle.getEventStream();
const latestEvent = useStream(eventStream);
```

### useFiber

Manage an Effect Fiber with automatic cleanup.

```typescript
function useFiber<A, E>(
  effect: Effect.Effect<A, E>,
  deps: React.DependencyList
): Fiber.RuntimeFiber<A, E> | null
```

**Example:**
```typescript
const battleLoop = Effect.repeat(
  battleTick,
  Schedule.spaced("500 millis")
);

const fiber = useFiber(battleLoop, [battleId]);
```

## Global Atoms

### gameConfigAtom

Game settings with localStorage persistence.

**Type:**
```typescript
{
  volume: number;        // 0-100
  isFullscreen: boolean;
}
```

**Usage:**
```typescript
import { gameConfigAtom } from "@/state/gameConfig";

const settings = useAtomValue(gameConfigAtom);
const setSettings = useAtomSet(gameConfigAtom);

setSettings({ volume: 75, isFullscreen: true });
```

**Storage:** Persisted to `localStorage` under key `"ein-settings"`

### gameSavesAtom

Game save slots (2 slots).

**Type:**
```typescript
[GameSave | null, GameSave | null]

interface GameSave {
  playerName: string;
  location: string;
  timePlayed: string;
}
```

**Usage:**
```typescript
import { useSavesValues, useSavesSet } from "@/state/gameSaves";

const saves = useSavesValues();
const setSaves = useSavesSet();
```

**Storage:** Persisted to `localStorage` under key `"ein-saves"`

### hasSaveAtom

Computed atom - checks if any save exists.

**Type:** `boolean`

**Usage:**
```typescript
import { hasSaveAtom } from "@/state/gameSaves";

const hasSave = useAtomValue(hasSaveAtom);
// true if either save slot is non-null
```

**Read-only:** Cannot be set directly (computed from gameSavesAtom)

## Battle Atoms

### battleStateAtom

Tracks current battle configuration and status.

**Type:**
```typescript
{
  isRunning: boolean;
  battleId: number;
  turnSpeed: number;
  selectedMonster: string;
} | null
```

**Usage:**
```typescript
import { battleStateAtom } from "@/state/battleAtoms";

const battleState = useAtomValue(battleStateAtom);
const setBattleState = useAtomSet(battleStateAtom);

setBattleState({
  isRunning: true,
  battleId: 1,
  turnSpeed: 500,
  selectedMonster: "SLIME"
});
```

### battleEntitiesAtom

Stores active battle participants and system.

**Type:**
```typescript
{
  hero: Entity | null;
  monster: Entity | null;
  battleSystem: BattleSystem | null;
}
```

**Usage:**
```typescript
import { battleEntitiesAtom } from "@/state/battleAtoms";

const entities = useAtomValue(battleEntitiesAtom);
const setEntities = useAtomSet(battleEntitiesAtom);

setEntities({
  hero: newHero,
  monster: newMonster,
  battleSystem: battle
});
```

### battleEventsAtom

Battle log entries (formatted strings).

**Type:** `string[]`

**Format:** `"id|[timestamp] message"`

**Usage:**
```typescript
import { battleEventsAtom } from "@/state/battleAtoms";

const events = useAtomValue(battleEventsAtom);
const setEvents = useAtomSet(battleEventsAtom);

// Add new event (keep last 20)
setEvents((prev) => [...prev, newEvent].slice(-20));
```

## BattleManager Service

Effect-based service for managing battle loops.

### BattleManager.make

Create a new BattleManager instance.

```typescript
static make(
  battleSystem: BattleSystem,
  turnSpeed: number,
  callbacks: BattleCallbacks
): Effect.Effect<BattleManager>
```

**Parameters:**
- `battleSystem`: BattleSystem instance
- `turnSpeed`: Battle tick speed in milliseconds
- `callbacks`: Event and finish callbacks

**Example:**
```typescript
const manager = yield* BattleManager.make(battle, 500, {
  onEventLog: (event) => console.log(event),
  onBattleFinish: () => console.log("Done!")
});
```

### BattleManager#start

Start the battle loop and event streaming.

```typescript
start(): Effect.Effect<void>
```

**Example:**
```typescript
yield* manager.start();
```

### BattleManager#stop

Stop the battle loop and cleanup resources.

```typescript
stop(): Effect.Effect<void>
```

**Example:**
```typescript
yield* manager.stop();
```

### BattleCallbacks

Interface for battle event callbacks.

```typescript
interface BattleCallbacks {
  onEventLog: (formattedEvent: string) => void;
  onBattleFinish: () => void;
}
```

## Utility Functions

### formatBattleEvent

Format a BattleEvent into a log string.

```typescript
function formatBattleEvent(
  event: BattleEvent,
  logId: number
): string
```

**Returns:** `"id|[timestamp] message"`

**Example:**
```typescript
import { formatBattleEvent } from "@/utils/battleEventFormatter";

const formatted = formatBattleEvent(event, 0);
// "0|[14:23:45] ⚔️ Hero attacks Slime!"
```

## Atom Runtime

### atomRuntime

Global runtime for atoms with localStorage persistence.

```typescript
import { atomRuntime } from "@/state/atomRuntime";
```

**Used internally by:**
- `gameConfigAtom`
- `gameSavesAtom`

## Type Definitions

### Entity

```typescript
interface Entity {
  name: string;
  stats: Stats;
  combatStats: CombatStats;
}
```

### Stats

```typescript
interface Stats {
  strength: number;
  dexterity: number;
  intelligence: number;
  willpower: number;
  luck: number;
}
```

### CombatStats

```typescript
interface CombatStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}
```

## Examples

### Complete Battle Flow

```typescript
import { Effect } from "effect";
import { BattleSystem } from "@/engine/battle-system";
import { BattleManager } from "@/services/BattleManager";
import { battleStateAtom, battleEventsAtom } from "@/state/battleAtoms";

// In component
const startBattle = async () => {
  const program = Effect.gen(function* () {
    // Create battle system
    const battle = yield* BattleSystem.make(hero, monster);

    // Create manager with callbacks
    const manager = yield* BattleManager.make(battle, 500, {
      onEventLog: (event) => {
        setBattleEvents((prev) => [...prev, event].slice(-20));
      },
      onBattleFinish: () => {
        setBattleState((s) => s ? { ...s, isRunning: false } : null);
      }
    });

    // Start battle
    yield* manager.start();

    return manager;
  });

  const manager = await Effect.runPromise(program);
  setBattleManager(manager);
};
```

### Testing Atoms

```typescript
import { test, expect } from "bun:test";
import { Effect } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { battleStateAtom } from "@/state/battleAtoms";

test("battle state updates", async () => {
  const program = Effect.gen(function* () {
    yield* Atom.set(battleStateAtom, {
      isRunning: true,
      battleId: 1,
      turnSpeed: 500,
      selectedMonster: "SLIME"
    });

    const state = yield* Atom.get(battleStateAtom);
    return state;
  });

  const state = await Effect.runPromise(program);
  expect(state?.isRunning).toBe(true);
  expect(state?.battleId).toBe(1);
});
```

## See Also

- [Effect Patterns](./EFFECT_PATTERNS.md) - Best practices and patterns
- [Migration Guide](./MIGRATION_GUIDE.md) - How to migrate from React state
- [Effect Documentation](https://effect.website/) - Official Effect docs
