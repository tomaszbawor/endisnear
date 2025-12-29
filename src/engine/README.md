# Battle Engine

A comprehensive, Effect.ts-powered battle system for turn-based combat.

## Features

- **Effect.ts Integration** - Functional programming with type-safe error handling
- **Finite State Machine** - Predictable battle flow with FSM architecture
- **Event Streaming** - Real-time battle events via Effect.Stream
- **Concurrent Battles** - Run multiple battles simultaneously using Effect.all
- **10 Monster Types** - Diverse enemies from Slime to Dragon
- **Design Patterns** - State, Observer, Strategy, Template Method, and Factory patterns

## Quick Start

### Simple Battle

```typescript
import { Effect } from "effect";
import { BattleSystem } from "./engine";

const player = createYourPlayer();
const enemy = new Monster(MONSTER_TEMPLATES.GOBLIN);

const result = await Effect.runPromise(
  BattleSystem.runBattle(player, enemy)
);

console.log(result.victory ? "Won!" : "Lost!");
```

### Concurrent Battles

```typescript
import { Effect } from "effect";

const [r1, r2, r3] = await Effect.runPromise(
  Effect.all([
    BattleSystem.runBattle(player1, enemy1),
    BattleSystem.runBattle(player2, enemy2),
    BattleSystem.runBattle(player3, enemy3),
  ], { concurrency: "unbounded" })
);
```

## Demo Files

Run the examples to see the battle system in action:

```bash
# Simple one-on-one battle
bun src/engine/battle-demo-simple.ts

# Campaign mode (sequential battles)
bun src/engine/battle-demo-campaign.ts

# Concurrent battles
bun src/engine/battle-demo-concurrent.ts

# Complete examples with event streaming
bun src/engine/battle-example.ts
```

## Architecture

- **`battle-fsm.ts`** - Finite State Machine with Effect.ts primitives
- **`battle-system.ts`** - High-level API for running battles
- **`battle-events.ts`** - Type-safe event definitions
- **`battle-errors.ts`** - Tagged errors for type-safe error handling
- **`entity.ts`** - Base entity class for players and monsters
- **`monster.ts`** - Monster entity implementation
- **`monster-database.ts`** - 10 pre-configured monsters

## Testing

```bash
bun test src/engine/battle-system.test.ts
```

All tests passing (6/6 active tests, 3 skipped).

## Documentation

- **[BATTLE_SYSTEM.md](./BATTLE_SYSTEM.md)** - Complete architecture guide
- **[EFFECT_INTEGRATION.md](./EFFECT_INTEGRATION.md)** - Effect.ts usage guide

## Monsters

| Monster | Level | HP | ATK | DEF | SPD | EXP |
|---------|-------|----|----|-----|-----|-----|
| Slime | 1 | 20 | 3 | 1 | 3 | 10 |
| Goblin | 2 | 35 | 6 | 2 | 7 | 20 |
| Skeleton | 3 | 40 | 7 | 2 | 6 | 25 |
| Wolf | 3 | 45 | 8 | 3 | 9 | 30 |
| Orc | 4 | 70 | 12 | 5 | 5 | 50 |
| Spider | 4 | 50 | 10 | 3 | 10 | 40 |
| Troll | 5 | 100 | 15 | 8 | 4 | 75 |
| Dark Knight | 6 | 120 | 18 | 10 | 8 | 100 |
| Demon | 7 | 150 | 22 | 12 | 11 | 150 |
| Dragon | 10 | 300 | 35 | 20 | 12 | 500 |

## Code Quality

Always run before committing:

```bash
bun run check
```

This runs type checking, linting, tests, and build verification.
