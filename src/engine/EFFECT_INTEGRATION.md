# Effect.ts Integration with Battle System

This document describes how the battle system integrates with Effect.ts for functional programming patterns.

## Overview

The battle system now has two implementations:
1. **Promise-based** (`BattleSystem`) - Uses standard JavaScript Promises and ReadableStream
2. **Effect-based** (`BattleSystemEffect`) - Uses Effect.ts for functional error handling and concurrency

## Why Effect.ts?

Effect.ts provides:
- **Type-safe error handling** - Errors are part of the type signature
- **Resource management** - Automatic cleanup via Effect's resource system
- **Concurrency** - Built-in support for concurrent and parallel operations
- **Composability** - Effects can be easily composed and transformed
- **Testability** - Pure functional approach makes testing easier

## Effect-Based Components

### 1. BattleErrors (`battle-errors.ts`)

Type-safe error types using Effect's `Data.TaggedError`:

```typescript
class InvalidActionError extends Data.TaggedError("InvalidActionError")<{
	action: string;
	currentState: string;
	message: string;
}> {}
```

**Error Types:**
- `BattleNotStartedError` - Battle hasn't been initialized
- `InvalidActionError` - Invalid action for current state
- `EntityDeadError` - Entity is already dead
- `BattleAlreadyFinishedError` - Battle has already ended

### 2. BattleFSMEffect (`battle-fsm-effect.ts`)

Effect-based Finite State Machine using:
- **`Ref.Ref`** - Mutable references for battle context
- **`Queue.Queue`** - Event queue for streaming
- **`Effect.Effect`** - All operations return Effects
- **`Stream.Stream`** - Event streaming

**Key Methods:**
```typescript
class BattleFSMEffect {
	static make(player: Entity, enemy: Entity, expReward: number): Effect.Effect<BattleFSMEffect>
	getState(): Effect.Effect<BattleState>
	initialize(): Effect.Effect<void>
	executeAction(action: BattleAction): Effect.Effect<void, InvalidActionError>
	getEventStream(): Stream.Stream<BattleEvent>
}
```

### 3. BattleSystemEffect (`battle-system-effect.ts`)

High-level API for running battles:

```typescript
class BattleSystemEffect {
	static make(player: Entity, enemy: Monster): Effect.Effect<BattleSystemEffect>
	static runBattle(player: Entity, enemy: Monster): Effect.Effect<BattleResultEffect>
	runAutoBattle(): Effect.Effect<BattleResultEffect>
	getEventStream(): Stream.Stream<BattleEvent>
}
```

## Usage Examples

### Basic Battle

```typescript
import { Effect } from "effect";
import { BattleSystemEffect, Monster, MONSTER_TEMPLATES } from "./engine";

const runBattle = Effect.gen(function* () {
	const player = createPlayer();
	const enemy = new Monster(MONSTER_TEMPLATES.GOBLIN);

	const result = yield* BattleSystemEffect.runBattle(player, enemy);

	console.log(`Victory: ${result.victory}`);
	console.log(`EXP Gained: ${result.expGained}`);
	console.log(`Turns: ${result.turnCount}`);

	return result;
});

// Run the Effect
await Effect.runPromise(runBattle);
```

### Event Streaming

```typescript
import { Effect, Stream } from "effect";

const battleWithEvents = Effect.gen(function* () {
	const battle = yield* BattleSystemEffect.make(player, enemy);
	const eventStream = battle.getEventStream();

	// Process events in real-time
	yield* Effect.fork(
		Stream.runForEach(eventStream, (event) =>
			Effect.sync(() => {
				console.log(`Event: ${event.type}`);
			})
		)
	);

	return yield* battle.runAutoBattle();
});
```

### Concurrent Battles

Effect makes running multiple battles concurrently trivial:

```typescript
import { Effect } from "effect";

const runConcurrentBattles = Effect.gen(function* () {
	const player1 = createPlayer();
	const player2 = createPlayer();
	const player3 = createPlayer();

	const enemy1 = new Monster(MONSTER_TEMPLATES.SLIME);
	const enemy2 = new Monster(MONSTER_TEMPLATES.GOBLIN);
	const enemy3 = new Monster(MONSTER_TEMPLATES.WOLF);

	// Run all battles concurrently
	const [result1, result2, result3] = yield* Effect.all(
		[
			BattleSystemEffect.runBattle(player1, enemy1),
			BattleSystemEffect.runBattle(player2, enemy2),
			BattleSystemEffect.runBattle(player3, enemy3),
		],
		{ concurrency: "unbounded" }
	);

	return [result1, result2, result3];
});

await Effect.runPromise(runConcurrentBattles);
```

### Error Handling

Effect provides type-safe error handling:

```typescript
import { Effect } from "effect";

const battleWithErrorHandling = Effect.gen(function* () {
	const battle = yield* BattleSystemEffect.make(player, enemy);

	yield* battle.start();

	// This returns Effect<void, InvalidActionError>
	const attackResult = yield* battle.playerAttack();

	return yield* battle.runAutoBattle();
}).pipe(
	Effect.catchAll((error) => {
		if (error._tag === "InvalidActionError") {
			console.error(`Invalid action: ${error.message}`);
			return Effect.succeed(null);
		}
		return Effect.fail(error);
	})
);
```

### Sequential Battles (Campaign)

```typescript
const runCampaign = Effect.gen(function* () {
	const player = createPlayer();
	const results = [];

	for (let i = 1; i <= 5; i++) {
		const monsterTemplate = getRandomMonster(i);
		const enemy = new Monster(monsterTemplate);

		console.log(`Battle ${i}: vs ${enemy.name}`);

		const result = yield* BattleSystemEffect.runBattle(player, enemy);
		results.push(result);

		if (!player.isAlive()) {
			console.log("Player defeated!");
			break;
		}

		// Heal player between battles
		player.combatStats.health = player.combatStats.maxHealth;
	}

	return results;
});

const results = await Effect.runPromise(runCampaign);
console.log(`Completed ${results.length} battles`);
```

## Comparison: Promise vs Effect

### Promise-Based
```typescript
const battle = new BattleSystem(player, enemy);
battle.subscribe((event) => console.log(event));
const result = await battle.runAutoBattle();
```

**Pros:**
- Familiar Promise API
- No learning curve
- Simple to use

**Cons:**
- No type-safe error handling
- Manual resource cleanup
- Limited composability

### Effect-Based
```typescript
const battle = await Effect.runPromise(
	BattleSystemEffect.runBattle(player, enemy)
);
```

**Pros:**
- Type-safe errors in signatures
- Automatic resource management
- Built-in concurrency support
- Highly composable
- Pure functional approach

**Cons:**
- Learning curve for Effect.ts
- More verbose for simple cases
- Requires understanding of Effect primitives

## Effect Patterns Used

### 1. Ref for Mutable State

```typescript
const contextRef = yield* Ref.make<BattleContext>({ /* initial state */ });
const context = yield* Ref.get(contextRef);
yield* Ref.set(contextRef, { ...context, turnNumber: context.turnNumber + 1 });
```

### 2. Queue for Event Streaming

```typescript
const eventQueue = yield* Queue.unbounded<BattleEvent>();
yield* Queue.offer(eventQueue, event);
const stream = Stream.fromQueue(eventQueue);
```

### 3. Effect.gen for Sequential Operations

```typescript
Effect.gen(function* () {
	yield* step1();
	yield* step2();
	return yield* step3();
});
```

### 4. Effect.all for Concurrent Operations

```typescript
Effect.all([effect1, effect2, effect3], { concurrency: "unbounded" });
```

### 5. Effect.fork for Background Tasks

```typescript
const fiber = yield* Effect.fork(backgroundTask);
// Continue with other work
yield* Fiber.join(fiber); // Wait for completion
```

## Testing with Effect

Effect makes testing more predictable:

```typescript
test("should handle battle correctly", async () => {
	const program = Effect.gen(function* () {
		const battle = yield* BattleSystemEffect.make(player, enemy);
		return yield* battle.runAutoBattle();
	});

	const result = await Effect.runPromise(program);

	expect(result.victory).toBe(true);
});
```

## Performance Considerations

- **Memory**: Effect adds minimal overhead (< 1KB per effect)
- **Speed**: Comparable to Promise-based implementation
- **Concurrency**: Effect's fiber-based concurrency is more efficient than Promise.all for many concurrent operations

## Future Enhancements

Potential improvements using Effect:

1. **Retry Logic**: `Effect.retry` for flaky operations
2. **Timeouts**: `Effect.timeout` for battle time limits
3. **Layers**: Dependency injection for battle services
4. **Schedules**: `Schedule` for turn-based timing
5. **Scope**: Better resource management for complex battles

## When to Use Effect-Based Battle System

**Use Effect-Based when:**
- Running multiple battles concurrently
- Need type-safe error handling
- Building complex battle sequences
- Composing battles with other Effects
- Need better testability

**Use Promise-Based when:**
- Simple, single battles
- Integrating with Promise-based code
- Team is unfamiliar with Effect.ts
- Prototyping quickly

## Resources

- [Effect.ts Documentation](https://effect.website/)
- [Effect.ts GitHub](https://github.com/Effect-TS/effect)
- [Effect Schema](https://effect.website/docs/schema/introduction)
- [Effect Concurrency](https://effect.website/docs/guides/concurrency)
